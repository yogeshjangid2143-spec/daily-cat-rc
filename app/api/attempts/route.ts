import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { user_id, passage_id, answers, time_taken_seconds } = await req.json();

    if (!user_id || !passage_id || !answers) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await mockDb.submitAttempt(user_id, passage_id, answers, time_taken_seconds);

    return NextResponse.json({
      score: result.score,
      total: result.total,
      time_taken: time_taken_seconds,
      redirect: '/rc/today/results'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
