import { NextRequest, NextResponse } from 'next/server';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const isStripeConfigured = stripeKey && !stripeKey.includes('placeholder') && stripeKey.startsWith('sk_');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  if (!isStripeConfigured) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' as any });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

    return NextResponse.json({
      id: session.id,
      ref: session.id.slice(-10).toUpperCase(),
      total: (session.amount_total ?? 0) / 100,
      currency: session.currency?.toUpperCase() ?? 'EUR',
      status: session.payment_status,
      customerEmail: session.customer_details?.email ?? null,
      items,
      created: session.created,
    });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch order' }, { status: 500 });
  }
}
