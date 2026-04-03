-- ═══════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE years               ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_grades       ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_gpas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumulative_gpas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE capstone_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans               ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_premium()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = auth.uid() AND status = 'active'
  );
$$;

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()) -- role unchanged
  );

-- ─────────────────────────────────────────────
-- YEARS & SEMESTERS (read-only for students)
-- ─────────────────────────────────────────────

CREATE POLICY "Authenticated users read years"
  ON years FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage years"
  ON years FOR ALL
  USING (is_admin());

CREATE POLICY "Authenticated users read semesters"
  ON semesters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage semesters"
  ON semesters FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────

-- Free courses (100–300) visible to all authenticated users
CREATE POLICY "Published free courses are viewable"
  ON courses FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'published'
    AND is_premium = false
  );

-- Premium courses visible to active subscribers
CREATE POLICY "Premium courses for subscribers"
  ON courses FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'published'
    AND is_premium = true
    AND is_premium()
  );

CREATE POLICY "Admins manage courses"
  ON courses FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- LESSONS & RESOURCES
-- ─────────────────────────────────────────────

CREATE POLICY "Users read lessons of accessible courses"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = lessons.course_id
        AND c.status = 'published'
        AND (c.is_premium = false OR is_premium())
    )
  );

CREATE POLICY "Admins manage lessons"
  ON lessons FOR ALL
  USING (is_admin());

CREATE POLICY "Users read resources of accessible lessons"
  ON resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = resources.lesson_id
        AND c.status = 'published'
        AND (c.is_premium = false OR is_premium())
    )
  );

CREATE POLICY "Admins manage resources"
  ON resources FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- QUESTIONS (never expose correct_answer to students)
-- ─────────────────────────────────────────────

-- Students CANNOT directly query questions table
-- Questions are served via Edge Function which strips correct_answer
CREATE POLICY "Admins manage questions"
  ON questions FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Insert allowed (Edge Function starts the attempt)
CREATE POLICY "Users create own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Updates only via Edge Functions (score, passed, completed_at)
-- Users cannot update their own attempts directly
CREATE POLICY "Admins read all attempts"
  ON quiz_attempts FOR SELECT
  USING (is_admin());

-- ─────────────────────────────────────────────
-- GRADES — immutable after write, no direct student update
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own grades"
  ON course_grades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage grades"
  ON course_grades FOR ALL
  USING (is_admin());

CREATE POLICY "Users read own semester GPAs"
  ON semester_gpas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own cumulative GPA"
  ON cumulative_gpas FOR SELECT
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- PROGRESSION
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage user progress"
  ON user_progress FOR ALL
  USING (is_admin());

CREATE POLICY "Users read own semester progress"
  ON semester_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage semester progress"
  ON semester_progress FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- CAPSTONE
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own capstone"
  ON capstone_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Premium users create capstone"
  ON capstone_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_premium());

CREATE POLICY "Users update own draft capstone"
  ON capstone_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'revision'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage capstone"
  ON capstone_submissions FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- SUGGESTIONS
-- ─────────────────────────────────────────────

CREATE POLICY "Users read own suggestions"
  ON suggestions FOR SELECT
  USING (auth.uid() = proposer_id);

CREATE POLICY "Authenticated users create suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = proposer_id AND status = 'pending');

CREATE POLICY "Admins manage suggestions"
  ON suggestions FOR ALL
  USING (is_admin());

-- ─────────────────────────────────────────────
-- MONETIZATION
-- ─────────────────────────────────────────────

CREATE POLICY "Anyone reads plans"
  ON plans FOR SELECT
  USING (true);

CREATE POLICY "Admins manage plans"
  ON plans FOR ALL
  USING (is_admin());

CREATE POLICY "Users read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions created/updated ONLY via Edge Functions
CREATE POLICY "Admins manage subscriptions"
  ON subscriptions FOR ALL
  USING (is_admin());

CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all transactions"
  ON transactions FOR SELECT
  USING (is_admin());
