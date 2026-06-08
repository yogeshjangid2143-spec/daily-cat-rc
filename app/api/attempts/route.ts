import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    const timeMachineDate = cookies().get('time_machine_date')?.value;

    let finalScore = score;
    let finalTotal = total;

    if (timeMachineDate) {
      // 🕰️ TIME MACHINE OVERRIDE: We must bypass the database RPC because the database is strictly tied to real-world CURRENT_DATE
      
      // 1. Insert attempt
      await supabaseAdmin.from('attempts').insert({
        user_id,
        passage_id,
        answers,
        score,
        total_questions: total,
        time_taken_seconds,
        question_times: question_times || {},
        completed_at: `${timeMachineDate}T12:00:00Z`
      });

      // 2. Get Profile
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user_id).single();
      
      if (profile) {
        const today = new Date(timeMachineDate);
        const yesterday = new Date(timeMachineDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = profile.streak_count || 0;
        let newFreezes = profile.streak_freezes_left || 0;
        
        if (!profile.last_active_date) {
          newStreak = 1;
        } else if (profile.last_active_date === timeMachineDate) {
          // Same day, no change
        } else if (profile.last_active_date === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1; // Simplification for time machine testing
        }

        // 3. Update Profile
        await supabaseAdmin.from('profiles').update({
          streak_count: newStreak,
          streak_freezes_left: newFreezes,
          last_active_date: timeMachineDate
        }).eq('id', user_id);
      }
    } else {
      // Call standard database RPC
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
      
      finalScore = data.score;
      finalTotal = data.total_questions;
    }

    return NextResponse.json({
      score: finalScore,
      total: finalTotal,
      time_taken: time_taken_seconds,
      redirect: '/rc/today/results'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
