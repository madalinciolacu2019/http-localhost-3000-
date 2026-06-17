import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';
import { createPrintfulOrder } from '@/shared/lib/printful';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const base = process.env.PAYPAL_ENV === 'live' ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await response.json();

    if (captureData.status === "COMPLETED") {
      // Payment successful! Extract custom_id payload
      const customIdStr = captureData.purchase_units[0].custom_id;
      if (customIdStr) {
        try {
          const payload = JSON.parse(customIdStr);

          // If there's physical merchandise, automatically forward to Printful
          if (payload.hasMerch === 'true' && payload.shipping) {
            const printfulItems = payload.items.map((i: any) => ({
              productName: i.name,
              quantity: i.qty,
              size: i.size || 'M',
              printfulVariantId: i.printful_variant_id
            }));

            // Sync with Printful API
            const printfulRes = await createPrintfulOrder({
              externalId: captureData.id,
              recipient: {
                name: payload.shipping.name || 'Valued Customer',
                address1: payload.shipping.address || '123 Test St',
                city: payload.shipping.city || 'Monza',
                zip: payload.shipping.zip || '20900',
                country_code: 'IT', // You would parse this from payload.shipping.country
                email: payload.shipping.email,
              },
              items: printfulItems,
              confirm: false, // Leave as draft so the shop owner can review it
            });

            console.log("Printful Sync Result:", printfulRes);
          }
        } catch(err) {
          console.error("Error parsing custom_id or syncing Printful", err);
        }
      }

      return NextResponse.json({ success: true, captureData });
    } else {
      return NextResponse.json({ success: false, captureData }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Capture error:', error);
    return NextResponse.json({ error: error?.message || 'Capture failed' }, { status: 500 });
  }
}
