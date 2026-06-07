'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, X, Zap, Target, BarChart2, BookOpen } from 'lucide-react';

import { createPortal } from 'react-dom';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setJoined(true);
      // Here we would typically send this to our backend/Supabase
      setTimeout(() => {
        onClose();
        setJoined(false);
        setEmail('');
      }, 2500);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18181B] border border-[#E5E5E3] dark:border-[#27272A] rounded-2xl shadow-2xl animate-fade-in-up [animation-duration:300ms]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white/50 dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50 pointer-events-none" />

        <div className="p-8 relative">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Coming Soon
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9] mb-3 leading-tight">
            Unlock Your True <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              CAT Potential
            </span>
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 font-sans text-sm mb-8 leading-relaxed">
            DailyCatRC Premium is currently in development. We are building the ultimate toolkit to push your Reading Comprehension score to the 99th percentile.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9]">Unlimited Archive</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Solve hundreds of past passages instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9]">Deep Analytics</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Identify weak question types and timing flaws.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9]">Targeted Practice</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Generate passages on your weakest topics.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9]">AI Explanations</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Understand exactly why an option is incorrect.</p>
              </div>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-[#E5E5E3] dark:border-[#27272A]">
            {joined ? (
              <div className="text-center py-3 animate-fade-in-up">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-[#1A1A18] dark:text-[#FAFAF9]">You're on the list!</h4>
                <p className="text-xs text-gray-500 mt-1">We'll notify you the moment Premium launches.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="flex flex-col gap-3">
                <label className="text-xs font-bold text-[#1A1A18] dark:text-[#FAFAF9] uppercase tracking-wider font-mono">
                  Join the Waitlist
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    className="flex-1 bg-white dark:bg-[#18181B] border border-[#E5E5E3] dark:border-[#27272A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold font-mono text-sm px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 whitespace-nowrap"
                  >
                    Get Early Access
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
