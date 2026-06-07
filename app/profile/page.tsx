'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Sparkles, 
  Flame, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Edit, 
  Check 
} from 'lucide-react';
import { getMockStorage, setMockStorage, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Profile, Attempt } from '@/types';
import { formatTime } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingPro, setUpdatingPro] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadProfileData = async () => {
      const { currentUser } = getMockStorage();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      let profile = currentUser;
      let userAttempts: Attempt[] = [];

      let userEmail = `${currentUser.name?.toLowerCase().replace(/\s/g, '')}@dailycatrc.com`;

      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            userEmail = session.user.email;
          }

          // Fetch fresh profile from Supabase
          const { data: dbProfile, error: pErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          if (pErr) throw pErr;
          if (dbProfile) {
            profile = dbProfile as Profile;
            // Sync to local cache
            setMockStorage({ currentUser: profile });
          }

          // Fetch attempts from Supabase
          const { data: dbAttempts, error: aErr } = await supabase
            .from('attempts')
            .select('*')
            .eq('user_id', currentUser.id);
          if (aErr) throw aErr;
          if (dbAttempts) {
            userAttempts = dbAttempts as Attempt[];
          }
        } else {
          const { attempts: allAttempts } = getMockStorage();
          userAttempts = allAttempts.filter((a) => a.user_id === currentUser.id);
        }
      } catch (err) {
        console.error("Failed to load profile data from Supabase, using local fallback:", err);
        const { attempts: allAttempts } = getMockStorage();
        userAttempts = allAttempts.filter((a) => a.user_id === currentUser.id);
      }

      setUser(profile);
      setNameInput(profile.name || '');
      setUserEmail(userEmail);
      
      // Sort attempts
      userAttempts.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      setAttempts(userAttempts);
      setLoading(false);
    };

    loadProfileData();
  }, [router]);

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    
    const updatedName = nameInput.trim();

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ name: updatedName })
          .eq('id', user.id);
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message || "Failed to save name to Supabase.");
      return;
    }
    
    const { profiles } = getMockStorage();
    const updatedProfile: Profile = {
      ...user,
      name: updatedName,
    };

    // Save
    const updatedProfiles = profiles.map(p => p.id === user.id ? updatedProfile : p);
    setMockStorage({
      profiles: updatedProfiles,
      currentUser: updatedProfile,
    });
    
    setUser(updatedProfile);
    setEditing(false);
    
    // Dispatch state update event to header
    window.dispatchEvent(new Event('user-state-change'));
  };

  const handleUpgradePro = async () => {
    if (!user) return;
    setUpdatingPro(true);
    
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', user.id);
        if (error) throw error;
      } else {
        // Simulate payment / gateway redirect
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } catch (err: any) {
      alert(err.message || "Failed to upgrade pro status in Supabase.");
      setUpdatingPro(false);
      return;
    }
    
    const { profiles } = getMockStorage();
    const updatedProfile: Profile = {
      ...user,
      is_pro: true,
    };

    setMockStorage({
      profiles: profiles.map(p => p.id === user.id ? updatedProfile : p),
      currentUser: updatedProfile,
    });

    setUser(updatedProfile);
    setUpdatingPro(false);
    window.dispatchEvent(new Event('user-state-change'));
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
        <span className="font-mono text-xs text-gray-500">Loading your profile data...</span>
      </div>
    );
  }

  // Calculate statistics
  const totalSolved = attempts.length;
  const bestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0);
  const avgAccuracy = totalSolved > 0 
    ? Math.round((attempts.reduce((sum, a) => sum + (a.score / a.total_questions), 0) / totalSolved) * 100)
    : 0;

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttempts = attempts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attempts.length / itemsPerPage);

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      
      {/* Profile Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Avatar, details */}
        <div className="md:col-span-8 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          
          <div className="w-20 h-20 rounded-full bg-[#E5E5E3] dark:bg-[#2E2E2C] flex items-center justify-center font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9] border border-[#E5E5E3] dark:border-[#2E2E2C] overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              {editing ? (
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 font-sans text-sm px-2.5 py-1 border border-[#E5E5E3] dark:border-[#2E2E2C] bg-[#FAFAF9] dark:bg-black/20 text-[#1A1A18] dark:text-[#FAFAF9] rounded outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                  <button onClick={handleSaveName} className="p-1 border border-green-200 dark:border-green-800 text-green-600 rounded bg-green-50 dark:bg-green-950/20">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                    {user.name}
                  </h2>
                  <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9] transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </>
              )}

              {user.is_pro ? (
                <span className="text-[9px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1] border border-[#4F46E5]/35 dark:border-[#6366F1]/35 px-1.5 py-0.5 rounded bg-[#4F46E5]/5 dark:bg-[#6366F1]/5 uppercase tracking-widest flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  PRO MEMBER
                </span>
              ) : (
                <span className="text-[9px] font-mono font-semibold text-gray-400 border border-gray-200 dark:border-[#2E2E2C] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  FREE TIER
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {userEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Pro upgrade widget */}
        <div className="md:col-span-4 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col justify-between gap-4">
          {user.is_pro ? (
            <div className="flex flex-col gap-2 text-center items-center my-auto">
              <Sparkles className="w-8 h-8 text-[#4F46E5] dark:text-[#6366F1] animate-bounce" />
              <p className="font-serif text-lg font-bold text-[#1A1A18] dark:text-[#FAFAF9]">Pro Access is Active</p>
              <p className="font-sans text-[11px] text-gray-400">Thank you for preparing with dailycatrc! You have access to all dashboards.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 h-full justify-between">
              <div>
                <p className="font-serif text-xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                  Go Professional
                </p>
                <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  Access 500+ past CAT-level RCs, full accuracy analytics, and percentile tracking.
                </p>
              </div>
              <button
                onClick={handleUpgradePro}
                disabled={updatingPro}
                className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-mono font-semibold text-xs rounded transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {updatingPro ? 'Processing...' : 'Upgrade to Pro — ₹999'}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-1 items-center text-center">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-50" />
          <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Streak</span>
          <span className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{user.streak_count} Days</span>
        </div>

        {/* Total RCs */}
        <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-1 items-center text-center">
          <Award className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
          <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Total Solved</span>
          <span className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{totalSolved}</span>
        </div>

        {/* Avg Accuracy */}
        <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-1 items-center text-center">
          <TrendingUp className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
          <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Avg Accuracy</span>
          <span className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{avgAccuracy}%</span>
        </div>

        {/* Best Score */}
        <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-1 items-center text-center">
          <CheckCircle2 className="w-5 h-5 text-[#4F46E5] dark:text-[#6366F1]" />
          <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Best Score</span>
          <span className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">{bestScore}/5</span>
        </div>

      </div>

      {/* Attempt History Section */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-2">
          <h3 className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
            Attempt History
          </h3>
        </div>

        <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg overflow-hidden bg-white dark:bg-[#121211]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#121211] border-b border-[#E5E5E3] dark:border-[#2E2E2C] text-xs font-mono font-semibold text-gray-500 uppercase">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Passage / Topic</th>
                <th className="px-5 py-3.5 text-center w-28">Score</th>
                <th className="px-5 py-3.5 text-center w-28">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] dark:divide-[#2E2E2C] text-sm">
              {currentAttempts.map((att) => {
                const date = new Date(att.completed_at);
                const isTodayStr = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                return (
                  <tr key={att.id} className="hover:bg-gray-50/50 dark:hover:bg-black/10 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-sans font-medium text-[#1A1A18] dark:text-[#FAFAF9]">
                      <div className="flex items-center gap-2">
                        {isTodayStr ? (
                          <Link href="/rc/today/results" className="hover:underline hover:text-[#4F46E5] dark:hover:text-[#6366F1]">
                            India's GDP Trajectory and Structural Challenges
                          </Link>
                        ) : (
                          <span>CAT Verbal Passage #{att.id.split('_').pop() || '1'}</span>
                        )}
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#2E2E2C] text-gray-500">
                          {isTodayStr ? 'economics' : 'literature'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-semibold text-[#1A1A18] dark:text-[#FAFAF9]">
                      {att.score}/5
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-xs text-gray-500">
                      {formatTime(att.time_taken_seconds)}
                    </td>
                  </tr>
                );
              })}

              {attempts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                    No attempts completed. Solve today's daily RC to see your history!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-[#E5E5E3] dark:border-[#2E2E2C] px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-[#121211] font-mono text-xs select-none">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded hover:bg-gray-100 dark:hover:bg-black/20 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded hover:bg-gray-100 dark:hover:bg-black/20 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
