export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  streak_count: number;
  last_active_date: string | null; // YYYY-MM-DD
  is_pro: boolean;
  preferred_difficulty: number; // 1 = moderate, 2 = hard, 3 = very hard
  streak_freezes_left: number; // defaults to 1, resets weekly
  created_at: string;
}

export type TopicType = 'economics' | 'science' | 'literature' | 'social' | 'abstract';

export interface Passage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  difficulty: number; // 1 = moderate, 2 = hard, 3 = very hard
  topic: TopicType;
  published_date: string; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
}

export type QuestionType = 'inference' | 'main_idea' | 'vocabulary' | 'tone' | 'factual';

export interface Question {
  id: string;
  passage_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string; // Hidden until attempt completed in some endpoints
  explanation?: string; // Hidden until attempt completed
  question_type: QuestionType;
  order_index: number;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  passage_id: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  avatar_url: string | null;
  streak_count: number;
  weekly_score: number;
  attempts_this_week: number;
  avg_accuracy: number;
}
