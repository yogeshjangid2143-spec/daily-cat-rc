'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Flame, User, LogOut, Sun, Moon, Sparkles, Crown } from 'lucide-react';
import { getMockStorage, setMockStorage, isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile } from '../types';
import PremiumModal from './PremiumModal';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignedOutToast, setShowSignedOutToast] = useState(false);

  useEffect(() => {
    if (showSignedOutToast) {
      const timer = setTimeout(() => {
        setShowSignedOutToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSignedOutToast]);

  useEffect(() => {
    setMounted(true);
    // Initialize dark mode from html class
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                     localStorage.getItem('theme') === 'dark';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Load user state
    const loadUser = async () => {
      let { currentUser } = getMockStorage();
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'lulujangid@gmail.com';
          if (session.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

          if (!currentUser) {
            const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (dbProfile) {
              currentUser = dbProfile as Profile;
              setMockStorage({ currentUser });
            } else {
              currentUser = { name: session.user.user_metadata?.full_name || 'Reader', is_pro: false } as Profile;
            }
          }
        } else {
          setIsAdmin(false);
        }
      }
      setUser(currentUser);
    };

    loadUser();

    // Check search params for sign out action
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'signedout') {
        setShowSignedOutToast(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // Listen for custom events or storage updates
    window.addEventListener('storage', loadUser);
    window.addEventListener('user-state-change', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('user-state-change', loadUser);
    };
  }, [pathname]);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error(e);
    }
    setMockStorage({ currentUser: null });
    setUser(null);
    window.dispatchEvent(new Event('user-state-change'));
    router.push('/?action=signedout');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
    <nav className="sticky top-0 z-40 w-full border-b border-[#E5E5E3] dark:border-[#27272A] bg-[#FAFAF9]/80 dark:bg-[#18181B]/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A18] dark:text-[#FAFAF9]">
            dailycat<span className="text-[#4F46E5] dark:text-[#6366F1]">rc</span>
          </span>
        </Link>

        {/* Middle Navigation Links (Visible when logged in) */}
        {mounted && user && (
          <div className="hidden md:flex items-center gap-6 text-sm font-mono font-semibold">
            <Link
              href="/dashboard"
              className={`transition-colors ${
                isActive('/dashboard')
                  ? 'text-[#4F46E5] dark:text-[#6366F1]'
                  : 'text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/history"
              className={`transition-colors ${
                isActive('/history')
                  ? 'text-[#4F46E5] dark:text-[#6366F1]'
                  : 'text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'
              }`}
            >
              Passage Archive
            </Link>

            <Link
              href="/leaderboard"
              className={`transition-colors ${
                isActive('/leaderboard')
                  ? 'text-[#4F46E5] dark:text-[#6366F1]'
                  : 'text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9]'
              }`}
            >
              Leaderboard
            </Link>
          </div>
        )}

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {mounted && user && (
            <button
              onClick={() => setPremiumModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all hover:scale-105"
            >
              <Crown className="w-3 h-3" />
              Upgrade to Pro
            </button>
          )}
          
          {/* Dark Mode Switch */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-md border border-[#E5E5E3] dark:border-[#27272A] flex items-center justify-center text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9] transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Section */}
          {mounted && (
            user ? (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Streak Count quick preview */}
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-mono font-bold text-xs border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.streak_count}</span>
                </div>
                
                {/* User Dropdown / Nav Items */}
                <div 
                  className="relative z-50"
                  onMouseEnter={() => setMenuOpen(true)}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-full bg-[#E5E5E3] dark:bg-[#27272A] flex items-center justify-center text-sm font-bold text-[#1A1A18] dark:text-[#FAFAF9] overflow-hidden border border-[#E5E5E3] dark:border-[#27272A] block">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  
                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48">
                      <div className="border border-[#E5E5E3] dark:border-[#27272A] bg-white dark:bg-[#18181B] rounded-md shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-2 border-b border-[#E5E5E3] dark:border-[#27272A] text-xs font-semibold text-gray-500 truncate dark:text-gray-400">
                      Signed in as <br />
                      <span className="font-mono text-[#1A1A18] dark:text-[#FAFAF9] font-bold">{user.name}</span>
                    </div>

                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold border-b border-[#E5E5E3] dark:border-[#27272A]">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Admin Portal
                        </div>
                      </Link>
                    )}
                    
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/20">
                      Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block md:hidden px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/20">
                      Dashboard
                    </Link>

                    <Link href="/history" onClick={() => setMenuOpen(false)} className="block md:hidden px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/20">
                      Passage Archive
                    </Link>

                    <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="block md:hidden px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/20">
                      Leaderboard
                    </Link>
                    
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                  </div>
                  )}
                </div>
              </div>
            ) : (
              !pathname.startsWith('/auth') && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-1.5 text-xs font-semibold font-mono border border-[#E5E5E3] dark:border-[#27272A] hover:border-gray-400 dark:hover:border-gray-600 rounded-md text-[#1A1A18] dark:text-[#FAFAF9] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3.5 py-1.5 text-xs font-semibold font-mono bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] rounded-md text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )
          )}

        </div>
      </div>
    </nav>
    <PremiumModal isOpen={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />

    {/* Fullscreen Sign-out Overlay */}
    {loggingOut && (
      <div className="fixed inset-0 bg-[#FAFAF9]/60 dark:bg-[#18181B]/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] dark:border-t-[#6366F1] animate-spin" />
        <span className="font-mono text-xs text-gray-500">Signing out securely...</span>
      </div>
    )}

    {/* Floating Success Toast */}
    {showSignedOutToast && (
      <>
        <style>{`
          @keyframes slideUpFade {
            from {
              opacity: 0;
              transform: translateY(1rem);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-toast {
            animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-[#1C1C1A] border border-[#E5E5E3] dark:border-[#27272A] rounded-lg shadow-xl text-xs font-mono text-gray-700 dark:text-gray-300 animate-toast">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Signed out successfully</span>
        </div>
      </>
    )}
    </>
  );
}
