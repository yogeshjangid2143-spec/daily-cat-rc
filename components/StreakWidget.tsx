'use client';

import React from 'react';
import { Flame, Snowflake, CheckCircle2, Circle } from 'lucide-react';
import { Profile } from '../types';

interface StreakWidgetProps {
  profile: Profile;
  attemptsDates?: string[]; // Array of YYYY-MM-DD dates the user solved RCs
  onActivateFreeze?: () => void;
}

export default function StreakWidget({
  profile,
  attemptsDates = [],
  onActivateFreeze,
}: StreakWidgetProps) {
  // Generate last 7 days including today
  const getLast7Days = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = weekdays[d.getDay()];
      const isToday = i === 0;
      
      // Check if attempted
      const attempted = attemptsDates.includes(dateStr);
      
      days.push({
        dateStr,
        dayName,
        isToday,
        attempted,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];
  const attemptedToday = attemptsDates.includes(todayStr);

  return (
    <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              Current Streak
            </h4>
            <p className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
              {profile.streak_count} {profile.streak_count === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Streak Freeze Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold font-mono text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20">
            <Snowflake className="w-3.5 h-3.5" />
            <span>FREEZE {profile.streak_freezes_left > 0 ? 'AVAILABLE' : 'USED'}</span>
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {profile.streak_freezes_left} left this week
          </span>
        </div>
      </div>

      {/* 7-day strip */}
      <div className="grid grid-cols-7 gap-1.5 border-t border-b border-[#E5E5E3] dark:border-[#2E2E2C] py-4 select-none">
        {last7Days.map((day) => (
          <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
              {day.dayName}
            </span>
            <div className="relative">
              {day.attempted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
              ) : day.isToday ? (
                <Flame className="w-5 h-5 text-amber-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-700" />
              )}
            </div>
            {day.isToday && (
              <span className="text-[8px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1] uppercase">
                Today
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status warning / CTA */}
      <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {!attemptedToday ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>You haven't solved today's RC yet. Keep your streak alive!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Today's practice complete. Come back tomorrow!</span>
          </div>
        )}
      </div>
    </div>
  );
}
