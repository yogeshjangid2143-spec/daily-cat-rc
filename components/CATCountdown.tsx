'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export default function CATCountdown() {
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

  return (
    <div className="flex items-center gap-2 border border-red-200 dark:border-red-950/30 px-3.5 py-2 rounded-md bg-red-50/30 dark:bg-red-950/5 font-mono text-xs select-none">
      <Calendar className="w-4 h-4 text-red-500 dark:text-red-400" />
      <div className="text-left">
        <p className="text-[9px] text-red-500 dark:text-red-400 uppercase font-bold tracking-wider">CAT 2026 Countdown</p>
        <p className="font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{timeLeft}</p>
      </div>
    </div>
  );
}
