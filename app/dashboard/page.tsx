'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Sparkles, 
  ShieldAlert, 
  BookOpen,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { getMockStorage, setMockStorage, mockDb, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Profile, Attempt, Passage } from '../../types';
import StreakWidget from '../../components/StreakWidget';
import ScoreChart from '../../components/ScoreChart';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [todayPassage, setTodayPassage] = useState<Passage | null>(null);
  const [todayAttempt, setTodayAttempt] = useState<Attempt | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSolved: 0,
    bestScore: '0/5',
    currentRank: '-',
    weakArea: 'None',
    weakAreaAcc: 0,
  });
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, { correct: number; total: number }>>({});
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        let activeUser = getMockStorage().currentUser;

        // 1. Authenticate user properly via Supabase
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (dbProfile) {
              activeUser = dbProfile as Profile;
            } else {
              // Create profile for new Google OAuth users
              activeUser = {
                 id: session.user.id,
                 name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Reader',
                 avatar_url: session.user.user_metadata?.avatar_url || null,
                 streak_count: 0,
                 last_active_date: new Date().toISOString().split('T')[0],
                 is_pro: false,
                 preferred_difficulty: 1,
                 streak_freezes_left: 1,
                 created_at: new Date().toISOString(),
              };
              // Note: RLS might block client-side insert if not configured perfectly, but Supabase handles basic auth.
            }
            setMockStorage({ currentUser: activeUser });
            window.dispatchEvent(new Event('user-state-change'));
          } else {
            activeUser = null; // Enforce Supabase auth if configured
            setMockStorage({ currentUser: null });
            window.dispatchEvent(new Event('user-state-change'));
          }
        }

        if (!activeUser) {
          router.push('/auth/login');
          return;
        }

        setUser(activeUser);

        const passageRes = await mockDb.getTodayPassage();
        setTodayPassage(passageRes.passage);

        // Check if there is an attempt today
        const attempt = await mockDb.getAttempt(activeUser.id, passageRes.passage.id);
        setTodayAttempt(attempt);

        // Fetch user attempts
        let userAttempts = await mockDb.getUserAttempts(activeUser.id);

        setAttempts(userAttempts);

        // 3. Calculate Stats
        const totalSolved = userAttempts.length;
        
        let maxScore = 0;
        userAttempts.forEach(a => {
          if (a.score > maxScore) maxScore = a.score;
        });

        // Calculate rankings
        const leaderboard = await mockDb.getLeaderboard();
        const userRankIndex = leaderboard.findIndex(e => e.id === activeUser.id);
        const currentRank = userRankIndex !== -1 ? `#${userRankIndex + 1}` : 'Top 50';

        // Questions types mapping (fallback for mock)
        const typesMap: Record<string, string> = {
          'q1': 'main_idea',
          'q2': 'inference',
          'q3': 'factual',
          'q4': 'tone',
          'q5': 'inference',
        };
        const correctMap: Record<string, string> = {
          'q1': 'B',
          'q2': 'B',
          'q3': 'A',
          'q4': 'C',
          'q5': 'B',
        };

        // Fetch actual question details securely via mockDb (which hits API routes if live)
        const passageIds = Array.from(new Set(userAttempts.map(a => a.passage_id)));
        if (passageIds.length > 0) {
          // Parallel fetch for speed
          const promises = passageIds.map(pid => mockDb.getPassageById(pid, true).catch(() => null));
          const results = await Promise.all(promises);
          
          results.forEach(res => {
            if (res && res.questions) {
              res.questions.forEach(q => {
                typesMap[q.id] = q.question_type || 'inference';
                correctMap[q.id] = q.correct_option;
              });
            }
          });
        }

        const breakdown: Record<string, { correct: number; total: number }> = {
          'main_idea': { correct: 0, total: 0 },
          'inference': { correct: 0, total: 0 },
          'factual': { correct: 0, total: 0 },
          'tone': { correct: 0, total: 0 },
          'vocabulary': { correct: 0, total: 0 },
        };

        // Populate breakdown using user attempts
        userAttempts.forEach(att => {
          Object.entries(att.answers).forEach(([qId, ans]) => {
            const qType = typesMap[qId] || 'inference';
            const isCorrect = ans === (correctMap[qId] || 'B');
            
            if (!breakdown[qType]) {
              breakdown[qType] = { correct: 0, total: 0 };
            }
            
            breakdown[qType].total += 1;
            if (isCorrect) breakdown[qType].correct += 1;
          });
        });

        // Identify weak area
        let minAcc = 1.1;
        let weakArea = 'None';
        
        Object.entries(breakdown).forEach(([type, data]) => {
          if (data.total > 0) {
            const acc = data.correct / data.total;
            if (acc < minAcc) {
              minAcc = acc;
              weakArea = type;
            }
          }
        });

        // Set state values
        setStats({
          totalSolved,
          bestScore: `${maxScore}/5`,
          currentRank,
          weakArea: weakArea !== 'None' ? weakArea.replace('_', ' ') : 'None',
          weakAreaAcc: minAcc <= 1.0 ? Math.round(minAcc * 100) : 0,
        });

        setTypeBreakdown(breakdown);

        // Chart Data prep (daily accuracy)
        const sortedAttempts = [...userAttempts].sort(
          (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
        );
        
        const dailyStats: Record<string, { score: number; total: number }> = {};
        sortedAttempts.forEach(a => {
          const date = new Date(a.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dailyStats[date]) {
            dailyStats[date] = { score: 0, total: 0 };
          }
          dailyStats[date].score += a.score;
          dailyStats[date].total += a.total_questions;
        });

        const chartDataPoints = Object.keys(dailyStats).slice(-14).map(date => {
          const stat = dailyStats[date];
          return {
            date,
            scorePercent: Math.round((stat.score / stat.total) * 100),
            rawScore: `${stat.score}/${stat.total}`,
          };
        });

        setChartData(chartDataPoints);

      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
    
    // Ensure real-time updates when navigating back
    window.addEventListener('focus', initData);
    return () => {
      window.removeEventListener('focus', initData);
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E5E3] dark:border-[#27272A] border-t-[#4F46E5] dark:border-t-[#6366F1] animate-spin" />
        <span className="font-mono text-xs text-gray-500 animate-pulse-glow">Loading your profile stats...</span>
      </div>
    );
  }

  // Get greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const attemptDatesList = attempts.map(a => {
    const d = new Date(a.completed_at);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      {/* Top Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E3] dark:border-[#27272A] pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A18] dark:text-[#FAFAF9]">
            {getGreeting()}, {user.name}.
          </h1>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Keep your streak alive. Resolve daily RCs to rank up.
          </p>
        </div>

        {/* Upgrade Card if not Pro */}
        {!user.is_pro && (
          <Link
            href="/profile"
            className="flex items-center gap-2 border border-[#4F46E5]/20 bg-[#4F46E5]/5 dark:border-[#6366F1]/20 dark:bg-[#6366F1]/5 px-4 py-2 rounded-md hover:bg-[#4F46E5]/10 dark:hover:bg-[#6366F1]/10 transition-colors group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
            <div className="text-left">
              <p className="text-[11px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1] uppercase tracking-wider">
                Upgrade to Pro
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Unlock 500+ past RCs & benchmarks
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1] ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Today's RC, Performance Chart, Analytics */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Today's RC Card */}
          <div className="border border-[#E5E5E3] dark:border-[#27272A] rounded-lg bg-white dark:bg-[#18181B] p-6 flex flex-col gap-6 animate-fade-in-up [animation-delay:100ms] opacity-0">
            <div className="flex items-start justify-between border-b border-[#E5E5E3] dark:border-[#27272A] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#4F46E5] dark:text-[#6366F1] uppercase px-2 py-0.5 bg-[#4F46E5]/10 dark:bg-[#6366F1]/10 rounded">
                  Today's Practice RC
                </span>
                <h2 
                  className={`font-serif text-3xl font-bold mt-2 text-[#1A1A18] dark:text-[#FAFAF9] ${
                    !todayAttempt 
                      ? 'blur-[8px] hover:blur-none transition-all duration-500 cursor-help select-none bg-gray-200/20 dark:bg-gray-800/20 rounded w-fit' 
                      : ''
                  }`}
                  title={!todayAttempt ? "Hover to reveal today's topic" : undefined}
                >
                  {todayPassage?.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                  <span 
                    className={`capitalize ${
                      !todayAttempt ? 'blur-[5px] hover:blur-none transition-all duration-500 cursor-help select-none' : ''
                    }`}
                  >
                    {todayPassage?.topic}
                  </span>
                  <span>•</span>
                  <span>{todayPassage?.word_count} words</span>
                </div>
              </div>

              {todayAttempt && (
                <span className="font-mono text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 border border-green-200 dark:border-green-800/50 rounded-md">
                  SOLVED ({todayAttempt.score}/5)
                </span>
              )}
            </div>

            <p className="font-sans text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              Understand structure, capture tone, and master argument mapping. Click below to practice today's CAT Verbal Comprehension exercise.
            </p>

            <div className="flex items-center gap-4">
              {todayAttempt ? (
                <Link
                  href="/rc/today/results"
                  className="px-5 py-2.5 border border-[#E5E5E3] dark:border-[#27272A] hover:border-gray-400 dark:hover:border-gray-600 text-xs font-mono font-semibold text-[#1A1A18] dark:text-[#FAFAF9] rounded transition-colors"
                >
                  View Results & Detailed Explanations
                </Link>
              ) : (
                <Link
                  href="/rc/today"
                  className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white text-xs font-mono font-semibold rounded transition-colors flex items-center gap-1.5"
                >
                  Solve Today's RC
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="border border-[#E5E5E3] dark:border-[#27272A] rounded-lg bg-white dark:bg-[#18181B] p-6 flex flex-col gap-6 animate-fade-in-up [animation-delay:200ms] opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                  Performance Trend
                </h3>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  Daily accuracy percentage over the last 14 solved passages
                </p>
              </div>
            </div>

            <ScoreChart data={chartData} />
          </div>

          {/* Accuracy Breakdown (Question-Level Analytics) */}
          <div className="border border-[#E5E5E3] dark:border-[#27272A] rounded-lg bg-white dark:bg-[#18181B] p-6 flex flex-col gap-6 animate-fade-in-up [animation-delay:300ms] opacity-0">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                Question Type Analytics
              </h3>
              <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                Performance breakdown by VARC question classification
              </p>
            </div>

            {/* Weak Area warning (Suggestion #2) */}
            {stats.weakArea !== 'None' && stats.weakAreaAcc < 70 && (
              <div className="p-3 border border-amber-200 dark:border-amber-950/30 rounded bg-amber-50 dark:bg-amber-950/10 flex items-start gap-2.5 text-amber-700 dark:text-amber-400 text-xs font-sans leading-relaxed">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold uppercase font-mono tracking-wider text-[10px] bg-amber-200/50 dark:bg-amber-900/40 px-1.5 py-0.2 rounded mr-1.5">
                    Weak Focus
                  </span>
                  Your weak area is <span className="font-bold capitalize">{stats.weakArea}</span> questions (accuracy is <span className="font-bold text-amber-600 dark:text-amber-500">{stats.weakAreaAcc}%</span>). Review the explanation cards for these carefully.
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
              {Object.entries(typeBreakdown).map(([type, value]) => {
                const acc = value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0;
                return (
                  <div key={type} className="border border-[#E5E5E3] dark:border-[#27272A] rounded p-3 bg-[#FAFAF9] dark:bg-[#18181B]/50 text-center flex flex-col gap-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 truncate" title={type}>
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-serif text-xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                      {acc}%
                    </span>
                    <span className="font-mono text-[9px] text-gray-400 dark:text-gray-500">
                      {value.correct}/{value.total} solved
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Streak Widget & Quick Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Streak Widget */}
          <StreakWidget
            profile={user}
            attemptsDates={attemptDatesList}
          />

          {/* Quick Stats Grid */}
          <div className="border border-[#E5E5E3] dark:border-[#27272A] rounded-lg bg-white dark:bg-[#18181B] p-5 flex flex-col gap-4 animate-fade-in-up [animation-delay:400ms] opacity-0">
            <h3 className="font-serif text-xl font-bold text-[#1A1A18] dark:text-[#FAFAF9] border-b border-[#E5E5E3] dark:border-[#27272A] pb-2.5">
              Quick Stats
            </h3>
            
            <div className="flex flex-col gap-3.5">
              
              {/* Total Solved */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen className="w-4 h-4" />
                  <span>Total RCs Solved</span>
                </div>
                <span className="font-mono font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                  {stats.totalSolved}
                </span>
              </div>

              {/* Best Score */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <Award className="w-4 h-4" />
                  <span>Best Accuracy</span>
                </div>
                <span className="font-mono font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                  {stats.bestScore}
                </span>
              </div>

              {/* Current Rank */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <Trophy className="w-4 h-4" />
                  <span>Weekly Rank</span>
                </div>
                <span className="font-mono font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                  {stats.currentRank}
                </span>
              </div>

              {/* CAT Benchmarking Preview (Suggestion #8) */}
              <div className="mt-2 border-t border-[#E5E5E3] dark:border-[#27272A] pt-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1 font-semibold text-[#4F46E5] dark:text-[#6366F1] font-mono text-[10px] uppercase mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>CAT Percentile Benchmark</span>
                </div>
                {stats.totalSolved >= 5 ? (
                  <span>
                    Your overall accuracy of <span className="font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                      {Math.round(attempts.reduce((sum, a) => sum + (a.score/a.total_questions), 0) / stats.totalSolved * 100)}%
                    </span> maps to approx <span className="font-semibold text-green-600 dark:text-green-400">92-95%ile</span> in CAT Verbal section.
                  </span>
                ) : (
                  <span>
                    Solve <span className="font-semibold font-mono text-[#1A1A18] dark:text-[#FAFAF9]">{5 - stats.totalSolved}</span> more daily RCs to calibrate your predicted CAT percentile benchmark.
                  </span>
                )}
              </div>

            </div>

            <Link
              href="/leaderboard"
              className="mt-2 text-xs font-mono font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#6366F1] dark:hover:text-[#4F46E5] flex items-center gap-0.5 justify-center border border-[#E5E5E3] dark:border-[#27272A] py-2 rounded hover:bg-gray-50 dark:hover:bg-black/10 transition-colors"
            >
              <span>View Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
