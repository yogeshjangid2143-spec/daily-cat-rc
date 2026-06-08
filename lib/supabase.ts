import { createClient } from '@supabase/supabase-js';
import { Profile, Passage, Question, Attempt, LeaderboardEntry } from '../types';
import { getISTDateString } from './utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  SUPABASE_URL !== '' && 
  SUPABASE_ANON_KEY !== '' && 
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your_supabase_url_here');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ==========================================
// MOCK DATABASE & LOGIC FOR OFFLINE DEMO
// ==========================================

const SAMPLE_PASSAGE: Passage = {
  id: 'd9b7f5c1-1e9a-4c28-98e3-5cb783ba0a12',
  title: "India's GDP Trajectory and Structural Imperatives",
  content: `India's recent economic expansion presents a dual narrative of aggregate growth and persistent structural bottlenecks. On paper, the country remains one of the fastest-growing major economies globally, with GDP growth hovering between 6.5% and 7.2% in recent quarters. This aggregate momentum is primarily fueled by public sector capital expenditures and a robust service sector—led by software services, financial consulting, and telecom. However, a deeper examination reveals a consumption dichotomy, often characterized as a K-shaped recovery. While premium goods, real estate, and high-end services are experiencing robust demand, rural demand and mass-market consumer goods are sluggish. This divergence raises critical questions about the inclusivity and sustainability of India's growth engine.

The core challenge lies in the manufacturing sector's inability to absorb India's massive demographic dividend. Despite government programs like "Make in India" and Production Linked Incentive (PLI) schemes designed to spur domestic manufacturing, the sector's contribution to GDP remains stagnant around 14-16%. Instead, millions of workers leaving agriculture are bypassing the industrial sector entirely, moving directly into low-productivity services, informal retail, or construction. Economists call this premature deindustrialization. The primary impediments are well-known: regulatory compliance burdens, complex land acquisition processes, archaic labor laws, and a pronounced skill mismatch. While India produces millions of graduates annually, only a fraction possess the technical skills required by modern manufacturing and high-end services.

Moreover, private sector capital investment (private capex) has been slow to take off, leaving the government to do the heavy lifting of infrastructure building. Corporate balance sheets have deleveraged significantly, and bank balance sheets are healthier than they have been in a decade, yet corporations remain hesitant to commit capital to greenfield projects. This caution stems from concerns over long-term demand visibility and the high cost of doing business. Additionally, the regulatory environment is perceived as volatile, with sudden changes in tariff structures or compliance mandates. To secure a sustained 8% growth path, India must shift from public-led investment to private-led growth, while aggressively reforming its agricultural and labor ecosystems to create mass-market employment.`,
  word_count: 365,
  difficulty: 2, // hard
  topic: 'economics',
  published_date: new Date().toISOString().split('T')[0],
  is_active: true,
  created_at: new Date().toISOString(),
};

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    passage_id: SAMPLE_PASSAGE.id,
    question_text: "Which of the following best summarizes the 'consumption dichotomy' described by the author in the passage?",
    option_a: "A. A significant gap between the growth of software services and traditional manufacturing industries.",
    option_b: "B. Robust demand for premium goods alongside sluggish rural and mass-market consumer demand.",
    option_c: "C. A conflict between government infrastructure capital expenditures and private sector investment.",
    option_d: "D. The contrast between high graduate output and low employment rates in rural sectors.",
    correct_option: "B",
    explanation: "The passage directly defines this dichotomy (often referred to as a 'K-shaped recovery') by contrasting robust demand in premium goods, real estate, and high-end services with sluggish rural demand and mass-market consumer goods. Option B captures this exactly, while Option A and C focus on sector growth and investments, not consumption.",
    question_type: "main_idea",
    order_index: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q2',
    passage_id: SAMPLE_PASSAGE.id,
    question_text: "What does the author imply by using the term 'premature deindustrialization' in the second paragraph?",
    option_a: "A. The industrial sector is actively shrinking due to automation and technological advancement.",
    option_b: "B. India is skipping the traditional transition to manufacturing, with laborers moving from agriculture straight into low-productivity services.",
    option_c: "C. Government schemes like PLI are shutting down early due to lack of corporate interest.",
    option_d: "D. Foreign companies are exiting the Indian market due to complex compliance burdens.",
    correct_option: "B",
    explanation: "The text explains that workers leaving agriculture are bypassing the industrial sector entirely and moving directly into low-productivity services or construction. The term refers to an economy shifting to services without first building a robust manufacturing core. Option B represents this implication correctly.",
    question_type: "inference",
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q3',
    passage_id: SAMPLE_PASSAGE.id,
    question_text: "According to the passage, which of the following is NOT listed as a barrier to manufacturing growth in India?",
    option_a: "A. A lack of corporate credit availability and high bank non-performing assets.",
    option_b: "B. Regulatory compliance burdens and volatile tariff structures.",
    option_c: "C. Challenges in acquiring land and archaic labor laws.",
    option_d: "D. A skill mismatch that leaves graduates unemployable in modern industry.",
    correct_option: "A",
    explanation: "The passage notes that 'bank balance sheets are healthier than they have been in a decade,' indicating that a lack of bank credit availability or bad loans is NOT the current bottleneck. In contrast, compliance burdens (Option B), land acquisition and labor laws (Option C), and skill mismatches (Option D) are explicitly mentioned as primary impediments.",
    question_type: "factual",
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q4',
    passage_id: SAMPLE_PASSAGE.id,
    question_text: "Based on the text, what is the author's tone regarding India's future economic prospects?",
    option_a: "A. Uncritically optimistic, focusing primarily on the 7.2% GDP growth rate.",
    option_b: "B. Alarmist and dismissive, claiming that the economic model is on the verge of collapse.",
    option_c: "C. Analytical and cautious, acknowledging growth while highlighting key structural challenges.",
    option_d: "D. Indifferent, presenting raw statistics without prescribing any reforms.",
    correct_option: "C",
    explanation: "The author is objective and analytical: acknowledging India's status as a fast-growing economy (6.5%-7.2% growth) but raising serious concerns about sustainability, consumption disparities, and structural issues like low manufacturing absorption. The tone is therefore analytical and cautious, not alarmist or uncritically optimistic.",
    question_type: "tone",
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q5',
    passage_id: SAMPLE_PASSAGE.id,
    question_text: "It can be inferred from the passage that a shift from public-led to private-led growth requires:",
    option_a: "A. The government to completely stop investing in public infrastructure projects.",
    option_b: "B. Corporations gaining better long-term demand visibility and a more stable regulatory environment.",
    option_c: "C. A complete ban on software and service imports to force domestic spending.",
    option_d: "D. Forcing agricultural workers to remain on farms through regulatory mandates.",
    correct_option: "B",
    explanation: "The passage notes that private sector caution stems from 'concerns over long-term demand visibility' and a 'volatile' regulatory environment. Therefore, for the private sector to lead growth, corporations would need better demand visibility and regulatory stability. Option B directly addresses these core factors.",
    question_type: "inference",
    order_index: 4,
    created_at: new Date().toISOString(),
  },
];

