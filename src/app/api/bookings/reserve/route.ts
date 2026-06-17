import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/shared/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, rigId, date, timeSlot, price } = await req.json();

    if (!userId || !rigId || !date || !timeSlot || !price) {
      return NextResponse.json({ error: 'Missing reservation parameters.' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      // 1. Check if the slot is already booked
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('rig_id', rigId)
        .eq('booking_date', date)
        .eq('start_time', timeSlot)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (existingBooking) {
        return NextResponse.json({ error: 'This time slot has already been locked by another driver.' }, { status: 409 });
      }

      // 2. Insert new booking
      const { data: newBooking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          rig_id: rigId,
          booking_date: date,
          start_time: timeSlot,
          end_time: calculateEndTime(timeSlot),
          status: 'confirmed',
          total_price: parseFloat(price)
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Award experience points (XP) for simulator reservation
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (profile) {
        const nextXp = profile.xp + 150; // 150 XP for booking
        const nextLevel = Math.floor(nextXp / 1000) + 1;
        await supabase
          .from('profiles')
          .update({ xp: nextXp, level: nextLevel })
          .eq('id', userId);
      }

      return NextResponse.json({
        success: true,
        bookingId: newBooking.id,
        message: 'Telemetry slot locked and verified.',
        paymentUrl: null // Under demo/direct mode, booking completes instantly
      });
    } else {
      // Mock logic: save to localStorage simulation
      const mockBookingId = `BKG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        bookingId: mockBookingId,
        message: 'Telemetry slot successfully simulated. Paddock pass active.',
        paymentUrl: null
      });
    }
  } catch (error: any) {
    console.error('Booking Reservation Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to lock slot.' }, { status: 500 });
  }
}

function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + 1; // 1 hour duration
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}
