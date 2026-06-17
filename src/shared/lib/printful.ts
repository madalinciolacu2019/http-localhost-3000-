/**
 * Printful API Client
 * Handles print-on-demand fulfillment for APEX BREWS merchandise.
 *
 * Setup:
 * 1. Create a free account at printful.com
 * 2. Go to Dashboard → Settings → API → Generate Token
 * 3. Add PRINTFUL_API_KEY to .env.local
 * 4. Create your products in Printful, upload the APEX BREWS design,
 *    and fill in the variant IDs below for each size.
 */

const PRINTFUL_BASE_URL = 'https://api.printful.com';

// ─── Product → Printful Variant ID Mapping ──────────────────────────────────
// After setting up products in your Printful dashboard, fill in the variant IDs
// for each product name + size combination. You find variant IDs in:
//   Printful Dashboard → Products → [your product] → Sync → Variant ID column
//
// Leave as 0 until you have real IDs — sandbox mode will skip Printful calls.
export const PRINTFUL_VARIANT_IDS: Record<string, Record<string, number>> = {
  'Scuderia Ferrari Team T-Shirt': {
    S: 0,   // e.g. 4018 — replace with your actual Printful variant ID
    M: 0,   // e.g. 4019
    L: 0,   // e.g. 4020
    XL: 0,  // e.g. 4021
  },
  'Red Bull Racing Team Hoodie': {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  },
  'Mercedes-AMG Petronas F1 Team Cap': {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  },
  'Visa Cash App RB Driving Gloves': {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const apiKey = process.env.PRINTFUL_API_KEY || '';

export const isPrintfulConfigured = (): boolean =>
  !!apiKey &&
  apiKey !== 'your_printful_api_key_here' &&
  apiKey.length > 10;

async function printfulFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PRINTFUL_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Printful API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.result as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrintfulRecipient {
  name: string;
  address1: string;
  city: string;
  zip: string;
  country_code: string; // ISO 3166-1 alpha-2, e.g. "RO", "IT", "US"
  email?: string;
  phone?: string;
}

export interface PrintfulOrderItem {
  /** Printful variant ID from PRINTFUL_VARIANT_IDS */
  variant_id: number;
  quantity: number;
  /** Product name — used for Printful order notes */
  name?: string;
  /** Size selected by customer */
  size?: string;
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  status: string;
  shipping: string;
  created: number;
  updated: number;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  shipments?: Array<{
    id: number;
    carrier: string;
    service: string;
    tracking_number: string;
    tracking_url: string;
    ship_date: string;
    shipped_at: number;
    reshipment: boolean;
    location?: { city: string; zip: string; state: string; country: string };
  }>;
}

// ─── Create Order ─────────────────────────────────────────────────────────────

export interface CreatePrintfulOrderParams {
  externalId: string; // your Supabase order ID
  recipient: PrintfulRecipient;
  items: Array<{
    productName: string;
    size?: string;
    quantity: number;
    printfulVariantId?: string | number;
  }>;
  /** Set true to confirm immediately (production). False = draft order. */
  confirm?: boolean;
}

export interface CreatePrintfulOrderResult {
  success: boolean;
  printfulOrderId?: number;
  status?: string;
  /** Set when Printful is not configured — order was skipped */
  skipped?: boolean;
  /** Reason the order was skipped */
  skipReason?: string;
  error?: string;
}

export async function createPrintfulOrder(
  params: CreatePrintfulOrderParams
): Promise<CreatePrintfulOrderResult> {
  if (!isPrintfulConfigured()) {
    return {
      success: true,
      skipped: true,
      skipReason: 'PRINTFUL_API_KEY not configured — order saved to Supabase only.',
    };
  }

  // Build line items, skipping any product whose variant IDs are not filled in
  const lineItems: Array<{ variant_id: number; quantity: number }> = [];
  const skippedItems: string[] = [];

  for (const item of params.items) {
    if (item.printfulVariantId) {
      lineItems.push({ variant_id: Number(item.printfulVariantId), quantity: item.quantity });
      continue;
    }

    const variantMap = PRINTFUL_VARIANT_IDS[item.productName];
    if (!variantMap) {
      skippedItems.push(`${item.productName} (no variant map or DB id)`);
      continue;
    }
    const size = item.size || 'M';
    const variantId = variantMap[size];
    if (!variantId) {
      skippedItems.push(`${item.productName} size ${size} (variant ID = 0)`);
      continue;
    }
    lineItems.push({ variant_id: variantId, quantity: item.quantity });
  }

  // If all items were skipped (variant IDs not filled in yet) — sandbox mode
  if (lineItems.length === 0) {
    return {
      success: true,
      skipped: true,
      skipReason: `No Printful variant IDs configured yet. Skipped items: ${skippedItems.join(', ') || 'all'}.`,
    };
  }

  try {
    const order = await printfulFetch<PrintfulOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        external_id: params.externalId,
        shipping: 'STANDARD',
        recipient: params.recipient,
        items: lineItems,
        confirm: params.confirm ?? false, // draft by default — confirm manually in Printful dashboard
      }),
    });

    return {
      success: true,
      printfulOrderId: order.id,
      status: order.status,
    };
  } catch (err: any) {
    console.error('[Printful] createOrder failed:', err);
    return {
      success: false,
      error: err?.message || 'Unknown Printful error',
    };
  }
}

// ─── Get Order Status ─────────────────────────────────────────────────────────

export interface PrintfulOrderStatus {
  id: number;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  shippedAt?: number;
}

export async function getPrintfulOrderStatus(
  printfulOrderId: number
): Promise<PrintfulOrderStatus | null> {
  if (!isPrintfulConfigured()) return null;

  try {
    const order = await printfulFetch<PrintfulOrder>(`/orders/${printfulOrderId}`);
    const shipment = order.shipments?.[0];

    return {
      id: order.id,
      status: order.status,
      trackingNumber: shipment?.tracking_number,
      trackingUrl: shipment?.tracking_url,
      carrier: shipment?.carrier,
      shippedAt: shipment?.shipped_at,
    };
  } catch (err: any) {
    console.error('[Printful] getOrderStatus failed:', err);
    return null;
  }
}

// ─── Country Code Helpers ─────────────────────────────────────────────────────
// Printful requires ISO 3166-1 alpha-2 codes. Map common country names → codes.
export function toCountryCode(countryName: string): string {
  const map: Record<string, string> = {
    romania: 'RO',
    ro: 'RO',
    italy: 'IT',
    italia: 'IT',
    it: 'IT',
    germany: 'DE',
    deutschland: 'DE',
    de: 'DE',
    france: 'FR',
    fr: 'FR',
    'united kingdom': 'GB',
    uk: 'GB',
    gb: 'GB',
    'united states': 'US',
    usa: 'US',
    us: 'US',
    spain: 'ES',
    espana: 'ES',
    es: 'ES',
    netherlands: 'NL',
    nl: 'NL',
    belgium: 'BE',
    be: 'BE',
    austria: 'AT',
    at: 'AT',
    switzerland: 'CH',
    ch: 'CH',
    portugal: 'PT',
    pt: 'PT',
    monaco: 'MC',
    mc: 'MC',
    hungary: 'HU',
    hu: 'HU',
    singapore: 'SG',
    sg: 'SG',
    japan: 'JP',
    jp: 'JP',
    australia: 'AU',
    au: 'AU',
    canada: 'CA',
    ca: 'CA',
    mexico: 'MX',
    mx: 'MX',
    brazil: 'BR',
    brasil: 'BR',
    br: 'BR',
  };

  return map[countryName.toLowerCase()] ?? countryName.toUpperCase().slice(0, 2);
}
