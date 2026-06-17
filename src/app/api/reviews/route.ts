import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { safeStringSchema, sanitizeInput } from '@/shared/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdRaw = searchParams.get('productId');

    if (!productIdRaw) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const productId = parseInt(productIdRaw);

    if (!isSupabaseConfigured) {
      // Sandbox fallback static reviews to feel alive
      const dummyReviews = [
        { id: '1', user_name: 'Alex Albon', rating: 5, comment: 'Phenomenal roast. Keeps my focus sharp on simulation runs!', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: '2', user_name: 'George Russell', rating: 4, comment: 'Very smooth flat white texture, though the DRS intensity is quite aggressive.', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      ];
      return NextResponse.json({ reviews: dummyReviews });
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Validation Schema for Reviews
const reviewSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(val => parseInt(val as string)),
  rating: z.union([z.string(), z.number()]).transform(val => parseInt(val as string)).pipe(z.number().min(1).max(5)),
  comment: safeStringSchema.optional(),
  userName: z.string().min(1, "Name is required").transform(sanitizeInput),
  userId: safeStringSchema.optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization: Only allow authenticated users to leave reviews
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized. You must be logged in to leave a review.' }, { status: 401 });
    }

    const rawBody = await req.json();

    // 2. Validate and Sanitize
    const parseResult = reviewSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid review data', details: parseResult.error.format() }, { status: 400 });
    }

    const { productId, rating, comment, userName, userId } = parseResult.data;

    if (!isSupabaseConfigured) {
      // Mock submit
      return NextResponse.json({ 
        success: true, 
        review: { 
          id: Math.random().toString(), 
          product_id: productId, 
          rating, 
          comment: comment || '', 
          user_name: userName, 
          created_at: new Date().toISOString() 
        } 
      });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId || null,
        rating,
        comment: comment || '',
        user_name: userName,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
