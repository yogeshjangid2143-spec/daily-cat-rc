'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getMockStorage, mockDb } from '@/lib/supabase';
import { Passage, Attempt } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [monthOpen, setMonthOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E5E3] dark:border-[#2E2E2C] border-t-[#4F46E5] dark:border-t-[#6366F1] animate-spin" />
        <span className="font-mono text-xs text-gray-500 animate-pulse-glow">Loading history archive...</span>
      </div>
    );
  }

  const availableMonths = Array.from(new Set(passages.map(p => {
    const d = new Date(p.published_date);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  })));

  const availableGenres = Array.from(new Set(passages.map(p => p.topic)));

  const filteredPassages = passages.filter(p => {
    const monthStr = new Date(p.published_date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const matchesMonth = selectedMonth ? monthStr === selectedMonth : true;
    const matchesGenre = selectedGenre ? p.topic === selectedGenre : true;
    return matchesMonth && matchesGenre;
  });

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-10 flex flex-col gap-6" onClick={() => { if(monthOpen) setMonthOpen(false); if(genreOpen) setGenreOpen(false); }}>
      
      <div className="flex items-center gap-6 mb-4 animate-fade-in-up relative z-50" onClick={(e) => e.stopPropagation()}>
        {/* Month Filter */}
        <div className="relative">
          <button 
            onClick={() => { setMonthOpen(!monthOpen); setGenreOpen(false); }}
            className={`font-serif text-2xl font-bold flex items-center gap-2 transition-colors ${selectedMonth ? 'text-[#4F46E5] dark:text-[#6366F1]' : 'text-[#1A1A18] dark:text-[#FAFAF9]'}`}
          >
            {selectedMonth || 'All Months'} <ChevronDown className={`w-5 h-5 transition-transform ${monthOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {monthOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#121211] border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg shadow-xl py-2 z-50 animate-fade-in-up">
              <button 
                onClick={() => { setSelectedMonth(null); setMonthOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!selectedMonth ? 'font-bold text-[#4F46E5] dark:text-[#6366F1]' : 'text-gray-600 dark:text-gray-400'}`}
              >
                All Months
              </button>
              {availableMonths.map(m => (
                <button 
                  key={m}
                  onClick={() => { setSelectedMonth(m); setMonthOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedMonth === m ? 'font-bold text-[#4F46E5] dark:text-[#6366F1]' : 'text-[#1A1A18] dark:text-[#FAFAF9]'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Genre Filter */}
        <div className="relative">
          <button 
            onClick={() => { setGenreOpen(!genreOpen); setMonthOpen(false); }}
            className={`font-serif text-2xl font-bold flex items-center gap-2 transition-colors ${selectedGenre ? 'text-[#4F46E5] dark:text-[#6366F1]' : 'text-gray-400 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'}`}
          >
            {selectedGenre ? (selectedGenre === 'economics' ? 'Economy' : selectedGenre === 'science' ? 'Technology' : selectedGenre === 'social' ? 'Business' : 'History') : 'Genre'} <ChevronDown className={`w-5 h-5 transition-transform ${genreOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {genreOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#121211] border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg shadow-xl py-2 z-50 animate-fade-in-up">
              <button 
                onClick={() => { setSelectedGenre(null); setGenreOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!selectedGenre ? 'font-bold text-[#4F46E5] dark:text-[#6366F1]' : 'text-gray-600 dark:text-gray-400'}`}
              >
                All Genres
              </button>
              {availableGenres.map(g => (
                <button 
                  key={g}
                  onClick={() => { setSelectedGenre(g); setGenreOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedGenre === g ? 'font-bold text-[#4F46E5] dark:text-[#6366F1]' : 'text-[#1A1A18] dark:text-[#FAFAF9]'}`}
                >
                  {g === 'economics' ? 'Economy' : g === 'science' ? 'Technology' : g === 'social' ? 'Business' : 'History'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col border-t border-[#E5E5E3] dark:border-[#2E2E2C] animate-fade-in-up [animation-delay:100ms]">
        {filteredPassages.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-sm">
            No passages found for the selected filters.
          </div>
        ) : (
          filteredPassages.map((p, idx) => {
          const dateObj = new Date(p.published_date);
          const day = dateObj.getDate().toString().padStart(2, '0');
          const isAttempted = attempts.some(a => a.passage_id === p.id);
          const isToday = p.published_date === new Date().toISOString().split('T')[0];

          return (
            <div key={p.id} className="flex items-center justify-between py-5 border-b border-[#E5E5E3] dark:border-[#2E2E2C] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-2 animate-fade-in-up" style={{ animationDelay: `${(idx + 2) * 50}ms` }}>
              
              <div className="flex items-center gap-6 w-full">
                <span className="font-mono text-gray-500 dark:text-gray-400 font-semibold w-6">{day}</span>
                <span className={`font-serif text-lg font-bold truncate max-w-[200px] sm:max-w-[400px] ${!isAttempted && !isToday ? 'opacity-80' : 'text-[#1A1A18] dark:text-[#FAFAF9]'}`}>
                  {p.title}
                </span>
                
                <span className="hidden sm:flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border border-[#E5E5E3] dark:border-[#2E2E2C] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20">
                  {p.topic === 'economics' ? 'Economy' : p.topic === 'science' ? 'Technology' : p.topic === 'social' ? 'Business' : 'History'}
                </span>
              </div>

              <div className="shrink-0 pl-4">
                {isAttempted ? (
                  <Link href={`/rc/${p.id}/results`} className="px-6 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600/20 dark:text-green-400 dark:hover:bg-green-600/30 rounded font-mono transition-colors flex items-center justify-center gap-2 shadow-sm w-[120px]">
                    <CheckCircle2 className="w-4 h-4" /> Results
                  </Link>
                ) : isToday ? (
                  <Link href={`/rc/${p.id}`} className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded font-mono transition-colors shadow-sm flex items-center justify-center w-[120px]">
                    Attempt
                  </Link>
                ) : (
                  <Link href={`/rc/${p.id}`} className="px-6 py-2.5 text-xs font-bold text-[#1A1A18] dark:text-[#FAFAF9] bg-white dark:bg-[#121211] border border-[#E5E5E3] dark:border-[#2E2E2C] hover:bg-gray-50 dark:hover:bg-white/5 rounded font-mono transition-colors flex items-center justify-center w-[120px]">
                    Attempt
                  </Link>
                )}
              </div>

            </div>
          );
        }))}
      </div>
      
    </div>
  );
}
