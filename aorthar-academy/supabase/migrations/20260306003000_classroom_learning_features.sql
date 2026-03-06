ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS quiz_scope TEXT NOT NULL DEFAULT 'course'
    CHECK (quiz_scope IN ('lesson', 'course'));

CREATE INDEX IF NOT EXISTS idx_questions_course_lesson_active
  ON questions (course_id, lesson_id, is_exam_question, is_active);

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS quiz_scope TEXT NOT NULL DEFAULT 'course'
    CHECK (quiz_scope IN ('lesson', 'course'));

CREATE INDEX IF NOT EXISTS idx_attempts_course_lesson_scope
  ON quiz_attempts (user_id, course_id, lesson_id, assessment_type);

CREATE TABLE IF NOT EXISTS lesson_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  summary_markdown TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'openai',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, created_by)
);

ALTER TABLE lesson_summaries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_summaries'
      AND policyname = 'Users manage own lesson summaries'
  ) THEN
    CREATE POLICY "Users manage own lesson summaries"
      ON lesson_summaries FOR ALL
      USING (auth.uid() = created_by)
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_created
  ON lesson_comments (lesson_id, created_at DESC);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_comments'
      AND policyname = 'Users read lesson comments'
  ) THEN
    CREATE POLICY "Users read lesson comments"
      ON lesson_comments FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_comments'
      AND policyname = 'Users create lesson comments'
  ) THEN
    CREATE POLICY "Users create lesson comments"
      ON lesson_comments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_comments'
      AND policyname = 'Users update own lesson comments'
  ) THEN
    CREATE POLICY "Users update own lesson comments"
      ON lesson_comments FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_comments'
      AND policyname = 'Users delete own lesson comments'
  ) THEN
    CREATE POLICY "Users delete own lesson comments"
      ON lesson_comments FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lesson_comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES lesson_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment
  ON lesson_comment_reactions (comment_id);

ALTER TABLE lesson_comment_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_comment_reactions'
      AND policyname = 'Users manage own comment reactions'
  ) THEN
    CREATE POLICY "Users manage own comment reactions"
      ON lesson_comment_reactions FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_lesson_comments ON lesson_comments;
CREATE TRIGGER set_updated_at_lesson_comments
  BEFORE UPDATE ON lesson_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_lesson_comment_reactions ON lesson_comment_reactions;
CREATE TRIGGER set_updated_at_lesson_comment_reactions
  BEFORE UPDATE ON lesson_comment_reactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

