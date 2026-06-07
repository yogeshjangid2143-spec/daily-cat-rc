'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, Sparkles, Clock } from 'lucide-react';
import { getMockStorage, mockDb } from '../../lib/supabase';
import { LeaderboardEntry } from '../../types';
import LeaderboardTable from '../../components/LeaderboardTable';

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('weekly');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const { currentUser } = getMockStorage();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);

    // Calculate time until weekly reset (Monday 00:00:00)
    const updateResetTimer = () => {
      const now = new Date();
      const nextMonday = new Date();
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      nextMonday.setHours(0, 0, 0, 0);

      const diffMs = nextMonday.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${diffDays}d ${diffHrs}h ${diffMins}m`);
    };

    updateResetTimer();
    const interval = setInterval(updateResetTimer, 60000);

    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await mockDb.getLeaderboard();

        if (activeTab === 'alltime') {
          // Simulate all-time leaderboard by sorting based on streak and adding offset points
          const alltimeData = data.map((e) => ({
            ...e,
            weekly_score: e.weekly_score + (e.streak_count * 5) + 30, // larger scores
            avg_accuracy: Math.min(98, e.avg_accuracy + 2),
          })).sort((a, b) => b.weekly_score - a.weekly_score);
          setEntries(alltimeData);
        } else {
          // Weekly data
          setEntries(data);
        }
      } catch (err) {
        console.error("Failed to load leaderboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
    return () => clearInterval(interval);
  }, [activeTab, router]);

  if (loading && entries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
        <span className="font-mono text-xs text-gray-500">Recalibrating ranking board...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      
      {/* Header and Reset Timer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E3] dark:border-[#27272A] pb-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A18] dark:text-[#FAFAF9]">
            The Leaderboard
          </h1>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Compete against daily CAT aspirants. Consistent practice delivers higher ranks.
          </p>
        </div>

        {/* Reset time label */}
        <div className="flex items-center gap-2 border border-[#E5E5E3] dark:border-[#27272A] px-3.5 py-2 rounded-md bg-white dark:bg-[#18181B] font-mono text-xs select-none">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="text-left">
            <p className="text-[9px] text-gray-400 uppercase font-semibold">Weekly Reset In</p>
            <p className="font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{timeLeft}</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector & Subtext */}
      <div className="flex items-center justify-between">
        <div className="flex border border-[#E5E5E3] dark:border-[#27272A] rounded-md p-1 bg-white dark:bg-[#18181B] select-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'weekly'
                ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                : 'text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={`px-4 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'alltime'
                ? 'bg-[#4F46E5] dark:bg-[#6366F1] text-white'
                : 'text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'
            }`}
          >
            All-Time
          </button>
        </div>

        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
          Showing top 50 participants
        </span>
      </div>

      {/* Leaderboard Table Component */}
      {loading ? (
        <div className="h-96 w-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
        </div>
      ) : (
        <LeaderboardTable entries={entries} currentUserId={user?.id} />
      )}

    </div>
  );
}
