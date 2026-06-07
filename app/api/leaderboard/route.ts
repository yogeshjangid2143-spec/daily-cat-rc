import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'weekly';

    const data = await mockDb.getLeaderboard(period as 'weekly' | 'alltime');

    return NextResponse.json(data.slice(0, 50));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
