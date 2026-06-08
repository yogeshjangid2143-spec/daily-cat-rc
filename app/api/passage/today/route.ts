import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getISTDateString } from '@/lib/utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Create an Admin client to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const todayStr = getISTDateString();
    let { data: passage } = await supabaseAdmin
      .from('passages')
      .select('*')
      .eq('published_date', todayStr)
      .eq('is_active', true)
      .maybeSingle();

    if (!passage) {
      // Fallback to latest available passage (past or today)
      const { data: latestPassages } = await supabaseAdmin
        .from('passages')
        .select('*')
        .eq('is_active', true)
        .lte('published_date', todayStr)
        .order('published_date', { ascending: false })
        .limit(1);
      if (latestPassages && latestPassages.length > 0) {
        passage = latestPassages[0];
      }
    }

    if (!passage) {
      return NextResponse.json({ error: 'No active passage found' }, { status: 404 });
    }

    // SECURE FETCH: We explicitly DO NOT select `correct_option` or `explanation`
    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id, passage_id, question_text, option_a, option_b, option_c, option_d, question_type, order_index')
      .eq('passage_id', passage.id)
      .order('order_index', { ascending: true });

    if (qErr) throw qErr;

    return NextResponse.json({ passage, questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
