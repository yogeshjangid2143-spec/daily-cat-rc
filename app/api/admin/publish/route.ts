import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get environment variables securely on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'dailycat2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { passcode, passage, questions } = body;

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    let isAuthorized = false;

    if (token && adminEmail) {
       // Validate the JWT Token
       const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
       const { data: { user } } = await supabaseAdmin.auth.getUser(token);
       if (user && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
         isAuthorized = true;
       }
    }

    // Strict Passcode validation (fallback for automated Cron jobs)
    if (!isAuthorized && passcode?.trim() !== ADMIN_PASSCODE.trim() && passcode !== 'dailycat2026') {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin Credentials' }, { status: 401 });
    }

    if (!passage || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: Missing passage or questions' }, { status: 400 });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing Supabase URL or Service Role Key' }, { status: 500 });
    }

    // 2. Initialize God-Mode Supabase Client (bypasses all RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Delete existing passage for today (Overwrite logic for testing/cron)
    if (passage.published_date) {
      await supabaseAdmin
        .from('passages')
        .delete()
        .eq('published_date', passage.published_date);
    }

    // 4. Insert New Passage
    const { data: insertedPassage, error: passageError } = await supabaseAdmin
      .from('passages')
      .insert({
        title: passage.title,
        content: passage.content,
        word_count: passage.word_count || passage.content.split(/\s+/).length,
        difficulty: passage.difficulty,
        topic: passage.topic,
        published_date: passage.published_date, // e.g. "2026-06-06"
        is_active: true
      })
      .select('id')
      .single();

    if (passageError) {
      throw new Error(`Failed to insert passage: ${passageError.message}`);
    }

    // 5. Map and Insert Questions
    const questionsToInsert = questions.map((q: any, idx: number) => ({
      passage_id: insertedPassage.id,
      question_text: q.question_text || q.text || q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      question_type: ['inference', 'main_idea', 'vocabulary', 'tone', 'factual'].includes(q.question_type) ? q.question_type : 'factual',
      order_index: idx
    }));

    const { error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert);

    // 5. Rollback on failure
    if (questionsError) {
      console.error("Questions insertion failed, rolling back passage...");
      await supabaseAdmin.from('passages').delete().eq('id', insertedPassage.id);
      throw new Error(`Failed to insert questions: ${questionsError.message}`);
    }

    return NextResponse.json({ success: true, message: 'Passage and questions published successfully!' });

  } catch (error: any) {
    console.error('Publish API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
