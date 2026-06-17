import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Using a file to persist across hot reloads and devices (localhost vs phone)
const dbPath = path.join(process.cwd(), '.ceo_state.json');

export async function GET() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      return NextResponse.json({ hasCeo: data.hasCeo, ceoEmail: data.ceoEmail });
    }
    return NextResponse.json({ hasCeo: false });
  } catch (e) {
    return NextResponse.json({ hasCeo: false });
  }
}

export async function POST(req: Request) {
  try {
    const { action, email } = await req.json();
    
    if (action === 'claim') {
      fs.writeFileSync(dbPath, JSON.stringify({ hasCeo: true, ceoEmail: email }));
      return NextResponse.json({ success: true });
    }
    
    if (action === 'reset') {
      fs.writeFileSync(dbPath, JSON.stringify({ hasCeo: false, ceoEmail: null }));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update CEO status' });
  }
}