// Helper to check client side
const isClient = typeof window !== 'undefined';

const MOCK_PROFILES_KEY = 'dailycatrc_profiles';
const MOCK_ATTEMPTS_KEY = 'dailycatrc_attempts';
const CURRENT_USER_KEY = 'dailycatrc_current_user';

// Mock other users for leaderboard and benchmarking
const INITIAL_LEADERBOARD_USERS = [
  { id: 'u1', name: 'Rohan Sharma', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', streak_count: 24, weekly_score: 23, attempts_this_week: 5, avg_accuracy: 92.0 },
  { id: 'u2', name: 'Priya Patel', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', streak_count: 18, weekly_score: 21, attempts_this_week: 5, avg_accuracy: 84.0 },
  { id: 'u3', name: 'Ananya Iyer', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', streak_count: 14, weekly_score: 20, attempts_this_week: 5, avg_accuracy: 80.0 },
  { id: 'u4', name: 'Amit Verma', avatar_url: null, streak_count: 8, weekly_score: 18, attempts_this_week: 5, avg_accuracy: 72.0 },
  { id: 'u5', name: 'Vikram Singh', avatar_url: null, streak_count: 31, weekly_score: 17, attempts_this_week: 4, avg_accuracy: 85.0 },
  { id: 'u6', name: 'Sneha Reddy', avatar_url: null, streak_count: 5, weekly_score: 15, attempts_this_week: 4, avg_accuracy: 75.0 },
  { id: 'u7', name: 'Rahul Gupta', avatar_url: null, streak_count: 0, weekly_score: 12, attempts_this_week: 3, avg_accuracy: 80.0 },
];

export const getMockStorage = () => {
  if (!isClient) {
    return {
      profiles: [] as Profile[],
      attempts: [] as Attempt[],
      currentUser: null as Profile | null,
    };
  }

  let profiles: Profile[] = [];
  let attempts: Attempt[] = [];
  let currentUser: Profile | null = null;

  try {
    const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
    const rawAttempts = localStorage.getItem(MOCK_ATTEMPTS_KEY);
    const rawUser = localStorage.getItem(CURRENT_USER_KEY);

    if (rawProfiles) {
      profiles = JSON.parse(rawProfiles);
    } else {
      // Seed initial profiles
      profiles = INITIAL_LEADERBOARD_USERS.map(u => ({
        id: u.id,
        name: u.name,
        avatar_url: u.avatar_url,
        streak_count: u.streak_count,
        last_active_date: new Date().toISOString().split('T')[0],
        is_pro: false,
        preferred_difficulty: 2,
        streak_freezes_left: 1,
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      }));
      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
    }

    if (rawAttempts) {
      attempts = JSON.parse(rawAttempts);
    } else {
      // Seed some attempts
      attempts = [];
      // Let's seed for other users
      INITIAL_LEADERBOARD_USERS.forEach(u => {
        attempts.push({
          id: `att_${u.id}`,
          user_id: u.id,
          passage_id: SAMPLE_PASSAGE.id,
          answers: { 'q1': 'B', 'q2': 'B', 'q3': 'A', 'q4': 'C', 'q5': 'B' },
          score: Math.round((u.avg_accuracy / 100) * 5),
          total_questions: 5,
          time_taken_seconds: 400 + Math.floor(Math.random() * 300),
          completed_at: new Date().toISOString(),
        });
      });
      localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(attempts));
    }

    if (rawUser) {
      currentUser = JSON.parse(rawUser);
    }
  } catch (e) {
    console.error('Failed to load mock storage', e);
  }

  return { profiles, attempts, currentUser };
};

export const setMockStorage = (data: { profiles?: Profile[]; attempts?: Attempt[]; currentUser?: Profile | null }) => {
  if (!isClient) return;
  try {
    if (data.profiles !== undefined) {
      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(data.profiles));
    }
    if (data.attempts !== undefined) {
      localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(data.attempts));
    }
    if (data.currentUser !== undefined) {
      if (data.currentUser === null) {
        localStorage.removeItem(CURRENT_USER_KEY);
      } else {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.currentUser));
      }
    }
  } catch (e) {
    console.error('Failed to write mock storage', e);
  }
};

