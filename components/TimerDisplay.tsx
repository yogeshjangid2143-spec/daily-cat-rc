'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatTime } from '../lib/utils';

interface TimerDisplayProps {
  onTick?: (seconds: number) => void;
  active: boolean;
}

export default function TimerDisplay({ onTick, active }: TimerDisplayProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, onTick]);

  const showWarning = seconds >= 18 * 60; // 18 minutes

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-md bg-[#FAFAF9] dark:bg-[#121211] font-mono text-sm select-none">
        <Clock className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
        <span className="font-semibold text-[#1A1A18] dark:text-[#FAFAF9]">
          {formatTime(seconds)}
        </span>
      </div>
      {showWarning && (
        <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          Most users finish in under 15 min
        </span>
      )}
    </div>
  );
}
