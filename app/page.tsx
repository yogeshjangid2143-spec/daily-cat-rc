'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Trophy, CheckCircle, GraduationCap, Lock, HelpCircle } from 'lucide-react';
import { getMockStorage } from '../lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check local mock storage first for immediate feedback
      const { currentUser } = getMockStorage();
      if (currentUser) {
        setIsLoggedIn(true);
        router.push('/dashboard');
        return;
      }
      
      // 2. Check real Supabase session
      try {
        const { isSupabaseConfigured, supabase } = await import('../lib/supabase');
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsLoggedIn(true);
            router.push('/dashboard');
            return;
          }
        }
      } catch(e) {
        console.error(e);
      }
    };
    
    checkAuth();
  }, [router]);

  const features = [
    {
      icon: <GraduationCap className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />,
      title: "Daily CAT-Level RCs",
      desc: "Fresh, challenging reading comprehension passages created daily, mimicking actual exam difficulties."
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />,
      title: "Detailed Explanations",
      desc: "Deep-dive analysis for every single option. Learn why the right option is right, and why others are traps."
    },
    {
      icon: <Flame className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />,
      title: "Streak Tracking & Freezes",
      desc: "Build consistency. Missed a day? Use a weekly streak freeze to keep your momentum alive."
    },
    {
      icon: <Trophy className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />,
      title: "Live Leaderboards",
      desc: "Compete against thousands of CAT aspirants. See your daily rank, percentile, and accuracy."
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-20 px-4 max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center flex flex-col items-center gap-6 max-w-3xl mb-16 md:mb-24">
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#1A1A18] dark:text-[#FAFAF9] leading-[1.05]">
          Read. Think. Rank.
        </h1>
        <p className="font-sans text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          One CAT-level RC every day. Track your progress. Beat the leaderboard. Elevate your percentile.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <Link
            href={isLoggedIn ? "/dashboard" : "/auth/signup"}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-mono font-semibold text-sm rounded transition-all duration-150"
          >
            Start Free
          </Link>
          <Link
            href={isLoggedIn ? "/rc/today" : "/auth/login"}
            className="px-6 py-3 border border-[#E5E5E3] dark:border-[#27272A] hover:border-gray-400 dark:hover:border-gray-600 text-[#1A1A18] dark:text-[#FAFAF9] font-mono font-semibold text-sm rounded transition-all duration-150"
          >
            See Today's RC
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Passage Teaser + Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full items-start">
        
        {/* Left Side: Blurred/Locked Sample Passage Card */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] dark:border-[#27272A] pb-3 text-xs font-mono text-gray-400">
            <span className="uppercase tracking-wider">Today's RC Sneak Peek</span>
            <span>Est. time: 12 mins</span>
          </div>

          <div className="relative border border-[#E5E5E3] dark:border-[#27272A] rounded-lg p-6 bg-white dark:bg-[#18181B] overflow-hidden select-none">
            {/* Blurring overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white dark:via-black/40 dark:to-[#18181B] backdrop-blur-[3px] flex flex-col items-center justify-center p-6 z-10 text-center">
              <div className="w-12 h-12 rounded-full border border-[#E5E5E3] dark:border-[#27272A] bg-[#FAFAF9]/90 dark:bg-[#18181B]/90 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-1.5 text-[#1A1A18] dark:text-[#FAFAF9]">
                Today's RC is Locked
              </h3>
              <p className="font-sans text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-6">
                Create a free account or log in to unlock today's passage and verify your answers.
              </p>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-mono font-semibold text-xs rounded transition-all duration-150"
              >
                Unlock Passage
              </Link>
            </div>

            {/* Passage Mockup */}
            <div className="opacity-30">
              <span className="text-[10px] font-mono tracking-wider text-[#4F46E5] px-2 py-0.5 rounded bg-[#4F46E5]/10 uppercase">
                economics
              </span>
              <h2 className="font-serif text-2xl font-bold mt-3 mb-4 text-[#1A1A18] dark:text-[#FAFAF9]">
                India's GDP Trajectory and Structural Imperatives
              </h2>
              <div className="font-sans text-sm leading-[1.8] text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  India's recent economic expansion presents a dual narrative of aggregate growth and persistent structural bottlenecks. On paper, the country remains one of the fastest-growing major economies globally, with GDP growth hovering between 6.5% and 7.2% in recent quarters.
                </p>
                <p>
                  The core challenge lies in the manufacturing sector's inability to absorb India's massive demographic dividend. Despite government programs like "Make in India" and Production Linked Incentive (PLI) schemes designed to spur domestic manufacturing, the sector's contribution to GDP remains stagnant around 14-16%. Instead, millions of workers leaving agriculture are bypassing the industrial sector entirely, moving directly into low-productivity services, informal retail, or construction. Economists call this premature deindustrialization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Features List */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A18] dark:text-[#FAFAF9]">
              Built for Serious Aspirants
            </h2>
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
              No filler. Just pure, targeted prep to improve your CAT Verbal Ability and Reading Comprehension (VARC) score.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-md border border-[#E5E5E3] dark:border-[#27272A] bg-white dark:bg-[#18181B] flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-sans text-sm font-semibold text-[#1A1A18] dark:text-[#FAFAF9]">
                    {f.title}
                  </h4>
                  <p className="font-sans text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-24 w-full border-t border-[#E5E5E3] dark:border-[#27272A] pt-6 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-gray-400">
        <span>&copy; {new Date().getFullYear()} dailycatrc.com. All rights reserved.</span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <span className="hover:text-gray-600 cursor-pointer">Terms</span>
          <span className="hover:text-gray-600 cursor-pointer">Privacy</span>
        </div>
      </div>
    </div>
  );
}