// Database Mock Helper Implementation
export const mockDb = {
  getTodayPassage: async (): Promise<{ passage: Passage; questions: Question[] }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await fetch('/api/passage/today', { cache: 'no-store' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch today passage');
        }
        return await res.json();
      } catch (e) {
        console.error("Fetch API Error:", e);
        throw e;
      }
    }

    return {
      passage: SAMPLE_PASSAGE,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      questions: SAMPLE_QUESTIONS.map(({ correct_option, explanation, ...q }) => q as Question),
    };
  },

  getTodayPassageWithAnswers: async (): Promise<{ passage: Passage; questions: Question[] }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await fetch('/api/passage/today', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch today passage');
        const data = await res.json();
        // Now fetch it explicitly with answers
        const ansRes = await fetch(`/api/passage/${data.passage.id}?answers=true`, { cache: 'no-store' });
        if (!ansRes.ok) throw new Error('Failed to fetch answers');
        return await ansRes.json();
      } catch (e) {
        console.error("Fetch API Error:", e);
        throw e;
      }
    }

    return {
      passage: SAMPLE_PASSAGE,
      questions: SAMPLE_QUESTIONS,
    };
  },

  getAttempt: async (userId: string, passageId: string): Promise<Attempt | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('passage_id', passageId)
        .maybeSingle();
      if (error || !data) return null;
      return data as Attempt;
    }

    const { attempts } = getMockStorage();
    return attempts.find(a => a.user_id === userId && a.passage_id === passageId) || null;
  },

  getUserAttempts: async (userId: string): Promise<Attempt[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', userId);
      if (error || !data) return [];
      return data as Attempt[];
    }

    const { attempts } = getMockStorage();
    return attempts.filter(a => a.user_id === userId);
  },

  submitAttempt: async (
    userId: string,
    passageId: string,
    answers: Record<string, string>,
    timeTaken: number,
    questionTimes: Record<string, number> = {}
  ): Promise<{ score: number; total: number; streak_count: number; streak_freezes_left: number; preferred_difficulty: number }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            passage_id: passageId,
            answers,
            time_taken_seconds: timeTaken,
            question_times: questionTimes
          })
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to submit attempt');
        }
        
        return await res.json();
      } catch (e) {
        console.error("Submit API Error:", e);
        throw e;
      }
    }

    const { attempts, profiles, currentUser } = getMockStorage();
    
    // Calculate score
    let score = 0;
    const total = SAMPLE_QUESTIONS.length;
    SAMPLE_QUESTIONS.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score++;
      }
    });

    const newAttempt: Attempt = {
      id: `att_${userId}_${Date.now()}`,
      user_id: userId,
      passage_id: passageId,
      answers: answers as Record<string, 'A' | 'B' | 'C' | 'D'>,
      score,
      total_questions: total,
      time_taken_seconds: timeTaken,
      question_times: questionTimes,
      completed_at: new Date().toISOString(),
    };

    // Prevent duplicate attempts
    const alreadyAttempted = attempts.some(a => a.user_id === userId && a.passage_id === passageId);
    const updatedAttempts = [...attempts];
    if (!alreadyAttempted) {
      updatedAttempts.push(newAttempt);
    }

    // Update Profile Streak
    const userProfile = profiles.find(p => p.id === userId) || currentUser;
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = userProfile.streak_count;
    let newFreezes = userProfile.streak_freezes_left;

    if (!userProfile.last_active_date) {
      newStreak = 1;
    } else if (userProfile.last_active_date === todayStr) {
      // already active today, streak doesn't change
    } else if (userProfile.last_active_date === yesterdayStr) {
      newStreak += 1;
    } else {
      // Check for streak freeze
      if (newFreezes > 0) {
        newStreak += 1;
        newFreezes -= 1;
      } else {
        newStreak = 1;
      }
    }

    // Auto promote difficulty check
    let prefDiff = userProfile.preferred_difficulty;
    const userAttempts = updatedAttempts.filter(a => a.user_id === userId);
    const totalSolved = userAttempts.length;
    const sumAccuracy = userAttempts.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0);
    const avgAccuracy = totalSolved > 0 ? sumAccuracy / totalSolved : 0;

    if (prefDiff < 3) {
      if (totalSolved >= 7 && avgAccuracy >= 0.75 && prefDiff === 1) {
        prefDiff = 2;
      } else if (totalSolved >= 14 && avgAccuracy >= 0.80 && prefDiff === 2) {
        prefDiff = 3;
      }
    }

    const updatedProfile: Profile = {
      ...userProfile,
      streak_count: newStreak,
      streak_freezes_left: newFreezes,
      last_active_date: todayStr,
      preferred_difficulty: prefDiff,
    };

    // Save updated profiles
    const updatedProfiles = profiles.map(p => p.id === userId ? updatedProfile : p);
    if (!profiles.some(p => p.id === userId)) {
      updatedProfiles.push(updatedProfile);
    }

    setMockStorage({
      attempts: updatedAttempts,
      profiles: updatedProfiles,
      currentUser: currentUser?.id === userId ? updatedProfile : currentUser,
    });

    return {
      score,
      total,
      streak_count: newStreak,
      streak_freezes_left: newFreezes,
      preferred_difficulty: prefDiff,
    };
  },

  getLeaderboard: async (period: 'weekly' | 'alltime' = 'weekly'): Promise<LeaderboardEntry[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return await res.json();
      } catch (err) {
        console.error("Leaderboard API fetch error:", err);
      }
    }

    const { profiles, attempts } = getMockStorage();
    
    // Calculate real leaderboard for offline fallback
    const entries: LeaderboardEntry[] = profiles.map(p => {
      const userAttempts = attempts.filter(a => a.user_id === p.id);
      
      const filteredAttempts = userAttempts.filter(a => {
        if (period === 'alltime') return true;
        const date = new Date(a.completed_at);
        
        const nowUTC = new Date();
        const istTime = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);
        const day = istTime.getUTCDay();
        const daysToSubtract = day === 0 ? 6 : day - 1;
        
        const mondayIST = new Date(istTime);
        mondayIST.setUTCDate(istTime.getUTCDate() - daysToSubtract);
        mondayIST.setUTCHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(mondayIST.getTime() - 5.5 * 60 * 60 * 1000);
        return date >= startOfWeek;
      });

      const totalScore = filteredAttempts.reduce((sum, a) => sum + Number(a.score), 0);
      const totalQuestions = filteredAttempts.reduce((sum, a) => sum + Number(a.total_questions), 0);
      const avgAccuracy = totalQuestions > 0 
        ? Math.round((totalScore / totalQuestions) * 1000) / 10 
        : 0;

      return {
        id: p.id,
        name: p.name || 'Anonymous User',
        avatar_url: p.avatar_url,
        streak_count: p.streak_count,
        weekly_score: totalScore,
        attempts_this_week: filteredAttempts.length,
        avg_accuracy: avgAccuracy,
      };
    }).filter(e => e.attempts_this_week > 0);

    return entries.sort((a, b) => b.weekly_score - a.weekly_score);
  },

  getTodayPercentile: async (score: number): Promise<number> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_today_percentile', { p_score: score });
      if (error) {
        console.error('Error fetching percentile:', error);
        return 100;
      }
      return data;
    }

    const { attempts } = getMockStorage();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Get all scores from today
    const todayAttempts = attempts.filter(a => a.completed_at.startsWith(todayStr));
    if (todayAttempts.length <= 1) {
      return 100; // top since you're the first/only one
    }

    const lowerScoresCount = todayAttempts.filter(a => a.score < score).length;
    const percentile = Math.round((lowerScoresCount / todayAttempts.length) * 100);
    return Math.max(10, Math.min(100, percentile));
  },

  getPassageById: async (idStr: string, withAnswers = false): Promise<{ passage: Passage; questions: Question[] }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await fetch(`/api/passage/${idStr}${withAnswers ? '?answers=true' : ''}`, { cache: 'no-store' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch passage by ID');
        }
        return await res.json();
      } catch (e) {
        console.error("Fetch API Error:", e);
        throw e;
      }
    }

    // Mock fallback
    const history = await mockDb.getPassagesHistory();
    const mockPassage = history.find(p => p.id === idStr);
    if (!mockPassage) throw new Error('No passage found for ' + idStr);
    return {
      passage: mockPassage,
      questions: SAMPLE_QUESTIONS.map(q => ({ ...q, passage_id: mockPassage.id }))
    };
  },

  getPassagesHistory: async (): Promise<Passage[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .eq('is_active', true)
        .lte('published_date', getISTDateString())
        .order('published_date', { ascending: false });
      if (error || !data) return [];
      return data as Passage[];
    }
    
    // Fallback Mock Data for demo mode
    const today = new Date();
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
    const d3 = new Date(today); d3.setDate(d3.getDate() - 3);
    const d4 = new Date(today); d4.setDate(d4.getDate() - 4);

    return [
      { ...SAMPLE_PASSAGE, published_date: today.toISOString().split('T')[0] },
      { ...SAMPLE_PASSAGE, id: 'past-1', published_date: d1.toISOString().split('T')[0], title: 'Crises of Aging and Economic Productivity', topic: 'economics' },
      { ...SAMPLE_PASSAGE, id: 'past-2', published_date: d2.toISOString().split('T')[0], title: "The AI Revolution's Corporate Conundrum", topic: 'science' },
      { ...SAMPLE_PASSAGE, id: 'past-3', published_date: d3.toISOString().split('T')[0], title: "Ascending India's Elite Business Academy", topic: 'social' },
      { ...SAMPLE_PASSAGE, id: 'past-4', published_date: d4.toISOString().split('T')[0], title: "Ancient Greece's Coercive Empire Unveiled", topic: 'history' },
    ];
  }
};
