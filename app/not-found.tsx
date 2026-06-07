'use client';

import React from 'react';
import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-in fade-in zoom-in duration-500">
      
      {/* 404 Graphic */}
      <div className="relative mb-8">
        <h1 className="text-[120px] md:text-[180px] font-black font-serif text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-50 dark:from-gray-800 dark:to-[#121211] select-none leading-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white dark:bg-[#121211] rounded-full border-4 border-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <SearchX className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-serif font-bold text-[#1A1A18] dark:text-[#FAFAF9] mb-4">
        Passage Not Found
      </h2>
      
      <p className="text-gray-500 dark:text-gray-400 font-mono text-sm max-w-md mb-10">
        It looks like this reading comprehension passage got lost in the archives, or the link you followed is incorrect.
      </p>

      <Link 
        href="/"
        className="px-8 py-3.5 bg-[#1A1A18] dark:bg-[#FAFAF9] hover:bg-black dark:hover:bg-white text-white dark:text-[#1A1A18] rounded-xl font-mono font-bold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-white/10"
      >
        <Home className="w-4 h-4" />
        Return to Homepage
      </Link>
      
    </div>
  );
}
