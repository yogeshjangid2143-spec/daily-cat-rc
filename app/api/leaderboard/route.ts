import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'weekly';

    let data = await mockDb.getLeaderboard();

    if (period === 'alltime') {
      data = data.map(e => ({
        ...e,
        weekly_score: e.weekly_score + 100,
        avg_accuracy: Math.min(100, e.avg_accuracy + 2)
      })).sort((a, b) => b.weekly_score - a.weekly_score);
    }

    return NextResponse.json(data.slice(0, 50));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
