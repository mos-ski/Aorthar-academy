-- ─────────────────────────────────────────────────────────────────────────────
-- 007_standalone_courses.sql
-- Standalone courses platform (courses.aorthar.com)
-- Self-hosted replacement for aorthar.teachwithdaba.com
-- Pay-per-course model, YouTube-powered lessons
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Standalone Courses ────────────────────────────────────────────────────────

CREATE TYPE standalone_course_status AS ENUM ('draft', 'published');

CREATE TABLE standalone_courses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT UNIQUE NOT NULL,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL DEFAULT '',
  long_description     TEXT NOT NULL DEFAULT '',
  thumbnail_url        TEXT,
  price_ngn            INTEGER NOT NULL DEFAULT 0, -- price in full NGN (e.g. 20000)
  instructor_name      TEXT NOT NULL DEFAULT 'Adedamola Adewale',
  instructor_avatar_url TEXT,
  status               standalone_course_status NOT NULL DEFAULT 'draft',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Standalone Lessons ────────────────────────────────────────────────────────

CREATE TABLE standalone_lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES standalone_courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  youtube_url  TEXT NOT NULL DEFAULT '',
  sort_order   SMALLINT NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, sort_order)
);

-- ── Purchases ─────────────────────────────────────────────────────────────────

CREATE TABLE standalone_purchases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id           UUID NOT NULL REFERENCES standalone_courses(id) ON DELETE RESTRICT,
  paystack_reference  TEXT UNIQUE NOT NULL,
  amount_paid_ngn     INTEGER NOT NULL,
  purchased_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- ── Lesson Progress ───────────────────────────────────────────────────────────

CREATE TABLE standalone_lesson_progress (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES standalone_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_standalone_courses_status ON standalone_courses(status);
CREATE INDEX idx_standalone_lessons_course ON standalone_lessons(course_id, sort_order);
CREATE INDEX idx_standalone_purchases_user ON standalone_purchases(user_id);
CREATE INDEX idx_standalone_purchases_course ON standalone_purchases(course_id);
CREATE INDEX idx_standalone_progress_user ON standalone_lesson_progress(user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_standalone_courses_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_standalone_courses_updated_at
  BEFORE UPDATE ON standalone_courses
  FOR EACH ROW EXECUTE FUNCTION update_standalone_courses_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE standalone_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_lesson_progress ENABLE ROW LEVEL SECURITY;

-- standalone_courses: anyone can read published; only admins can write
CREATE POLICY "standalone_courses_public_read"
  ON standalone_courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "standalone_courses_admin_all"
  ON standalone_courses FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- standalone_lessons: anyone can read published lessons of published courses;
-- only admins can write
CREATE POLICY "standalone_lessons_public_read"
  ON standalone_lessons FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM standalone_courses sc
      WHERE sc.id = course_id AND sc.status = 'published'
    )
  );

CREATE POLICY "standalone_lessons_admin_all"
  ON standalone_lessons FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- standalone_purchases: owners can read their own; insert allowed for authenticated users
-- (actual insert is done by admin client in API route after Paystack verification)
CREATE POLICY "standalone_purchases_owner_read"
  ON standalone_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "standalone_purchases_admin_all"
  ON standalone_purchases FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- standalone_lesson_progress: owners can read/write their own
CREATE POLICY "standalone_progress_owner_read"
  ON standalone_lesson_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "standalone_progress_owner_insert"
  ON standalone_lesson_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "standalone_progress_admin_all"
  ON standalone_lesson_progress FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
