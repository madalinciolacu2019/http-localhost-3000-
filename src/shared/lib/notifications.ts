import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function sendOrderConfirmationEmail(
  email: string, 
  orderId: string, 
  total: number,
  items: { product_name: string; quantity: number; price: number; size?: string }[] = []
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📬 [Notification Stub] Premium Email would be sent to:', email, 'Order:', orderId, 'Total: €', total);
    console.log('Items:', items);
    return;
  }

  // Build items rows
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #222;">
      <td style="padding: 12px 0; color: #fff; font-size: 14px;">
        ${item.product_name} ${item.size ? `<span style="color: #666; font-size: 11px;">(${item.size})</span>` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; color: #888; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #fff; font-size: 14px; font-family: monospace;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: 'Apex Brews <orders@apexbrews.com>',
      to: email,
      subject: `🏁 Order Confirmed: #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="background-color: #0b0b0e; color: white; padding: 40px; font-family: 'Orbitron', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #1a1a24; border-radius: 8px;">
          <div style="text-align: center; border-bottom: 2px solid #E10600; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #E10600; font-style: italic; letter-spacing: 2px; margin: 0; font-size: 28px;">APEX BREWS</h1>
            <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Precision-Engineered Fueling</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #ccc;">Your order has cleared race inspections and entered the dispatch queue.</p>
          
          <div style="background-color: #111116; border: 1px solid #222; border-radius: 6px; padding: 20px; margin: 25px 0;">
            <span style="color: #666; font-size: 10px; font-weight: bold; text-transform: uppercase;">Order Registry ID</span>
            <div style="font-size: 13px; font-family: monospace; color: #E10600; font-weight: bold; margin-top: 2px;">#${orderId.toUpperCase()}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 1px solid #333; text-transform: uppercase; font-size: 10px; color: #666;">
                <th style="text-align: left; padding-bottom: 10px;">Product Spec</th>
                <th style="text-align: center; padding-bottom: 10px;">Qty</th>
                <th style="text-align: right; padding-bottom: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || `
                <tr>
                  <td style="padding: 12px 0; color: #fff;">APEX Fuel Bundle</td>
                  <td style="padding: 12px 0; text-align: center; color: #888;">1</td>
                  <td style="padding: 12px 0; text-align: right; color: #fff;">€${total.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>

          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 20px; text-align: right;">
            <span style="color: #666; font-size: 11px; text-transform: uppercase;">Total Fuel Charge</span>
            <div style="color: #E10600; font-size: 24px; font-weight: bold; margin-top: 4px; font-family: monospace;">€${total.toFixed(2)}</div>
          </div>

          <div style="border-top: 1px solid #222; margin-top: 45px; padding-top: 20px; text-align: center; color: #444; font-size: 11px;">
            <p>We will notify you with telemetry tracking when your shipment departs the grid pitbox.</p>
            <p style="color: #E10600; font-style: italic; margin-top: 15px;">Steady on the throttle.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendAbandonedCartEmail(
  email: string, 
  checkoutUrl: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📬 [Notification Stub] Abandoned Cart Email would be sent to:', email);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Apex Brews <orders@apexbrews.com>',
      to: email,
      subject: `Box, Box! You left your fuel at the pit stop.`,
      html: `
        <div style="background-color: #0b0b0e; color: white; padding: 40px; font-family: 'Orbitron', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #1a1a24; border-radius: 8px;">
          <div style="text-align: center; border-bottom: 2px solid #E10600; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #E10600; font-style: italic; letter-spacing: 2px; margin: 0; font-size: 28px;">APEX BREWS</h1>
            <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Pit Lane Logistics</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #ccc;">We noticed you left some items in your cart. Your custom telemetry setup is still saved and waiting for extraction.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="background-color: #E10600; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; font-family: monospace; font-size: 14px; border-radius: 4px; display: inline-block;">RESUME CHECKOUT</a>
          </div>

          <div style="border-top: 1px solid #222; margin-top: 45px; padding-top: 20px; text-align: center; color: #444; font-size: 11px;">
            <p style="color: #E10600; font-style: italic; margin-top: 15px;">Steady on the throttle.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send abandoned cart email:', error);
  }
}
