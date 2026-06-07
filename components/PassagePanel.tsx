'use client';

import React, { useState } from 'react';
import { Passage } from '../types';
import { getDifficultyLabel, getDifficultyColor } from '../lib/utils';
import { BookOpen, AlertCircle } from 'lucide-react';

interface PassagePanelProps {
  passage: Passage;
}

export default function PassagePanel({ passage }: PassagePanelProps) {
  const [fontSize, setFontSize] = useState(17);
  const getDifficultyDots = (diff: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`Difficulty: ${getDifficultyLabel(diff)}`}>
        <span className="text-[#4F46E5] dark:text-[#6366F1]">●</span>
        <span className={diff >= 2 ? "text-[#4F46E5] dark:text-[#6366F1]" : "text-gray-300 dark:text-gray-700"}>●</span>
        <span className={diff >= 3 ? "text-[#4F46E5] dark:text-[#6366F1]" : "text-gray-300 dark:text-gray-700"}>●</span>
      </div>
    );
  };

  return (
    <article className="h-full flex flex-col select-none">
      <div className="flex items-center justify-between border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-3 mb-4 text-xs font-mono font-semibold text-gray-500 shrink-0 min-h-[44px]">
        <span className="uppercase tracking-wider">READING COMPREHENSION PASSAGE</span>
        <div className="flex items-center gap-0.5 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-md bg-[#FAFAF9] dark:bg-[#121211] px-1 py-0.5 text-[#1A1A18] dark:text-[#FAFAF9]">
          <button onClick={() => setFontSize(s => Math.max(13, s - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#E5E5E3] dark:hover:bg-[#2E2E2C] rounded transition-colors font-serif" title="Decrease text size">A-</button>
          <div className="w-px h-3 bg-[#E5E5E3] dark:bg-[#2E2E2C] mx-0.5"></div>
          <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#E5E5E3] dark:hover:bg-[#2E2E2C] rounded transition-colors text-sm font-serif" title="Increase text size">A+</button>
        </div>
      </div>

      {/* Passage Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div 
          className="font-sans leading-[1.8] text-[#1A1A18] dark:text-gray-300 space-y-6 antialiased transition-all"
          style={{ textRendering: 'optimizeLegibility', fontSize: `${fontSize}px` }}
        >
          {passage.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="indent-0">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
