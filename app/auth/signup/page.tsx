'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { getMockStorage, setMockStorage, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let authListener: any = null;

    const checkAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
          return;
        }

        // Listen for cross-tab login events (e.g., clicking verification link in email)
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.push('/dashboard');
          }
        });
        authListener = data.subscription;
      }
      const { currentUser } = getMockStorage();
      if (currentUser) {
        router.push('/dashboard');
      }
    };
    checkAuth();

    // The most reliable way to detect cross-tab login is the native 'storage' event
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen to our custom event just in case
    window.addEventListener('user-state-change', handleStorageChange);

    return () => {
      if (authListener) authListener.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-state-change', handleStorageChange);
    };
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (err) throw err;
        
        if (data?.user) {
          // If Supabase has "Confirm Email" enabled, the session will be null
          if (!data.session) {
            setSuccess("Success! Please check your email inbox to verify your account before logging in.");
            setLoading(false);
            return;
          }

          const newProfile = {
            id: data.user.id,
            name,
            avatar_url: null,
            streak_count: 0,
            last_active_date: null,
            is_pro: false,
            preferred_difficulty: 1,
            streak_freezes_left: 1,
            created_at: new Date().toISOString(),
          };
          setMockStorage({ currentUser: newProfile });
          window.dispatchEvent(new Event('user-state-change'));
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const { profiles } = getMockStorage();
        
        const exists = profiles.some(p => p.name?.toLowerCase() === name.toLowerCase());
        if (exists) {
          throw new Error("A user with this name already exists. Choose a different name.");
        }

        const newUserProfile: Profile = {
          id: 'user_' + Date.now(),
          name,
          avatar_url: null,
          streak_count: 0,
          last_active_date: null,
          is_pro: false,
          preferred_difficulty: 1,
          streak_freezes_left: 1,
          created_at: new Date().toISOString(),
        };

        const updatedProfiles = [...profiles, newUserProfile];
        setMockStorage({
          profiles: updatedProfiles,
          currentUser: newUserProfile
        });
        window.dispatchEvent(new Event('user-state-change'));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: err } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` }
        });
        if (err) throw err;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockGoogleUser: Profile = {
          id: 'google_user_123',
          name: 'Ishaan Deshmukh',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          streak_count: 5,
          last_active_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
          is_pro: false,
          preferred_difficulty: 2,
          streak_freezes_left: 1,
          created_at: new Date().toISOString(),
        };
        const { profiles } = getMockStorage();
        if (!profiles.some(p => p.id === mockGoogleUser.id)) {
          setMockStorage({ profiles: [...profiles, mockGoogleUser] });
        }
        setMockStorage({ currentUser: mockGoogleUser });
        window.dispatchEvent(new Event('user-state-change'));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px] border border-[#E5E5E3] dark:border-[#27272A] rounded-lg p-6 bg-white dark:bg-[#18181B] flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1.5">
          <h2 className="font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
            Create Account
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Sign up to build your streak and beat the rank
          </p>
        </div>

        {error && (
          <div className="p-3 border border-rose-200 dark:border-rose-950/30 rounded bg-rose-50 dark:bg-rose-950/15 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs font-sans leading-normal">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 border border-emerald-200 dark:border-emerald-950/30 rounded bg-emerald-50 dark:bg-emerald-950/15 flex items-start gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-sans leading-normal">
            <div className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">✓</div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-sans text-sm pl-10 pr-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] bg-[#FAFAF9] dark:bg-black/20 text-[#1A1A18] dark:text-[#FAFAF9] rounded outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-sans text-sm pl-10 pr-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] bg-[#FAFAF9] dark:bg-black/20 text-[#1A1A18] dark:text-[#FAFAF9] rounded outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-sans text-sm pl-10 pr-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] bg-[#FAFAF9] dark:bg-black/20 text-[#1A1A18] dark:text-[#FAFAF9] rounded outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-mono font-semibold text-xs rounded transition-colors duration-150 mt-2 flex items-center justify-center"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E5E5E3] dark:border-[#27272A]"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-mono font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-[#E5E5E3] dark:border-[#27272A]"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-2 border border-[#E5E5E3] dark:border-[#27272A] hover:bg-gray-50 dark:hover:bg-black/20 text-[#1A1A18] dark:text-[#FAFAF9] font-mono font-semibold text-xs rounded transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="text-center text-xs font-sans text-gray-500 dark:text-gray-400 mt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#4F46E5] dark:text-[#6366F1] font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
