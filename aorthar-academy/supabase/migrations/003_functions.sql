-- ═══════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — DATABASE FUNCTIONS & TRIGGERS
-- Migration: 003_functions.sql
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_courses
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_lessons
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_course_grades
  BEFORE UPDATE ON course_grades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_user_progress
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_capstone
  BEFORE UPDATE ON capstone_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- GPA COMPUTATION (called by Edge Functions)
-- ─────────────────────────────────────────────

-- Calculate and store semester GPA for a user + semester
CREATE OR REPLACE FUNCTION compute_semester_gpa(
  p_user_id    UUID,
  p_semester_id UUID
) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_gpa            NUMERIC;
  v_total_credits  INTEGER;
  v_year_id        UUID;
BEGIN
  SELECT year_id INTO v_year_id FROM semesters WHERE id = p_semester_id;

  SELECT
    ROUND(
      SUM(cg.grade_points * c.credit_units) / NULLIF(SUM(c.credit_units), 0),
      2
    ),
    SUM(c.credit_units)
  INTO v_gpa, v_total_credits
  FROM course_grades cg
  JOIN courses c ON c.id = cg.course_id
  WHERE cg.user_id = p_user_id
    AND c.semester_id = p_semester_id
    AND cg.passed = true;

  v_gpa := COALESCE(v_gpa, 0);
  v_total_credits := COALESCE(v_total_credits, 0);

  INSERT INTO semester_gpas (user_id, year_id, semester_id, gpa, total_credits)
  VALUES (p_user_id, v_year_id, p_semester_id, v_gpa, v_total_credits)
  ON CONFLICT (user_id, semester_id)
  DO UPDATE SET gpa = v_gpa, total_credits = v_total_credits, computed_at = NOW();

  RETURN v_gpa;
END;
$$;

-- Calculate and store cumulative GPA
CREATE OR REPLACE FUNCTION compute_cumulative_gpa(p_user_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_gpa   NUMERIC;
  v_total INTEGER;
BEGIN
  SELECT
    ROUND(
      SUM(cg.grade_points * c.credit_units) / NULLIF(SUM(c.credit_units), 0),
      2
    ),
    SUM(c.credit_units)
  INTO v_gpa, v_total
  FROM course_grades cg
  JOIN courses c ON c.id = cg.course_id
  WHERE cg.user_id = p_user_id AND cg.passed = true;

  v_gpa  := COALESCE(v_gpa, 0);
  v_total := COALESCE(v_total, 0);

  INSERT INTO cumulative_gpas (user_id, cumulative_gpa, total_credits_earned)
  VALUES (p_user_id, v_gpa, v_total)
  ON CONFLICT (user_id)
  DO UPDATE SET cumulative_gpa = v_gpa, total_credits_earned = v_total, computed_at = NOW();

  RETURN v_gpa;
END;
$$;

-- ─────────────────────────────────────────────
-- COOLDOWN ENFORCEMENT
-- ─────────────────────────────────────────────

-- Check if user is on cooldown for a course assessment
CREATE OR REPLACE FUNCTION is_on_cooldown(
  p_user_id         UUID,
  p_course_id       UUID,
  p_assessment_type TEXT
) RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM quiz_attempts
    WHERE user_id = p_user_id
      AND course_id = p_course_id
      AND assessment_type = p_assessment_type
      AND cooldown_until > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  );
$$;

-- Get attempt count for a user/course/type
CREATE OR REPLACE FUNCTION get_attempt_count(
  p_user_id         UUID,
  p_course_id       UUID,
  p_assessment_type TEXT
) RETURNS INTEGER LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER
  FROM quiz_attempts
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND assessment_type = p_assessment_type
    AND completed_at IS NOT NULL;
$$;

-- ─────────────────────────────────────────────
-- PROGRESSION CHECKS
-- ─────────────────────────────────────────────

-- Check if all courses in a semester are passed by user
CREATE OR REPLACE FUNCTION semester_completed(
  p_user_id     UUID,
  p_semester_id UUID
) RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM courses c
    WHERE c.semester_id = p_semester_id
      AND c.status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM course_grades cg
        WHERE cg.user_id = p_user_id
          AND cg.course_id = c.id
          AND cg.passed = true
      )
  );
$$;

-- Check if all courses in a year are passed by user
CREATE OR REPLACE FUNCTION year_completed(
  p_user_id UUID,
  p_year_id  UUID
) RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM courses c
    WHERE c.year_id = p_year_id
      AND c.status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM course_grades cg
        WHERE cg.user_id = p_user_id
          AND cg.course_id = c.id
          AND cg.passed = true
      )
  );
$$;

-- ─────────────────────────────────────────────
-- CONTRIBUTOR ROLE AUTO-PROMOTION
-- ─────────────────────────────────────────────

-- When a user reaches 3 approved suggestions, promote to contributor
CREATE OR REPLACE FUNCTION check_contributor_promotion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NEW.status = 'approved' THEN
    SELECT COUNT(*) INTO v_count
    FROM suggestions
    WHERE proposer_id = NEW.proposer_id AND status = 'approved';

    IF v_count >= 3 THEN
      UPDATE profiles
      SET role = 'contributor'
      WHERE user_id = NEW.proposer_id AND role = 'student';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_suggestion_approved
  AFTER UPDATE ON suggestions
  FOR EACH ROW EXECUTE FUNCTION check_contributor_promotion();

-- ─────────────────────────────────────────────
-- SUBSCRIPTION EXPIRY
-- ─────────────────────────────────────────────

-- Mark expired subscriptions (run via pg_cron or scheduled Edge Function)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date < NOW();
$$;
