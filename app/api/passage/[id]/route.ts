import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if the client requested answers
    const includeAnswers = req.nextUrl.searchParams.get('answers') === 'true';

    const { data: passage } = await supabaseAdmin
      .from('passages')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!passage) {
      return NextResponse.json({ error: 'Passage not found' }, { status: 404 });
    }

    let query = supabaseAdmin.from('questions').select(
      includeAnswers 
        ? '*' 
        : 'id, passage_id, question_text, option_a, option_b, option_c, option_d, question_type, order_index'
    ).eq('passage_id', passage.id).order('order_index', { ascending: true });

    const { data: questions, error: qErr } = await query;

    if (qErr) throw qErr;

    return NextResponse.json({ passage, questions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
