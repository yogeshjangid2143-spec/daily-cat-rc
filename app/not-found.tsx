'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center relative overflow-hidden bg-[#FAFAF9] dark:bg-[#121211]">
      
      {/* Massive Background 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-10 select-none">
        <span className="text-[40vw] font-black font-serif text-[#1A1A18] dark:text-[#FAFAF9] leading-none tracking-tighter">
          404
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Accent Bar */}
        <div className="w-24 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />

        {/* Text Content */}
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1A18] dark:text-[#FAFAF9] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-mono max-w-2xl mx-auto leading-relaxed">
            The page you are looking for has either been deleted, never existed, or is locked away in a different timeline. 
          </p>
        </div>

        {/* Large Action Button */}
        <Link 
          href="/"
          className="group relative mt-4 px-10 py-5 bg-[#1A1A18] dark:bg-[#FAFAF9] hover:bg-black dark:hover:bg-white text-white dark:text-[#1A1A18] rounded-xl font-mono font-bold text-lg flex items-center gap-4 transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-white/10"
        >
          <ChevronLeft className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </Link>
        
      </div>
      
    </div>
  );
}
