import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { z } from 'zod';
import { safeStringSchema, safeEmailSchema } from '@/lib/security';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const base = process.env.PAYPAL_ENV === 'live' ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const isPayPalConfigured = PAYPAL_CLIENT_ID && PAYPAL_SECRET;

const checkoutSchema = z.object({
  items: z.array(z.object({
    product: z.object({
      id: z.number(),
      name: safeStringSchema,
      image: z.string().optional(),
      price: z.number(),
      category: safeStringSchema.optional(),
    }),
    quantity: z.number().min(1),
    size: safeStringSchema.optional(),
    isSubscription: z.boolean().optional(),
  })).min(1, "Cart is empty"),
  userId: safeStringSchema.optional(),
  referrerId: safeStringSchema.optional(),
  bundleDiscount: z.number().optional(),
  fulfillmentMethod: safeStringSchema.optional(),
  customerName: safeStringSchema.optional(),
  customerEmail: safeEmailSchema.optional().or(z.literal('')),
  customerPhone: safeStringSchema.optional(),
  shippingAddress: safeStringSchema.optional(),
  shippingCity: safeStringSchema.optional(),
  shippingPostcode: safeStringSchema.optional(),
  shippingCountry: safeStringSchema.optional(),
  shippingCost: z.number().optional(),
  vat: z.number().optional(),
  isB2B: z.boolean().optional(),
  billingName: safeStringSchema.optional(),
  billingCui: safeStringSchema.optional(),
  billingJ: safeStringSchema.optional(),
  billingIban: safeStringSchema.optional(),
  billingBank: safeStringSchema.optional(),
  billingAddress: safeStringSchema.optional(),
  billingCity: safeStringSchema.optional(),
  billingPostcode: safeStringSchema.optional(),
  billingCountry: safeStringSchema.optional(),
});

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
  if (!isPayPalConfigured) {
    return NextResponse.json(
      { error: 'PAYPAL_NOT_CONFIGURED', message: 'Add your PayPal API keys to .env.local to enable payments.' },
      { status: 503 }
    );
  }

  try {
    const rawBody = await req.json();
    const parseResult = checkoutSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parseResult.error.format() }, { status: 400 });
    }

    const data = parseResult.data;

    // Optional Auth Check
    const authHeader = req.headers.get('Authorization');
    if (isSupabaseConfigured && data.userId && data.userId !== 'guest' && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user || user.id !== data.userId) {
        return NextResponse.json({ error: 'Unauthorized or invalid token for this user' }, { status: 401 });
      }
    }

    // Verify inventory stock levels
    if (isSupabaseConfigured) {
      for (const item of data.items) {
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

    // Calculate total
    let total = 0;
    data.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    // Apply dummy 10% discount if bundle
    if (data.bundleDiscount && data.bundleDiscount > 0) {
      total = total * 0.9;
    }
    
    if (data.shippingCost) {
      total += data.shippingCost;
    }

    const hasMerch = data.items.some((i: any) => i.product.category === 'Merchandise');

    // Create PayPal Order
    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: total.toFixed(2),
            },
            custom_id: JSON.stringify({
              userId: data.userId || 'guest',
              hasMerch: String(hasMerch),
              items: data.items.map((i: any) => ({
                id: i.product.id,
                name: i.product.name,
                qty: i.quantity,
                size: i.size || null,
              })),
              shipping: {
                 name: data.customerName,
                 address: data.shippingAddress,
                 city: data.shippingCity,
                 country: data.shippingCountry,
                 zip: data.shippingPostcode,
                 email: data.customerEmail
              }
            }),
          },
        ],
      }),
    });

    const order = await response.json();
    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create checkout order' }, { status: 500 });
  }
}
