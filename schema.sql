-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  streak_count INT DEFAULT 0,
  last_active_date DATE,
  is_pro BOOLEAN DEFAULT FALSE,
  preferred_difficulty SMALLINT DEFAULT 1 CHECK (preferred_difficulty IN (1, 2, 3)),
  streak_freezes_left INT DEFAULT 1 CHECK (streak_freezes_left >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow system/users to insert profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create passages table
CREATE TABLE IF NOT EXISTS passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INT,
  difficulty SMALLINT CHECK (difficulty IN (1, 2, 3)), -- 1=moderate, 2=hard, 3=very hard
  topic TEXT CHECK (topic IN ('economics', 'science', 'literature', 'social', 'abstract')),
  published_date DATE UNIQUE NOT NULL, -- one passage per day
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on passages
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on active passages" ON passages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admins all access on passages" ON passages
  FOR ALL USING (true); -- Custom claims or admin roles can be configured here

-- 3. Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID REFERENCES passages(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) CHECK (correct_option IN ('A','B','C','D')),
  explanation TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('inference', 'main_idea', 'vocabulary', 'tone', 'factual')),
  order_index SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- We will fetch questions without correct_option/explanation through a secure Next.js API route using the Service Role Key
DROP POLICY IF EXISTS "Allow public read on questions" ON questions;

-- 4. Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- { "question_id": "A", "question_id": "C", ... }
  score INT NOT NULL,
  total_questions INT NOT NULL,
  time_taken_seconds INT,
  question_times JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, passage_id) -- prevent re-attempts
);

-- Enable RLS on attempts
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create weekly_leaderboard view
CREATE OR REPLACE VIEW weekly_leaderboard AS
SELECT 
  p.id,
  p.name,
  p.avatar_url,
  p.streak_count,
  COALESCE(SUM(a.score), 0) as weekly_score,
  COUNT(a.id) as attempts_this_week,
  ROUND(COALESCE(AVG(a.score::decimal / NULLIF(a.total_questions, 0) * 100), 0), 1) as avg_accuracy
FROM profiles p
JOIN attempts a ON a.user_id = p.id
WHERE a.completed_at >= date_trunc('week', now())
GROUP BY p.id, p.name, p.avatar_url, p.streak_count
ORDER BY weekly_score DESC;

-- 6. Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, streak_count, is_pro, preferred_difficulty, streak_freezes_left)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    0,
    false,
    1,
    1
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RPC Function for atomic submission, streak calculation, and auto-promotion
CREATE OR REPLACE FUNCTION submit_attempt_and_update_streak(
  p_user_id UUID,
  p_passage_id UUID,
  p_answers JSONB,
  p_score INT,
  p_total_questions INT,
  p_time_taken INT,
  p_question_times JSONB
) RETURNS JSONB AS $$
DECLARE
  v_last_active DATE;
  v_streak INT;
  v_freezes INT;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_is_pro BOOLEAN;
  v_preferred_difficulty INT;
BEGIN
  -- Insert the attempt
  INSERT INTO attempts (user_id, passage_id, answers, score, total_questions, time_taken_seconds, question_times)
  VALUES (p_user_id, p_passage_id, p_answers, p_score, p_total_questions, p_time_taken, p_question_times);

  -- Get current profile details
  SELECT last_active_date, streak_count, streak_freezes_left, is_pro, preferred_difficulty
  INTO v_last_active, v_streak, v_freezes, v_is_pro, v_preferred_difficulty
  FROM profiles WHERE id = p_user_id;

  -- Update streak logic
  IF v_last_active IS NULL THEN
    v_streak := 1;
  ELSIF v_last_active = v_today THEN
    -- already attempted today, streak remains same
  ELSIF v_last_active = v_yesterday THEN
    v_streak := v_streak + 1;
  ELSE
    -- Check if streak freeze is available AND they only missed EXACTLY one day!
    IF v_freezes > 0 AND v_last_active = (v_today - INTERVAL '2 days') THEN
      -- Use streak freeze, keep streak alive!
      v_streak := v_streak + 1;
      v_freezes := v_freezes - 1;
    ELSE
      v_streak := 1;
    END IF;
  END IF;

  -- Update the profile
  UPDATE profiles
  SET streak_count = v_streak,
      streak_freezes_left = v_freezes,
      last_active_date = v_today
  WHERE id = p_user_id;

  -- Auto-promote difficulty if user solves 7+ RCs with high accuracy
  IF v_preferred_difficulty < 3 THEN
    DECLARE
      v_recent_accuracy DECIMAL;
      v_recent_count INT;
    BEGIN
      SELECT COUNT(*), AVG(score::decimal / total_questions)
      INTO v_recent_count, v_recent_accuracy
      FROM attempts
      WHERE user_id = p_user_id;

      IF v_recent_count >= 7 AND v_recent_accuracy >= 0.75 AND v_preferred_difficulty = 1 THEN
        UPDATE profiles SET preferred_difficulty = 2 WHERE id = p_user_id;
        v_preferred_difficulty := 2;
      ELSIF v_recent_count >= 14 AND v_recent_accuracy >= 0.80 AND v_preferred_difficulty = 2 THEN
        UPDATE profiles SET preferred_difficulty = 3 WHERE id = p_user_id;
        v_preferred_difficulty := 3;
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'score', p_score,
    'total_questions', p_total_questions,
    'streak_count', v_streak,
    'streak_freezes_left', v_freezes,
    'preferred_difficulty', v_preferred_difficulty
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Secure Percentile Calculator (Bypasses RLS to count all today's scores)
CREATE OR REPLACE FUNCTION get_today_percentile(p_score INT)
RETURNS FLOAT AS $$
DECLARE
  v_total INT;
  v_lower INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM attempts WHERE completed_at >= CURRENT_DATE;
  
  IF v_total <= 1 THEN
    RETURN 100.0;
  END IF;

  SELECT COUNT(*) INTO v_lower FROM attempts WHERE completed_at >= CURRENT_DATE AND score < p_score;

  RETURN GREATEST(10.0, LEAST(100.0, ROUND((v_lower::decimal / v_total) * 100)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

