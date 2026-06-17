import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/shared/lib/auth-server';

// Use service role key to query order securely (RLS bypass)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await verifyAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    // Retrieve order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure they own the order or are CEO/Manager
    if (order.user_id !== user.id && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    // Retrieve order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to retrieve order items' }, { status: 500 });
    }

    // Map order items to matching success page format
    const formattedItems = items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name || `Product #${item.product_id}`,
      quantity: item.quantity,
      price: item.unit_price,
      size: item.size || null,
      category: item.product_category || '',
    }));

    return NextResponse.json({
      id: order.id,
      ref: order.stripe_session_id ? order.stripe_session_id.slice(-10).toUpperCase() : order.id.slice(-6).toUpperCase(),
      total: Number(order.total_amount),
      currency: 'EUR',
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      created: Math.floor(new Date(order.created_at).getTime() / 1000),
      fulfillmentMethod: order.fulfillment_method,
      shippingAddress: order.shipping_address?.line1 || '',
      shippingCity: order.shipping_address?.city || '',
      shippingPostcode: order.shipping_address?.postal_code || '',
      shippingCountry: order.shipping_address?.country || '',
      isB2B: !!order.billing_cui,
      billingName: order.billing_name,
      billingCui: order.billing_cui,
      billingJ: order.billing_j,
      billingIban: order.billing_iban,
      billingBank: order.billing_bank,
      billingAddress: order.billing_address?.line1 || '',
      billingCity: order.billing_address?.city || '',
      billingPostcode: order.billing_address?.postal_code || '',
      billingCountry: order.billing_address?.country || '',
      vat: Number(order.vat_amount),
      subtotal: Number(order.net_amount),
      invoice_number: order.invoice_number,
      items: formattedItems,
    });
  } catch (err: any) {
    console.error('Invoice API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
