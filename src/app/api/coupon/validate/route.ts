import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

// Fallback hardcoded values
const FALLBACK_COUPONS: Record<string, number> = {
  PITSTOP15: 0.15,
  PADDOCK10: 0.10,
  ERS20:     0.20,
  CHAMPION30: 0.30,
};

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 });
    }

    const formatted = code.trim().toUpperCase();

    // ── Supabase Live Check ────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      const { data: dbCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', formatted)
        .eq('active', true)
        .maybeSingle();

      if (dbCoupon) {
        return NextResponse.json({ 
          valid: true, 
          code: dbCoupon.code, 
          discountRate: Number(dbCoupon.discount_rate) 
        }, { status: 200 });
      }
    }

    // ── Fallback Hardcoded Check ───────────────────────────────────────────
    const rate = FALLBACK_COUPONS[formatted];

    if (rate === undefined) {
      return NextResponse.json({ valid: false, error: 'Coupon not found' }, { status: 200 });
    }

    return NextResponse.json({ valid: true, code: formatted, discountRate: rate }, { status: 200 });
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
