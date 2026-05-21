import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, totalAmount, items, customerName } = await req.json();

    if (!orderId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing order details for printing.' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString();
    const divider = '='.repeat(32);
    const line = '-'.repeat(32);

    // Format receipt using standard thermal printer 32-column width layout
    const lines = [
      `\x1B\x61\x01\x1B\x45\x01🏁 COFFEE X F1 🏁\x1B\x45\x00\x1B\x61\x00`,
      `\x1B\x61\x01THE FUELING STATION\x1B\x61\x00`,
      divider,
      `TIME: ${timestamp}`,
      `ORDER ID: #${orderId.slice(-6).toUpperCase()}`,
      customerName ? `DRIVER: ${customerName.toUpperCase()}` : `DRIVER: GUEST`,
      line,
      `\x1B\x45\x01QTY ITEM               PRICE\x1B\x45\x00`,
      line,
      ...items.map(item => {
        const qty = item.quantity.toString().padStart(2, ' ') + 'x';
        const name = (item.product_name || item.name || '').substring(0, 16).padEnd(16, ' ');
        const price = `€${((item.price || 0) * item.quantity).toFixed(2)}`.padStart(8, ' ');
        return `${qty} ${name} ${price}`;
      }),
      line,
      `TOTAL: ${`€${totalAmount.toFixed(2)}`.padStart(25, ' ')}`,
      divider,
      `\x1B\x61\x01\x1B\x45\x01KEEP ON THE THROTTLE!\x1B\x61\x00`,
      `\x1B\x61\x01TELEMETRY CODE: ${Math.random().toString(36).substring(2, 8).toUpperCase()}\x1B\x61\x00\n\n\n\n\x1B\x69`
    ];

    const formattedReceipt = lines.join('\n');

    // Simulate printing to stdout/logs
    console.log('📠 [ESC/POS Kitchen Printer Simulation Started]');
    console.log(formattedReceipt);
    console.log('📠 [ESC/POS Ticket Successfully Ejected]');

    return NextResponse.json({
      printed: true,
      printerName: 'Epson-TM-T88-Virtual',
      deviceStatus: 'ONLINE',
      receipt: formattedReceipt,
    });
  } catch (error: any) {
    console.error('POS Printer Simulation Error:', error);
    return NextResponse.json({ error: 'Failed to format and print ticket.' }, { status: 500 });
  }
}
