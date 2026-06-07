import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await mockDb.getTodayPassageWithAnswers();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
