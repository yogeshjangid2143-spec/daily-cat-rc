'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, BookOpen, ChevronRight, Activity } from 'lucide-react';
import { getMockStorage, mockDb } from '@/lib/supabase';
import { getISTDateString } from '@/lib/utils';
import { Passage, Attempt } from '@/types';

export default function HistoryArchivePage() {
  const router = useRouter();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { currentUser } = getMockStorage();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    const loadHistory = async () => {
      try {
        const historyData = await mockDb.getPassagesHistory();
        const userAttempts = await mockDb.getUserAttempts(currentUser.id);
        setPassages(historyData);
        setAttempts(userAttempts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <span className="font-mono text-sm text-gray-500 animate-pulse">Loading Archive...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold uppercase tracking-widest">
          <BookOpen className="w-4 h-4" />
          The Archive
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1A1A18] dark:text-[#FAFAF9] tracking-tight">
          Passage History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg font-medium">
          Every Reading Comprehension challenge ever published on the platform. Review your past attempts or conquer passages you missed.
        </p>
      </div>

      {/* Grid Layout for RCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passages.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-mono text-lg border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            The archive is currently empty.
          </div>
        ) : (
          passages.map((passage, idx) => {
            const dateObj = new Date(passage.published_date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isAttempted = attempts.some(a => a.passage_id === passage.id);
            const isToday = passage.published_date === getISTDateString();

            return (
              <div 
                key={passage.id}
                className="group relative flex flex-col bg-white dark:bg-[#18181B] rounded-2xl border border-[#E5E5E3] dark:border-[#27272A] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${(idx + 2) * 50}ms` }}
              >
                {/* Decorative Top Gradient */}
                <div className={`h-2 w-full ${isAttempted ? 'bg-green-500' : isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-800'}`} />

                <div className="p-6 flex flex-col flex-1 gap-4">
                  
                  {/* Meta Information */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      {passage.topic}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formattedDate}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold leading-snug text-[#1A1A18] dark:text-[#FAFAF9] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
                    {passage.title}
                  </h3>

                  {/* Stats Footer */}
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-gray-500">
                      <Activity className="w-3.5 h-3.5" />
                      Difficulty: {passage.difficulty}/3
                    </div>
                  </div>
                </div>

                {/* Overlay Action Button */}
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                  {isAttempted ? (
                    <Link href={`/rc/${passage.id}/results`} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-green-500/25">
                      <CheckCircle2 className="w-4 h-4" /> View Results
                    </Link>
                  ) : isToday ? (
                    <Link href={`/rc/${passage.id}`} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                      Solve Today's RC <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link href={`/rc/${passage.id}`} className="w-full py-3 bg-[#1A1A18] hover:bg-black dark:bg-[#FAFAF9] dark:hover:bg-white text-white dark:text-black font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                      Attempt Archive <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
