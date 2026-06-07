'use client';

import React from 'react';

interface ScoreRingProps {
  score: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  total,
  size = 140,
  strokeWidth = 10,
}: ScoreRingProps) {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* SVG Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E5E3"
          strokeWidth={strokeWidth}
          className="dark:stroke-[#27272A]"
        />
        {/* Foreground Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out dark:stroke-[#6366F1]"
        />
      </svg>

      {/* Label in center */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-serif font-bold text-[#1A1A18] dark:text-[#FAFAF9] ${size < 100 ? 'text-lg' : 'text-3xl'}`}>
          {score}/{total}
        </span>
        {size >= 100 && (
          <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}
