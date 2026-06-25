import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify that user is accessing their own subscription data or is CEO/Manager
    if (user.email !== email && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    // Return mock subscriptions based on user's identity/email
    // This simulates active recurring orders of specialty coffee
    const oneMonthFromNow = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    
    const mockSubscriptions = [
      {
        id: 'sub-drs-espresso',
        product_name: 'DRS Espresso Monthly Refuel',
        status: 'active',
        current_period_end: oneMonthFromNow,
        amount: 24.99,
        interval: 'month'
      },
      {
        id: 'sub-full-wet',
        product_name: 'Full Wet Roast Heavy Feed',
        status: 'active',
        current_period_end: oneMonthFromNow + 15 * 24 * 60 * 60, // staggered 15 days later
        amount: 34.99,
        interval: 'month'
      }
    ];

    // Give the CEO a special corporate subscription
    if (user.user_metadata.role === 'CEO') {
      mockSubscriptions.push({
        id: 'sub-corporate-paddock',
        product_name: 'Paddock Club Corporate Reserve Feed',
        status: 'active',
        current_period_end: oneMonthFromNow + 60 * 24 * 60 * 60,
        amount: 499.99,
        interval: 'month'
      });
    }

    return NextResponse.json({ subscriptions: mockSubscriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
