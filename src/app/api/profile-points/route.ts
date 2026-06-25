import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(req: Request) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Ensure they are querying their own profile or are CEO/Manager
    if (user.id !== userId && user.user_metadata.role !== 'CEO' && user.user_metadata.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    const dbPath = path.join(process.cwd(), '.mock_points_db.json');
    let pointsDb: Record<string, { credits: number, xp: number }> = {};
    
    if (fs.existsSync(dbPath)) {
      try {
        pointsDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch(e) {}
    }

    const userStats = pointsDb[userId] || { credits: 1250, xp: 3200 };
    
    return NextResponse.json(userStats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

