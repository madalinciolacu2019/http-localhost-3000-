import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    let fullName = 'F1 DRIVER';
    let credits = 1250;
    let level = 3;
    let rank = 'Silver Paddock Member';

    if (isSupabaseConfigured) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        fullName = profile.full_name || fullName;
        credits = profile.credits || 0;
        level = profile.level || 1;
        rank = credits > 2500 ? 'Gold Paddock Tier' : credits > 1000 ? 'Silver Paddock Tier' : 'Bronze Rookie Tier';
      }
    }

    // Build standard Apple Wallet pass structure
    const passManifest = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.coffeexf1.loyalty',
      serialNumber: `PK-${userId.slice(0, 8).toUpperCase()}`,
      teamIdentifier: 'TEAMXF1COFFEE',
      webServiceURL: 'https://coffeexf1.vercel.app/api/wallet',
      authenticationToken: 'vxznbarlas1241512',
      barcode: {
        message: `COFFEEXF1-LOYALTY-${userId}`,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: `Member ID: ${userId.slice(0, 8).toUpperCase()}`
      },
      organizationName: 'CoffeeXF1',
      description: 'Paddock Club Loyalty & Wallet Pass',
      logoText: 'COFFEE XF1',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(10, 10, 10)',
      labelColor: 'rgb(225, 6, 0)', // Racing Red
      storeCard: {
        primaryFields: [
          {
            key: 'tier',
            label: 'MEMBERSHIP TIER',
            value: rank.toUpperCase()
          }
        ],
        secondaryFields: [
          {
            key: 'points',
            label: 'ERS BALANCE',
            value: `${credits} PTS`
          },
          {
            key: 'level',
            label: 'CHASSIS LEVEL',
            value: `LVL ${level}`
          }
        ],
        auxiliaryFields: [
          {
            key: 'driverName',
            label: 'DRIVER SIGNATURE',
            value: fullName.toUpperCase()
          }
        ],
        backFields: [
          {
            key: 'terms',
            label: 'TERMS & RULES',
            value: 'ERS points are accrued via coffee orders, merchandise checkouts, and simulator bookings. Redeemable for complimentary qualifying drinks and free pit-stop bay reservations. Subject to waiver consent.'
          }
        ]
      }
    };

    const download = searchParams.get('download');
    if (download === 'true') {
      // In a real server setup, this returns a signed .pkpass binary.
      // We simulate this by outputting a JSON text representation styled as a file attachment,
      // or a mock binary file with correct MIME type.
      return new NextResponse(JSON.stringify(passManifest, null, 2), {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="coffeexf1_pass_${userId.slice(0,8)}.pkpass"`,
          'Content-Type': 'application/vnd.apple.pkpass'
        }
      });
    }

    return NextResponse.json({
      success: true,
      pass: passManifest,
      instructions: 'Integrate using add-to-wallet button or load in-app telemetry.'
    });

  } catch (error: any) {
    console.error('Wallet Pass Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate pass manifest.' }, { status: 500 });
  }
}
