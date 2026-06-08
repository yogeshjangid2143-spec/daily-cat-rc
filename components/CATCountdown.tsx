'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface CATCountdownProps {
  size?: 'sm' | 'lg';
}

export default function CATCountdown({ size = 'sm' }: CATCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const examDate = new Date('2026-11-30T00:00:00+05:30'); // Indian Time
      const now = new Date();
      
      const diffMs = examDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft('Exam Started/Ended');
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${diffDays}d ${diffHrs}h ${diffMins}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const isLg = size === 'lg';

  return (
    <div 
      className={`flex items-center select-none font-mono border border-red-200 dark:border-red-950/30 bg-red-50/30 dark:bg-red-950/5 whitespace-nowrap
        ${isLg 
          ? 'gap-4 px-6 py-3.5 rounded-lg text-sm' 
          : 'gap-3 px-4 py-2.5 rounded-md text-xs'}`}
    >
      <Calendar 
        className={`text-red-500 dark:text-red-400 shrink-0
          ${isLg ? 'w-6 h-6' : 'w-5 h-5'}`} 
      />
      <div className="text-left">
        <p 
          className={`text-red-500 dark:text-red-400 uppercase font-bold tracking-wider 
            ${isLg ? 'text-[10px]' : 'text-[9px]'}`}
        >
          CAT 2026 Countdown
        </p>
        <p 
          className={`font-bold text-[#1A1A18] dark:text-[#FAFAF9] 
            ${isLg ? 'text-xl mt-0.5' : 'text-xs'}`}
        >
          {timeLeft}
        </p>
      </div>
    </div>
  );
}
