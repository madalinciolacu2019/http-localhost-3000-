import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/lib/auth-server';

// We need the service role key to bypass RLS and update the user's profile directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: any = null;
const getSupabaseAdmin = () => {
  if (!supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
};

export async function POST(req: Request) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Ensure they are upgrading their own profile or are CEO/Manager
    if (user.id !== userId && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    // Bypass DB if using placeholder keys
    if (supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json({ success: true, mocked: true });
    }

    // Update
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Process upgrade
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_vip: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    // Add 5000 bonus credits for becoming VIP!
    await adminClient.rpc('increment_credits', {
      user_id: userId,
      amount: 5000
    });

    // Update Auth user_metadata
    const { data: updatedUser, error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      { user_metadata: { is_vip: true } }
    );

    if (authError) {
      console.error('Auth update error:', authError);
      return NextResponse.json({ error: 'Failed to update user metadata' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

