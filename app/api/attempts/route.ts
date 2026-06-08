import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { user_id, passage_id, answers, time_taken_seconds, question_times } = await req.json();

    if (!user_id || !passage_id || !answers) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Securely fetch correct answers bypassing RLS
    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id, correct_option')
      .eq('passage_id', passage_id);

    if (qErr || !questions) {
      throw new Error(qErr?.message || 'Failed to fetch questions');
    }

    // Calculate score
    let score = 0;
    const total = questions.length;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score++;
      }
    });

    // Call database RPC using admin key (RPC will handle updating profiles for this user_id safely)
    const { data, error } = await supabaseAdmin.rpc('submit_attempt_and_update_streak', {
      p_user_id: user_id,
      p_passage_id: passage_id,
      p_answers: answers,
      p_score: score,
      p_total_questions: total,
      p_time_taken: time_taken_seconds,
      p_question_times: question_times || {}
    });

    if (error) throw error;

    return NextResponse.json({
      score: data.score,
      total: data.total_questions,
      time_taken: time_taken_seconds,
      redirect: '/rc/today/results'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
