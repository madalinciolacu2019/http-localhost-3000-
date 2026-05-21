import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, orderId, status } = await req.json();

    if (!phoneNumber || !orderId || !status) {
      return NextResponse.json({ error: 'Missing notification details.' }, { status: 400 });
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';
    const isTwilioConfigured = sid && token && !sid.includes('placeholder') && !token.includes('placeholder');

    const msgBody = status === 'ready' 
      ? `🏁 CoffeeXF1: Your Pitstop order #${orderId.slice(-6).toUpperCase()} is READY for pickup at the counter! Grab it and go! ☕🏎️`
      : `🏁 CoffeeXF1: Order #${orderId.slice(-6).toUpperCase()} status update: Now in stage ${status.toUpperCase()}.`;

    if (isTwilioConfigured) {
      // Production API integration using standard Twilio fetch client
      const authHeader = btoa(`${sid}:${token}`);
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneNumber,
          Body: msgBody,
        }).toString(),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error('Twilio SMS Delivery Failed:', errData);
        throw new Error(errData.message || 'Failed delivery via Twilio API.');
      }

      console.log(`📱 [Twilio API] SMS successfully dispatched to ${phoneNumber}`);
      return NextResponse.json({ success: true, method: 'TWILIO_REST_API', status: 'DISPATCHED' });
    } else {
      // Mock local fallback
      console.log(`📱 [SMS Simulation Stub] to ${phoneNumber}: "${msgBody}"`);
      return NextResponse.json({
        success: true,
        method: 'SIMULATOR_STUB',
        status: 'SIMULATED',
        body: msgBody,
      });
    }
  } catch (error: any) {
    console.error('SMS Notification Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to dispatch notification.' }, { status: 500 });
  }
}
