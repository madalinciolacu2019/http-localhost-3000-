import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const isStripeConfigured = stripeKey && !stripeKey.includes('placeholder') && stripeKey.startsWith('sk_');

export async function POST(req: NextRequest) {
  // Guard: if Stripe isn't configured, return a helpful error
  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: 'STRIPE_NOT_CONFIGURED', message: 'Add your Stripe secret key to .env.local to enable payments.' },
      { status: 503 }
    );
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' as any });

    const { items, userId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Verify inventory stock levels
    if (isSupabaseConfigured) {
      for (const item of items) {
        const { data: dbProd } = await supabase
          .from('products')
          .select('stock_count, name')
          .eq('id', item.product.id)
          .single();

        if (dbProd && dbProd.stock_count < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for ${dbProd.name}. Current stock: ${dbProd.stock_count}` 
          }, { status: 400 });
        }
      }
    }

    const lineItems = items.map((item: {
      product: { name: string; image: string; price: number };
      quantity: number;
    }) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          images: item.product.image?.startsWith('http') ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        userId: userId || 'guest',
        items: JSON.stringify(
          items.map((i: { product: { id: number; name: string; price: number }; quantity: number }) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
