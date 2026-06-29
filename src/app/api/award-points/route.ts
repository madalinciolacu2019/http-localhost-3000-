import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { safeStringSchema, sanitizeInput } from '@/lib/security';
import { verifyAuth } from '@/lib/auth-server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy initialization to prevent build-time crashes
let supabaseAdmin: any = null;
const getSupabaseAdmin = () => {
  if (!supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
};

// 1. Strict Input Validation Schema
const awardPointsSchema = z.object({
  userId: z.string().min(1, "User ID is required").transform(sanitizeInput),
  points: z.number().min(1, "Must award at least 1 point").max(10000, "Cannot award more than 10,000 points at once"),
});

export async function POST(req: Request) {
  try {
    // 2. Authorization Check: Ensure only authenticated Admins/System can call this
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only paddock crew/CEO/Manager can award points
    const userRole = user.user_metadata.role;
    if (userRole !== 'CEO' && userRole !== 'MANAGER' && userRole !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden. Paddock credentials required.' }, { status: 403 });
    }

    const rawBody = await req.json();
    
    // 3. Validate & Sanitize Input
    const parseResult = awardPointsSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 });
    }
    
    const { userId, points } = parseResult.data;

    // Local Mock DB Mode (for demo / when Supabase isn't configured)
    if (!supabaseUrl || supabaseUrl === '') {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(process.cwd(), '.mock_points_db.json');
      
      let pointsDb: Record<string, { credits: number, xp: number }> = {};
      if (fs.existsSync(dbPath)) {
        try {
          pointsDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch(e) {}
      }

      if (!pointsDb[userId]) {
        pointsDb[userId] = { credits: 1250, xp: 3200 }; // Default mock starting points
      }

      // Apply VIP multiplier randomly for mock demo if we don't know
      const finalPoints = points;
      const newCredits = pointsDb[userId].credits + finalPoints;
      const newXp = pointsDb[userId].xp + finalPoints;
      
      pointsDb[userId] = { credits: newCredits, xp: newXp };
      fs.writeFileSync(dbPath, JSON.stringify(pointsDb));

      return NextResponse.json({ 
        success: true, 
        awarded: finalPoints,
        isVip: false,
        newCredits
      });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // First fetch the user's current profile to get current points and VIP status
    const { data: profile, error: fetchError } = (await adminClient
      .from('profiles')
      .select('credits, xp, is_vip, level')
      .eq('id', userId)
      .single()) as { data: any; error: any };

    if (fetchError || !profile) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check auth metadata as fallback for VIP
    const { data: { user: dbUser } } = await adminClient.auth.admin.getUserById(userId);
    const isVip = (profile as any)?.is_vip || dbUser?.user_metadata?.is_vip === true;

    // Apply VIP Multiplier
    const finalPoints = isVip ? points * 2 : points;

    const newCredits = (profile.credits || 0) + finalPoints;
    const newXp = (profile.xp || 0) + finalPoints;
    
    // Level up logic: every 1000 XP is a new level
    const newLevel = Math.max(profile.level || 1, Math.floor(newXp / 1000) + 1);

    // Update the profile
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        credits: newCredits,
        xp: newXp,
        level: newLevel
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      awarded: finalPoints,
      isVip,
      newCredits
    });

  } catch (error) {
    console.error('Award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
