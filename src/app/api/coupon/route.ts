import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      // Return hardcoded ones for sandbox fallback
      const mockCoupons = [
        { code: 'PITSTOP15', discount_rate: 0.15, active: true },
        { code: 'PADDOCK10', discount_rate: 0.10, active: true },
        { code: 'ERS20', discount_rate: 0.20, active: true },
        { code: 'CHAMPION30', discount_rate: 0.30, active: true }
      ];
      return NextResponse.json({ coupons: mockCoupons });
    }

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, discountRate, userId } = await req.json();

    if (!code || discountRate === undefined) {
      return NextResponse.json({ error: 'Missing code or discountRate' }, { status: 400 });
    }

    const formattedCode = code.trim().toUpperCase();
    const rate = parseFloat(discountRate);

    if (isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json({ error: 'Discount rate must be between 0 and 1.0' }, { status: 400 });
    }

    // Security check: verify user is admin (if Supabase configured)
    if (isSupabaseConfigured && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Clearance level: Admin status required' }, { status: 403 });
      }
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ 
        success: true, 
        coupon: { code: formattedCode, discount_rate: rate, active: true }
      });
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: formattedCode,
        discount_rate: rate,
        active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
