import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/lib/auth-server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify that user is accessing their own data or is CEO/Manager
    if (user.id !== userId && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ wishlist: [] });
    }

    const { data, error: dbError } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    if (dbError) throw dbError;

    const productIds = data.map(item => item.product_id);
    return NextResponse.json({ wishlist: productIds });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing userId or productId' }, { status: 400 });
    }

    // Verify that user is modifying their own data or is CEO/Manager
    if (user.id !== userId && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, toggled: true });
    }

    // Check if item exists in wishlist
    const { data: existing } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      // Remove it
      const { error: dbError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (dbError) throw dbError;
      return NextResponse.json({ success: true, status: 'removed' });
    } else {
      // Add it
      const { error: dbError } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: parseInt(productId)
        });

      if (dbError) throw dbError;
      return NextResponse.json({ success: true, status: 'added' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

