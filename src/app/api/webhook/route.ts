import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

// Use service role key for server-side operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const userId = session.metadata?.userId;
      const itemsRaw = session.metadata?.items;
      const total = (session.amount_total ?? 0) / 100;

      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId !== 'guest' ? userId : null,
          status: 'confirmed',
          total_amount: total,
          stripe_session_id: session.id,
          shipping_address: (session as any).shipping_details || {},
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      if (itemsRaw && order) {
        const items = JSON.parse(itemsRaw);
        const orderItems = items.map((item: { product_id: number; quantity: number; price: number }) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Send confirmation email
        if (session.customer_details?.email) {
          await sendOrderConfirmationEmail(
            session.customer_details.email,
            order.id,
            total
          );
        }

        // Award ERS loyalty points & profile XP if not a guest purchase
        if (userId && userId !== 'guest') {
          const pointsEarned = Math.floor(total * 10);
          if (pointsEarned > 0) {
            // 1. Insert loyalty transaction log
            await supabase.from('loyalty_transactions').insert({
              user_id: userId,
              points_change: pointsEarned,
              transaction_type: 'purchase_credit',
              description: `Accrued from Purchase Order #${order.id.slice(-6)}`
            });

            // 2. Fetch current profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('xp, level, credits')
              .eq('id', userId)
              .maybeSingle();

            if (profile) {
              const nextCredits = (profile.credits || 0) + pointsEarned;
              const nextXp = (profile.xp || 0) + (pointsEarned * 2);
              const nextLevel = Math.floor(nextXp / 1000) + 1;

              await supabase
                .from('profiles')
                .update({
                  credits: nextCredits,
                  xp: nextXp,
                  level: nextLevel
                })
                .eq('id', userId);
            }
          }
        }
      }
    } catch (dbError) {
      console.error('Database error after payment:', dbError);
      // Don't return 500 — Stripe would retry the webhook
    }
  }

  return NextResponse.json({ received: true });
}
