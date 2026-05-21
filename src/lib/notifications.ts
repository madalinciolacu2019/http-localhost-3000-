import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function sendOrderConfirmationEmail(email: string, orderId: string, total: number) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📬 [Notification Stub] Email would be sent to:', email, 'Order:', orderId);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Apex Brews <orders@apexbrews.com>',
      to: email,
      subject: `🏁 Order Confirmed: #${orderId.slice(-6)}`,
      html: `
        <div style="background-color: #0a0a0a; color: white; padding: 40px; font-family: sans-serif;">
          <h1 style="color: #E10600; font-style: italic;">APEX BREWS</h1>
          <p>Your precision-engineered order has been received and is now in the queue.</p>
          <hr style="border: 0; border-top: 1px solid #333;" />
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total:</strong> €${total.toFixed(2)}</p>
          <p>We'll notify you as soon as your coffee enters the roasting stage.</p>
          <br />
          <p style="color: #666; font-size: 12px;">Steady on the throttle.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
