-- ═══════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — LEARNING FEATURES (THEME+REACTIONS+QUIZ+DEEP DIVE)
-- Migration: 006_learning_features.sql
-- ═══════════════════════════════════════════════════════════════

-- Question metadata for generated fallback quizzes
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'generated')),
  ADD COLUMN IF NOT EXISTS generation_version TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_questions_active
  ON questions (course_id, is_exam_question, is_active);

-- Persist question payload shown to user so quiz page can resume reliably
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS questions_snapshot JSONB;

-- ─────────────────────────────────────────────
-- Lesson reactions
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  reaction   TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_reactions_lesson
  ON lesson_reactions (lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_reactions_user_course
  ON lesson_reactions (user_id, course_id);

ALTER TABLE lesson_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_reactions'
      AND policyname = 'Users manage own lesson reactions'
  ) THEN
    CREATE POLICY "Users manage own lesson reactions"
      ON lesson_reactions FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_reactions'
      AND policyname = 'Admins read all lesson reactions'
  ) THEN
    CREATE POLICY "Admins read all lesson reactions"
      ON lesson_reactions FOR SELECT
      USING (is_admin());
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Deep-dive generated links
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_deep_dive_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  query      TEXT NOT NULL,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL CHECK (url ~* '^https?://'),
  source     TEXT NOT NULL DEFAULT 'youtube_search',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, url)
);

CREATE INDEX IF NOT EXISTS idx_deep_dive_links_lesson
  ON lesson_deep_dive_links (lesson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deep_dive_links_creator
  ON lesson_deep_dive_links (created_by, course_id);

ALTER TABLE lesson_deep_dive_links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_deep_dive_links'
      AND policyname = 'Users manage own deep dive links'
  ) THEN
    CREATE POLICY "Users manage own deep dive links"
      ON lesson_deep_dive_links FOR ALL
      USING (auth.uid() = created_by)
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_deep_dive_links'
      AND policyname = 'Admins read all deep dive links'
  ) THEN
    CREATE POLICY "Admins read all deep dive links"
      ON lesson_deep_dive_links FOR SELECT
      USING (is_admin());
  END IF;
END $$;

-- Keep updated_at trigger behavior consistent
DROP TRIGGER IF EXISTS set_updated_at_lesson_reactions ON lesson_reactions;
CREATE TRIGGER set_updated_at_lesson_reactions
  BEFORE UPDATE ON lesson_reactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
