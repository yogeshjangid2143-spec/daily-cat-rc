import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const dynamic = 'force-dynamic';

function getMondayISTInUTC(): Date {
  const nowUTC = new Date();
  // Shift by 5.5 hours to represent IST time in UTC methods
  const istTime = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);
  
  const day = istTime.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  const mondayIST = new Date(istTime);
  mondayIST.setUTCDate(istTime.getUTCDate() - daysToSubtract);
  mondayIST.setUTCHours(0, 0, 0, 0); // Monday 00:00:00 IST
  
  // Convert back to UTC timezone
  return new Date(mondayIST.getTime() - 5.5 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'weekly';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Create Admin client to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all profiles and attempts
    const [{ data: profiles, error: pErr }, { data: attempts, error: aErr }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin.from('attempts').select('*')
    ]);

    if (pErr) throw pErr;
    if (aErr) throw aErr;

    if (!profiles || !attempts) {
      return NextResponse.json([]);
    }

    const mondayUTC = getMondayISTInUTC();

    const leaderboard: LeaderboardEntry[] = profiles.map(p => {
      // Find all attempts for this user
      const userAttempts = attempts.filter(a => a.user_id === p.id);

      // Filter attempts based on weekly vs alltime
      const filteredAttempts = userAttempts.filter(a => {
        if (period === 'alltime') return true;
        const attemptDate = new Date(a.completed_at);
        return attemptDate >= mondayUTC;
      });

      const totalScore = filteredAttempts.reduce((sum, a) => sum + Number(a.score), 0);
      const totalQuestions = filteredAttempts.reduce((sum, a) => sum + Number(a.total_questions), 0);
      const avgAccuracy = totalQuestions > 0 
        ? Math.round((totalScore / totalQuestions) * 1000) / 10 
        : 0;

      return {
        id: p.id,
        name: p.name || 'Anonymous User',
        avatar_url: p.avatar_url,
        streak_count: p.streak_count,
        weekly_score: totalScore,
        attempts_this_week: filteredAttempts.length,
        avg_accuracy: avgAccuracy,
      };
    })
    // Only show users who have made attempts in the selected period (matches database view behavior)
    .filter(e => e.attempts_this_week > 0);

    // Sort by score descending, then by streak descending
    const sortedLeaderboard = leaderboard.sort((a, b) => {
      if (b.weekly_score !== a.weekly_score) {
        return b.weekly_score - a.weekly_score;
      }
      return b.streak_count - a.streak_count;
    });

    return NextResponse.json(sortedLeaderboard.slice(0, 50));
  } catch (error: any) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
