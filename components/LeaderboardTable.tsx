'use client';

import React from 'react';
import { LeaderboardEntry } from '../types';
import { cn } from '../lib/utils';
import { Flame, Trophy, Award, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  // Take top 3 for the podium
  const podiumEntries = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  // Helper to render rank icons
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-500 fill-amber-50" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400 fill-slate-50" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700 fill-amber-50/50" />;
      default:
        return <span className="font-mono text-xs font-bold text-gray-500">{rank}</span>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top 3 Podium */}
      {podiumEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end justify-center py-6 border-b border-[#E5E5E3] dark:border-[#2E2E2C] max-w-2xl mx-auto w-full">
          {/* 2nd Place */}
          {podiumEntries[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                {podiumEntries[1].avatar_url ? (
                  <img
                    src={podiumEntries[1].avatar_url}
                    alt={podiumEntries[1].name || ''}
                    className="w-12 h-12 rounded-full border-2 border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 flex items-center justify-center font-mono font-bold text-slate-500">
                    {getInitials(podiumEntries[1].name)}
                  </div>
                )}
                <div className="absolute -bottom-1.5 -right-1 bg-slate-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white">
                  2
                </div>
              </div>
              <div className="text-center w-full max-w-[100px] truncate">
                <p className="text-xs font-semibold text-[#1A1A18] dark:text-[#FAFAF9] truncate">
                  {podiumEntries[1].name}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  {podiumEntries[1].weekly_score} pts
                </p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1C1C1A] border border-[#E5E5E3] dark:border-[#2E2E2C] h-16 rounded-t-lg mt-3 flex items-center justify-center">
                <span className="font-serif text-xl font-bold text-slate-400">2nd</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {podiumEntries[0] && (
            <div className="flex flex-col items-center -order-1 md:order-none">
              <div className="relative mb-2">
                {podiumEntries[0].avatar_url ? (
                  <img
                    src={podiumEntries[0].avatar_url}
                    alt={podiumEntries[0].name || ''}
                    className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 flex items-center justify-center font-mono font-bold text-amber-600">
                    {getInitials(podiumEntries[0].name)}
                  </div>
                )}
                <div className="absolute -bottom-1.5 -right-1 bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-white">
                  1
                </div>
              </div>
              <div className="text-center w-full max-w-[120px] truncate">
                <p className="text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9] truncate">
                  {podiumEntries[0].name}
                </p>
                <p className="text-xs text-gray-500 font-mono font-semibold">
                  {podiumEntries[0].weekly_score} pts
                </p>
              </div>
              <div className="w-full bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 h-24 rounded-t-lg mt-3 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-amber-500">1st</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {podiumEntries[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                {podiumEntries[2].avatar_url ? (
                  <img
                    src={podiumEntries[2].avatar_url}
                    alt={podiumEntries[2].name || ''}
                    className="w-11 h-11 rounded-full border-2 border-amber-700/40 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-amber-50/20 dark:bg-amber-950/10 border-2 border-amber-700/40 flex items-center justify-center font-mono font-bold text-amber-800">
                    {getInitials(podiumEntries[2].name)}
                  </div>
                )}
                <div className="absolute -bottom-1.5 -right-1 bg-amber-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white">
                  3
                </div>
              </div>
              <div className="text-center w-full max-w-[100px] truncate">
                <p className="text-xs font-semibold text-[#1A1A18] dark:text-[#FAFAF9] truncate">
                  {podiumEntries[2].name}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  {podiumEntries[2].weekly_score} pts
                </p>
              </div>
              <div className="w-full bg-amber-50/20 dark:bg-amber-950/5 border border-[#E5E5E3] dark:border-[#2E2E2C] h-12 rounded-t-lg mt-3 flex items-center justify-center">
                <span className="font-serif text-lg font-bold text-amber-700">3rd</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="overflow-x-auto border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#121211] border-b border-[#E5E5E3] dark:border-[#2E2E2C] text-xs font-mono font-semibold text-gray-500 uppercase">
              <th className="px-5 py-3.5 text-center w-16">Rank</th>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5 text-center w-24">Weekly Score</th>
              <th className="px-5 py-3.5 text-center w-24">Avg Accuracy</th>
              <th className="px-5 py-3.5 text-center w-24">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E3] dark:divide-[#2E2E2C] text-sm">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === currentUserId;

              return (
                <tr
                  key={entry.id}
                  className={cn(
                    "transition-colors duration-100 hover:bg-gray-50/40 dark:hover:bg-black/10",
                    isCurrentUser ? "bg-[#4F46E5]/5 dark:bg-[#6366F1]/5 font-medium" : "bg-white dark:bg-black/5"
                  )}
                >
                  <td className="px-5 py-4 text-center">{getRankBadge(rank)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.name || ''}
                          className="w-8 h-8 rounded-full object-cover border border-[#E5E5E3] dark:border-[#2E2E2C]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#E5E5E3]/40 dark:bg-[#2E2E2C]/50 flex items-center justify-center font-mono font-bold text-xs text-gray-600 dark:text-gray-400">
                          {getInitials(entry.name)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[#1A1A18] dark:text-[#FAFAF9] flex items-center gap-1.5">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-[10px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1] px-1.5 py-0.2 bg-[#4F46E5]/10 dark:bg-[#6366F1]/10 rounded">
                              YOU
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-mono font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                    {entry.weekly_score}
                  </td>
                  <td className="px-5 py-4 text-center font-mono text-gray-600 dark:text-gray-400">
                    {entry.avg_accuracy}%
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 font-mono font-semibold">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{entry.streak_count}</span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 font-sans">
                  No competitors on the leaderboard yet. Be the first to secure a spot!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
