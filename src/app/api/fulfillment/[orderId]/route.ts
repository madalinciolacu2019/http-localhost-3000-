import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPrintfulOrderStatus, isPrintfulConfigured } from '@/lib/printful';
import { verifyAuth } from '@/lib/auth-server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: any = null;
const getSupabase = () => {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
};

/**
 * GET /api/fulfillment/[orderId]
 *
 * Returns real-time fulfillment and shipping status for a given Supabase order ID.
 * Polls Printful for live data and caches tracking info back to Supabase.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { user, error: authError } = await verifyAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Fetch order from Supabase
    const { data: order, error } = await client
      .from('orders')
      .select(
        'id, user_id, status, fulfillment_status, printful_order_id, tracking_number, tracking_url'
      )
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure they own the order or are CEO/Manager
    if (order.user_id !== user.id && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

  const response = {
    orderId: order.id,
    status: order.status,
    fulfillmentStatus: order.fulfillment_status ?? 'not_required',
    printfulOrderId: order.printful_order_id ?? null,
    trackingNumber: order.tracking_number ?? null,
    trackingUrl: order.tracking_url ?? null,
    printfulConfigured: isPrintfulConfigured(),
    liveData: null as any,
  };

  // If we have a Printful order ID and Printful is configured, fetch live status
  if (order.printful_order_id && isPrintfulConfigured()) {
    const liveStatus = await getPrintfulOrderStatus(
      Number(order.printful_order_id)
    );

    if (liveStatus) {
      response.liveData = liveStatus;
      response.fulfillmentStatus = liveStatus.status;

      // Cache tracking info back to Supabase if it's new
      if (
        liveStatus.trackingNumber &&
        liveStatus.trackingNumber !== order.tracking_number
      ) {
        await client
          .from('orders')
          .update({
            tracking_number: liveStatus.trackingNumber,
            tracking_url: liveStatus.trackingUrl ?? null,
            fulfillment_status: liveStatus.status,
          })
          .eq('id', orderId);

        response.trackingNumber = liveStatus.trackingNumber;
        response.trackingUrl = liveStatus.trackingUrl ?? null;
      }
    }
  }

  return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
