import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, rigId, trackName, carName, lapTimeMs, sector1Ms, sector2Ms, sector3Ms, maxSpeedKmh } = await req.json();

    if (!trackName || !carName || !lapTimeMs) {
      return NextResponse.json({ error: 'Missing telemetry telemetry metrics.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && userId) {
      // 1. Insert telemetry log
      const { data: telemetryLog, error: logError } = await supabase
        .from('telemetry_logs')
        .insert({
          user_id: userId,
          rig_id: rigId || null,
          track_name: trackName,
          car_name: carName,
          lap_time_ms: parseInt(lapTimeMs),
          sector_1_ms: sector1Ms ? parseInt(sector1Ms) : null,
          sector_2_ms: sector2Ms ? parseInt(sector2Ms) : null,
          sector_3_ms: sector3Ms ? parseInt(sector3Ms) : null,
          max_speed_kmh: parseFloat(maxSpeedKmh)
        })
        .select()
        .single();

      if (logError) throw logError;

      // 2. Award XP and Credits based on lap performance
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level, credits')
        .eq('id', userId)
        .single();

      if (profile) {
        // Calculate points based on lap speed
        const baseXP = 250;
        const speedBonus = maxSpeedKmh > 300 ? 50 : 0;
        const lapBonus = lapTimeMs < 90000 ? 100 : 0; // sub-1:30 lap gives bonus
        const addedXP = baseXP + speedBonus + lapBonus;

        const nextXp = profile.xp + addedXP;
        const nextLevel = Math.floor(nextXp / 1000) + 1;
        const nextCredits = profile.credits + Math.floor(addedXP / 5);

        await supabase
          .from('profiles')
          .update({
            xp: nextXp,
            level: nextLevel,
            credits: nextCredits
          })
          .eq('id', userId);
      }

      return NextResponse.json({
        success: true,
        message: 'Telemetry synced successfully with real-time grid dashboard.',
        log: telemetryLog
      });
    } else {
      // Mock local fallback response
      console.log(`🏎️ [Telemetry Sync Simulation] User: ${userId || 'GUEST'}, Track: ${trackName}, Lap Time: ${lapTimeMs}ms`);
      return NextResponse.json({
        success: true,
        message: 'Telemetry simulation complete. Performance indexed.',
        log: {
          id: `TEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          track_name: trackName,
          car_name: carName,
          lap_time_ms: lapTimeMs,
          sector_1_ms: sector1Ms,
          sector_2_ms: sector2Ms,
          sector_3_ms: sector3Ms,
          max_speed_kmh: maxSpeedKmh,
          created_at: timestamp
        }
      });
    }
  } catch (error: any) {
    console.error('Telemetry Sync Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync telemetry logs.' }, { status: 500 });
  }
}
