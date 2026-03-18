-- ═══════════════════════════════════════════════════════════════════════════
-- AORTHAR ACADEMY — INITIAL SCHEMA
-- Migration:  001_initial_schema.sql
-- Database:   Supabase Postgres 15+
-- Encoding:   UTF-8
--
-- Sections:
--   1.  Extensions
--   2.  Enumerations
--   3.  Profiles & Identity
--   4.  Academic Hierarchy  (years → semesters → courses → lessons → resources)
--   5.  Specialization Tracks
--   6.  Course Prerequisites
--   7.  Assessment Engine   (questions → quiz_attempts)
--   8.  GPA Engine          (course_grades → semester_gpas → cumulative_gpas)
--   9.  Progression Engine  (enrollments → user_progress → semester_progress)
--   10. Capstone System
--   11. Contribution System (suggestions → suggestion_votes)
--   12. Monetization        (plans → subscriptions → transactions → webhook_events)
--   13. Notifications
--   14. Audit Log
--   15. Indexes
--   16. Seed Data
--   17. Utility Triggers (updated_at, new-user profile)
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ───────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_bytes() for idempotency tokens
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- trigram indexes for full-text course search

-- ───────────────────────────────────────────────────────────────────────────
-- 2. ENUMERATIONS
-- Using native PostgreSQL enums ensures:
--   • invalid values are rejected at the DB level (not just app level)
--   • storage is 4 bytes per value (vs TEXT)
--   • explicit ALTER TYPE needed to change values (intentional friction)
-- ───────────────────────────────────────────────────────────────────────────

CREATE TYPE user_role          AS ENUM ('student', 'contributor', 'admin');
CREATE TYPE year_level         AS ENUM ('100', '200', '300', '400');
-- NOTE: year_level stores the numeric codes 100–400 as an enum
-- Postgres does not support integer enums natively; we store as text internally
-- and cast in application. Use integer column with CHECK instead (see years table).

CREATE TYPE course_status      AS ENUM ('draft', 'published', 'archived');
CREATE TYPE resource_type      AS ENUM ('youtube', 'link', 'document');
CREATE TYPE question_type      AS ENUM ('multiple_choice', 'ordering', 'matching');
CREATE TYPE assessment_type    AS ENUM ('quiz', 'exam');
CREATE TYPE course_progress_status AS ENUM ('not_started', 'in_progress', 'failed', 'passed');
CREATE TYPE capstone_status    AS ENUM ('draft', 'pending', 'revision', 'approved', 'rejected');
CREATE TYPE suggestion_type    AS ENUM ('course', 'lesson', 'resource');
CREATE TYPE suggestion_status  AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE billing_type       AS ENUM ('one_time', 'subscription');
CREATE TYPE plan_type          AS ENUM ('free', 'semester', 'lifetime', 'monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE notification_type  AS ENUM (
  'course_unlocked',
  'quiz_passed',
  'quiz_failed',
  'exam_passed',
  'exam_failed',
  'capstone_reviewed',
  'suggestion_reviewed',
  'payment_success',
  'payment_failed',
  'subscription_expiring'
);
CREATE TYPE audit_action       AS ENUM (
  'grade_posted',
  'grade_overridden',
  'gpa_computed',
  'capstone_approved',
  'capstone_rejected',
  'subscription_created',
  'subscription_cancelled',
  'role_changed'
);

-- ───────────────────────────────────────────────────────────────────────────
-- 3. PROFILES & IDENTITY
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  avatar_url       TEXT        CHECK (avatar_url ~* '^https?://'),
  role             user_role   NOT NULL DEFAULT 'student',
  bio              TEXT        CHECK (char_length(bio) <= 500),
  -- social links (optional)
  github_url       TEXT        CHECK (github_url IS NULL OR github_url ~* '^https?://'),
  linkedin_url     TEXT        CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://'),
  -- contributor stats (denormalized for performance)
  approved_suggestions_count INTEGER NOT NULL DEFAULT 0 CHECK (approved_suggestions_count >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  profiles                          IS 'One row per auth.users entry. Auto-created on signup via trigger.';
COMMENT ON COLUMN profiles.role                     IS 'student → contributor (auto at 3 approved suggestions) → admin (manual).';
COMMENT ON COLUMN profiles.approved_suggestions_count IS 'Denormalized count kept in sync by trigger; used for contributor promotion.';

-- ───────────────────────────────────────────────────────────────────────────
-- 4. ACADEMIC HIERARCHY
-- ───────────────────────────────────────────────────────────────────────────

-- 4a. YEARS ─────────────────────────────────────────────────────────────────

CREATE TABLE years (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  level       INTEGER NOT NULL UNIQUE CHECK (level IN (100, 200, 300, 400)),
  name        TEXT    NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  description TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,           -- for deterministic ordering without relying on level
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  years        IS 'The four academic years (100–400). One row per year; never deleted.';
COMMENT ON COLUMN years.level  IS '100 = First Year … 400 = Fourth Year (premium-gated).';

-- 4b. SEMESTERS ─────────────────────────────────────────────────────────────

CREATE TABLE semesters (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id     UUID     NOT NULL REFERENCES years(id) ON DELETE RESTRICT,
  number      SMALLINT NOT NULL CHECK (number IN (1, 2)),
  name        TEXT     NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year_id, number)
);

COMMENT ON TABLE semesters IS 'Two semesters per year. Semester 2 is locked until Semester 1 is completed.';

-- 4c. COURSES ───────────────────────────────────────────────────────────────

CREATE TABLE courses (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  code               TEXT          NOT NULL UNIQUE
                                   CHECK (code ~ '^[A-Z]{3}[0-9]{3}$'),   -- e.g. DES101
  name               TEXT          NOT NULL CHECK (char_length(name) BETWEEN 3 AND 120),
  description        TEXT          NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  thumbnail_url      TEXT          CHECK (thumbnail_url IS NULL OR thumbnail_url ~* '^https?://'),

  -- Academic placement
  year_id            UUID          NOT NULL REFERENCES years(id) ON DELETE RESTRICT,
  semester_id        UUID          NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,

  -- Credit & grading
  credit_units       SMALLINT      NOT NULL CHECK (credit_units BETWEEN 1 AND 6),
  pass_mark          SMALLINT      NOT NULL DEFAULT 60 CHECK (pass_mark BETWEEN 50 AND 100),
  quiz_weight        NUMERIC(3,2)  NOT NULL DEFAULT 0.40
                                   CHECK (quiz_weight BETWEEN 0.0 AND 1.0),
  exam_weight        NUMERIC(3,2)  NOT NULL DEFAULT 0.60
                                   CHECK (exam_weight BETWEEN 0.0 AND 1.0),
  -- quiz_weight + exam_weight must equal 1.0
  CONSTRAINT weight_sum_is_one CHECK (ABS((quiz_weight + exam_weight) - 1.0) < 0.001),

  -- Assessment limits
  quiz_attempt_limit SMALLINT      NOT NULL DEFAULT 3  CHECK (quiz_attempt_limit BETWEEN 1 AND 10),
  exam_attempt_limit SMALLINT      NOT NULL DEFAULT 3  CHECK (exam_attempt_limit BETWEEN 1 AND 10),
  cooldown_hours     SMALLINT      NOT NULL DEFAULT 24 CHECK (cooldown_hours BETWEEN 1 AND 168),
  exam_duration_mins SMALLINT      NOT NULL DEFAULT 90 CHECK (exam_duration_mins BETWEEN 15 AND 300),
  quiz_duration_mins SMALLINT      NOT NULL DEFAULT 45 CHECK (quiz_duration_mins BETWEEN 5 AND 120),

  -- Access control
  is_premium         BOOLEAN       NOT NULL DEFAULT false,
  status             course_status NOT NULL DEFAULT 'draft',

  -- Metadata
  created_by         UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  -- semester_belongs_to_year enforced by trigger in 003_functions.sql
);

COMMENT ON TABLE  courses                    IS 'One row per course. Code follows [A-Z]{3}[0-9]{3} format.';
COMMENT ON COLUMN courses.credit_units       IS '1–6 units. Used in weighted GPA calculation.';
COMMENT ON COLUMN courses.quiz_weight        IS 'Weight of quiz score in final course grade (default 0.40).';
COMMENT ON COLUMN courses.exam_weight        IS 'Weight of exam score in final course grade (default 0.60).';
COMMENT ON COLUMN courses.is_premium         IS 'If true, requires active subscription to access (used for all 400-level).';
COMMENT ON COLUMN courses.cooldown_hours     IS 'Hours a student must wait before retaking a failed assessment.';

-- Drop the composite FK — it requires semesters to have (year_id, id) as a unique key.
-- Instead enforce via trigger (see 003_functions.sql).
ALTER TABLE courses DROP CONSTRAINT IF EXISTS semester_belongs_to_year;

-- 4d. LESSONS ───────────────────────────────────────────────────────────────

CREATE TABLE lessons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  content      TEXT,                          -- Markdown / rich text; nullable = coming soon
  sort_order   SMALLINT    NOT NULL DEFAULT 1 CHECK (sort_order > 0),
  is_published BOOLEAN     NOT NULL DEFAULT false,
  created_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, sort_order)              -- no two lessons can share an order within a course
);

COMMENT ON TABLE  lessons            IS 'Ordered lessons within a course.';
COMMENT ON COLUMN lessons.sort_order IS 'Display order within the course. Must be unique per course.';
COMMENT ON COLUMN lessons.content    IS 'Markdown. NULL = lesson exists but content is not yet written.';

-- 4e. RESOURCES ─────────────────────────────────────────────────────────────

CREATE TABLE resources (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type         resource_type NOT NULL,
  title        TEXT          NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  url          TEXT          NOT NULL CHECK (url ~* '^https?://'),
  description  TEXT          CHECK (char_length(description) <= 500),
  sort_order   SMALLINT      NOT NULL DEFAULT 1 CHECK (sort_order > 0),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  resources      IS 'Embedded media / links attached to lessons.';
COMMENT ON COLUMN resources.type IS 'youtube = embed; link = external href; document = PDF/file.';
COMMENT ON COLUMN resources.url  IS 'Must be a valid http/https URL. YouTube URLs are embedded client-side.';

-- ───────────────────────────────────────────────────────────────────────────
-- 5. SPECIALIZATION TRACKS
-- Available at 400-level only. A course can belong to one optional track.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE specialization_tracks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 3 AND 120),
  slug        TEXT        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT,
  icon_url    TEXT        CHECK (icon_url IS NULL OR icon_url ~* '^https?://'),
  year_id     UUID        NOT NULL REFERENCES years(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE specialization_tracks IS '400-level specialization paths (e.g. Product Design, Engineering).';

-- Junction: course belongs to a track (optional)
CREATE TABLE course_tracks (
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  track_id   UUID NOT NULL REFERENCES specialization_tracks(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, track_id)
);

-- ───────────────────────────────────────────────────────────────────────────
-- 6. COURSE PREREQUISITES
-- A course can require other courses to be passed first.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE course_prerequisites (
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, prerequisite_id),
  CONSTRAINT no_self_prerequisite CHECK (course_id <> prerequisite_id)
);

COMMENT ON TABLE course_prerequisites IS 'A course may require one or more other courses to be passed first.';

-- ───────────────────────────────────────────────────────────────────────────
-- 7. ASSESSMENT ENGINE
-- ───────────────────────────────────────────────────────────────────────────

-- 7a. QUESTIONS ─────────────────────────────────────────────────────────────

CREATE TABLE questions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type             question_type NOT NULL,
  question_text    TEXT          NOT NULL CHECK (char_length(question_text) BETWEEN 5 AND 3000),

  -- JSONB structure:
  -- multiple_choice: [{ "id": "uuid", "text": "...", "is_correct": bool }]
  -- ordering:        [{ "id": "uuid", "text": "...", "correct_position": int }]
  -- matching:        [{ "id": "uuid", "left": "...", "right": "...", "pair_id": "uuid" }]
  -- The "is_correct" / "correct_position" keys are NEVER returned to the client.
  options          JSONB         NOT NULL DEFAULT '[]'::jsonb,

  explanation      TEXT,                       -- shown to student after grading (optional)
  points           SMALLINT      NOT NULL DEFAULT 1 CHECK (points BETWEEN 1 AND 10),
  shuffle_options  BOOLEAN       NOT NULL DEFAULT true,
  is_exam_question BOOLEAN       NOT NULL DEFAULT false,   -- false = quiz only; true = exam pool
  difficulty       SMALLINT      NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
                                               -- 1=easy, 2=medium, 3=hard
  created_by       UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  questions                  IS 'Question bank. Correct answers stored server-side only; never in client responses.';
COMMENT ON COLUMN questions.options          IS 'JSONB array with correct-answer flags. Strip before sending to client.';
COMMENT ON COLUMN questions.explanation      IS 'Shown after the attempt is graded. Does NOT reveal answers during the quiz.';
COMMENT ON COLUMN questions.is_exam_question IS 'false = quiz pool, true = exam pool. A question can belong to both pools by duplicating.';
COMMENT ON COLUMN questions.difficulty       IS '1=easy 2=medium 3=hard. Used for future adaptive quiz balancing.';

-- 7b. QUIZ ATTEMPTS ─────────────────────────────────────────────────────────

CREATE TABLE quiz_attempts (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id       UUID            NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  assessment_type assessment_type NOT NULL DEFAULT 'quiz',
  attempt_number  SMALLINT        NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),

  -- Timing
  started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  time_limit_secs INTEGER         NOT NULL DEFAULT 2700 CHECK (time_limit_secs > 0),
                                  -- default 45 min for quiz; overridden to exam_duration_mins for exam

  -- Results — set server-side by grade-quiz Edge Function; immutable after set
  score           NUMERIC(5,2)    CHECK (score BETWEEN 0 AND 100),
  passed          BOOLEAN,
  correct_count   SMALLINT        CHECK (correct_count >= 0),
  total_questions SMALLINT        CHECK (total_questions > 0),

  -- Submitted answers (stored encrypted server-side for audit; never returned raw to client)
  answers         JSONB,          -- { "question_id": "option_id", … }

  -- Cooldown management
  cooldown_until  TIMESTAMPTZ,

  -- Ensure score is immutable: once set, cannot be changed to NULL or a lower value
  -- This is enforced in the Edge Function; the DB stores the final value.
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT completed_has_score
    CHECK (completed_at IS NULL OR score IS NOT NULL)
);

COMMENT ON TABLE  quiz_attempts                 IS 'Immutable attempt records. Score and passed are set once by the grading Edge Function.';
COMMENT ON COLUMN quiz_attempts.answers         IS 'Submitted answer map. Stored for audit; never exposed to client post-submission.';
COMMENT ON COLUMN quiz_attempts.cooldown_until  IS 'If not null and in the future, the user cannot start a new attempt.';
COMMENT ON COLUMN quiz_attempts.time_limit_secs IS 'Server-side time limit. The Edge Function rejects submissions past this time.';

-- Prevent two in-progress attempts for the same user/course/type
CREATE UNIQUE INDEX uq_quiz_attempts_active
  ON quiz_attempts (user_id, course_id, assessment_type)
  WHERE completed_at IS NULL;

-- ───────────────────────────────────────────────────────────────────────────
-- 8. GPA ENGINE
-- All rows in this section are written exclusively by Edge Functions.
-- ───────────────────────────────────────────────────────────────────────────

-- 8a. COURSE GRADES ─────────────────────────────────────────────────────────

CREATE TABLE course_grades (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  course_id     UUID         NOT NULL REFERENCES courses(id)     ON DELETE RESTRICT,
  --
  -- Raw component scores (0–100)
  quiz_score    NUMERIC(5,2) CHECK (quiz_score  BETWEEN 0 AND 100),
  exam_score    NUMERIC(5,2) CHECK (exam_score  BETWEEN 0 AND 100),
  --
  -- Computed final score: (quiz_score * quiz_weight) + (exam_score * exam_weight)
  -- Stored for fast read; must match course weight formula.
  final_score   NUMERIC(5,2) CHECK (final_score BETWEEN 0 AND 100),
  --
  -- Grade letter and GPA points (from the 5.0 scale in gpa.ts)
  grade         TEXT         CHECK (grade IN ('A+','A','B+','B','C+','C','D','F')),
  grade_points  NUMERIC(3,1) CHECK (grade_points IN (5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 0.0)),
  --
  passed        BOOLEAN      NOT NULL DEFAULT false,
  --
  -- Admin override tracking
  is_overridden BOOLEAN      NOT NULL DEFAULT false,
  overridden_by UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  overridden_at TIMESTAMPTZ,
  override_note TEXT         CHECK (char_length(override_note) <= 500),
  --
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, course_id),

  -- Passing grade must have grade != 'F'
  CONSTRAINT pass_fail_consistent
    CHECK (NOT (passed = true AND grade = 'F')),

  -- Both quiz and exam must be present before final can be computed
  CONSTRAINT final_requires_both_scores
    CHECK (
      final_score IS NULL
      OR (quiz_score IS NOT NULL AND exam_score IS NOT NULL)
    )
);

COMMENT ON TABLE  course_grades              IS 'One row per (user, course). Written by grade-quiz Edge Function; admin-overridable.';
COMMENT ON COLUMN course_grades.grade_points IS 'GPA point value on the 5.0 scale used by calculate-gpa.';
COMMENT ON COLUMN course_grades.is_overridden IS 'True if an admin manually changed the grade. Audited in audit_log.';

-- 8b. SEMESTER GPAs ─────────────────────────────────────────────────────────

CREATE TABLE semester_gpas (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  year_id        UUID         NOT NULL REFERENCES years(id)       ON DELETE RESTRICT,
  semester_id    UUID         NOT NULL REFERENCES semesters(id)   ON DELETE RESTRICT,
  gpa            NUMERIC(4,2) NOT NULL CHECK (gpa BETWEEN 0 AND 5),
  total_credits  SMALLINT     NOT NULL CHECK (total_credits >= 0),
  computed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, semester_id)
);

COMMENT ON TABLE semester_gpas IS 'Semester GPA snapshot. Recomputed by calculate-gpa Edge Function whenever a course grade is posted.';

-- 8c. CUMULATIVE GPAs ───────────────────────────────────────────────────────

CREATE TABLE cumulative_gpas (
  user_id              UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cumulative_gpa       NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (cumulative_gpa BETWEEN 0 AND 5),
  total_credits_earned SMALLINT     NOT NULL DEFAULT 0 CHECK (total_credits_earned >= 0),
  computed_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cumulative_gpas IS 'Rolling cumulative GPA. One row per user; upserted on each grade event.';

-- ───────────────────────────────────────────────────────────────────────────
-- 9. PROGRESSION ENGINE
-- ───────────────────────────────────────────────────────────────────────────

-- 9a. ENROLLMENTS ───────────────────────────────────────────────────────────
-- Explicit enrollment event; separates "signed up for course" from "progress status".

CREATE TABLE enrollments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  course_id   UUID        NOT NULL REFERENCES courses(id)     ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

COMMENT ON TABLE enrollments IS 'A student formally enrolls in a course before taking it. Distinct from user_progress.';

-- 9b. USER PROGRESS ─────────────────────────────────────────────────────────

CREATE TABLE user_progress (
  id           UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID                   NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  course_id    UUID                   NOT NULL REFERENCES courses(id)     ON DELETE CASCADE,
  status       course_progress_status NOT NULL DEFAULT 'not_started',
  enrolled_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- last lesson the student was on (for resume-position UX)
  last_lesson_id UUID                 REFERENCES lessons(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, course_id),

  CONSTRAINT completed_at_only_when_passed
    CHECK (completed_at IS NULL OR status IN ('passed', 'failed'))
);

COMMENT ON TABLE  user_progress                IS 'Current course status per student.';
COMMENT ON COLUMN user_progress.last_lesson_id IS 'Used to restore the student to their last position within a course.';

-- 9c. SEMESTER PROGRESS ─────────────────────────────────────────────────────

CREATE TABLE semester_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  year_id      UUID        NOT NULL REFERENCES years(id)        ON DELETE RESTRICT,
  semester_id  UUID        NOT NULL REFERENCES semesters(id)    ON DELETE RESTRICT,
  is_unlocked  BOOLEAN     NOT NULL DEFAULT false,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  unlocked_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, semester_id),

  CONSTRAINT completed_requires_unlocked
    CHECK (NOT (is_completed = true AND is_unlocked = false))
);

COMMENT ON TABLE semester_progress IS 'Tracks whether a semester is unlocked/completed per student. Written by check-progression Edge Function.';

-- ───────────────────────────────────────────────────────────────────────────
-- 10. CAPSTONE SYSTEM
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE capstone_submissions (
  id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID            UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                                 -- one capstone per student (UNIQUE enforces this)

  -- Submission content
  github_url     TEXT            NOT NULL CHECK (github_url ~* '^https://github\.com/'),
  live_url       TEXT            NOT NULL CHECK (live_url   ~* '^https?://'),
  description    TEXT            NOT NULL CHECK (char_length(description) BETWEEN 100 AND 5000),
  tech_stack     TEXT[]          NOT NULL DEFAULT '{}',

  -- Track selected (optional — student can pick a specialization)
  track_id       UUID            REFERENCES specialization_tracks(id) ON DELETE SET NULL,

  -- Workflow state
  status         capstone_status NOT NULL DEFAULT 'draft',

  -- Review fields (set by admin)
  admin_notes    TEXT            CHECK (char_length(admin_notes) <= 2000),
  reviewed_by    UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,

  -- Timestamps
  submitted_at   TIMESTAMPTZ,    -- set when status transitions draft → pending
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT submitted_at_when_pending
    CHECK (
      status = 'draft'
      OR (status <> 'draft' AND submitted_at IS NOT NULL)
    ),

  CONSTRAINT reviewed_at_when_decided
    CHECK (
      status IN ('draft', 'pending')
      OR (status NOT IN ('draft', 'pending') AND reviewed_at IS NOT NULL)
    )
);

COMMENT ON TABLE  capstone_submissions         IS 'Final capstone project. One per student. Required for graduation.';
COMMENT ON COLUMN capstone_submissions.user_id IS 'UNIQUE — one capstone submission per student.';
COMMENT ON COLUMN capstone_submissions.github_url IS 'Must be a github.com URL.';

-- ───────────────────────────────────────────────────────────────────────────
-- 11. CONTRIBUTION SYSTEM
-- ───────────────────────────────────────────────────────────────────────────

-- 11a. SUGGESTIONS ──────────────────────────────────────────────────────────

CREATE TABLE suggestions (
  id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id  UUID              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         suggestion_type   NOT NULL,
  status       suggestion_status NOT NULL DEFAULT 'pending',

  -- Structured proposal content stored as JSONB.
  -- Schema depends on `type`:
  --   course:   { course_code, course_name, description, credit_units, year_level, semester }
  --   lesson:   { lesson_title, course_id }
  --   resource: { resource_type, resource_title, resource_url, lesson_id }
  content      JSONB             NOT NULL DEFAULT '{}'::jsonb,

  -- Admin review
  admin_notes  TEXT              CHECK (char_length(admin_notes) <= 1000),
  reviewed_by  UUID              REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,

  created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  CONSTRAINT reviewed_at_when_decided
    CHECK (
      status = 'pending'
      OR (status <> 'pending' AND reviewed_at IS NOT NULL)
    )
);

COMMENT ON TABLE  suggestions         IS 'Community-submitted curriculum proposals. Admin approves/rejects.';
COMMENT ON COLUMN suggestions.content IS 'JSONB payload. Schema varies by type field.';

-- 11b. SUGGESTION VOTES ─────────────────────────────────────────────────────
-- Community upvoting to surface high-priority suggestions to admins.

CREATE TABLE suggestion_votes (
  suggestion_id UUID        NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (suggestion_id, user_id)
);

COMMENT ON TABLE suggestion_votes IS 'One vote per user per suggestion. Used to prioritize admin review queue.';

-- ───────────────────────────────────────────────────────────────────────────
-- 12. MONETIZATION
-- ───────────────────────────────────────────────────────────────────────────

-- 12a. PLANS ────────────────────────────────────────────────────────────────

CREATE TABLE plans (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT         NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 2 AND 80),
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency     CHAR(3)       NOT NULL DEFAULT 'USD',  -- ISO 4217 (3-char code)
  billing_type billing_type  NOT NULL,
  plan_type    plan_type     NOT NULL,
  -- Array of feature keys unlocked by this plan
  -- e.g. ['400_level', 'gpa_export', 'capstone', 'mentorship', 'unlimited_attempts']
  access_scope TEXT[]        NOT NULL DEFAULT '{}',
  is_active    BOOLEAN       NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  plans              IS 'Available purchase plans. Admin-managed. Soft-deleted via is_active.';
COMMENT ON COLUMN plans.access_scope IS 'Feature keys granted to subscribers. Checked in middleware and Edge Functions.';
COMMENT ON COLUMN plans.currency     IS 'ISO 4217 3-letter currency code (USD, NGN, etc.).';

-- 12b. SUBSCRIPTIONS ────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID                NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id       UUID                NOT NULL REFERENCES plans(id)      ON DELETE RESTRICT,

  -- Paystack subscription metadata
  paystack_subscription_code TEXT   UNIQUE,       -- for Paystack-managed subscriptions
  paystack_email_token       TEXT,                -- required for subscription cancellation via API

  status        subscription_status NOT NULL DEFAULT 'active',
  start_date    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  end_date      TIMESTAMPTZ,                       -- NULL = lifetime / no expiry
  auto_renew    BOOLEAN             NOT NULL DEFAULT true,

  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT end_date_after_start
    CHECK (end_date IS NULL OR end_date > start_date),

  CONSTRAINT lifetime_has_no_end
    CHECK (
      NOT (
        auto_renew = false
        AND end_date IS NOT NULL
        AND end_date < start_date + INTERVAL '1 year 1 day'
      )
    )
);

COMMENT ON TABLE  subscriptions                         IS 'Active and historical subscriptions. Written by verify-payment Edge Function.';
COMMENT ON COLUMN subscriptions.paystack_subscription_code IS 'Used to cancel or manage the subscription via Paystack API.';
COMMENT ON COLUMN subscriptions.end_date                IS 'NULL for lifetime access. Set for monthly/yearly plans.';

-- One active subscription per user at a time
CREATE UNIQUE INDEX uq_subscriptions_one_active
  ON subscriptions (user_id)
  WHERE status = 'active';

-- 12c. TRANSACTIONS ─────────────────────────────────────────────────────────

CREATE TABLE transactions (
  id                  UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID               NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Idempotency key — Paystack reference is unique per payment
  paystack_reference  TEXT               NOT NULL UNIQUE
                                         CHECK (char_length(paystack_reference) BETWEEN 5 AND 100),

  -- Financial data
  amount              NUMERIC(12,2)      NOT NULL CHECK (amount > 0),
  amount_paid_kobo    BIGINT             NOT NULL CHECK (amount_paid_kobo > 0),
                                         -- raw Paystack kobo amount for audit reconciliation
  currency            CHAR(3)            NOT NULL DEFAULT 'USD',
  plan_type           plan_type          NOT NULL,

  status              transaction_status NOT NULL DEFAULT 'pending',

  -- Full Paystack webhook payload, stored for audit and dispute resolution
  raw_payload         JSONB,

  -- Timestamps
  paid_at             TIMESTAMPTZ,       -- from Paystack webhook data.paid_at
  created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT paid_at_when_success
    CHECK (status <> 'success' OR paid_at IS NOT NULL)
);

COMMENT ON TABLE  transactions                   IS 'Immutable payment records. One row per Paystack transaction. Never deleted.';
COMMENT ON COLUMN transactions.paystack_reference IS 'UNIQUE idempotency key — duplicate webhooks with same reference are ignored.';
COMMENT ON COLUMN transactions.amount_paid_kobo   IS 'Raw smallest-unit amount from Paystack (kobo for NGN, cents for USD) for reconciliation.';
COMMENT ON COLUMN transactions.raw_payload        IS 'Full Paystack event payload stored verbatim for audit.';

-- 12d. WEBHOOK EVENTS ───────────────────────────────────────────────────────
-- Append-only log of every incoming Paystack webhook, even those we don't act on.

CREATE TABLE webhook_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT        NOT NULL,                 -- e.g. 'charge.success'
  reference     TEXT,                                 -- paystack_reference if present
  payload       JSONB       NOT NULL,
  processed     BOOLEAN     NOT NULL DEFAULT false,
  error_message TEXT,                                 -- populated if processing failed
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  webhook_events           IS 'Append-only log of every Paystack webhook received, for debugging and replay.';
COMMENT ON COLUMN webhook_events.processed IS 'false if the event was received but the handler errored.';

-- ───────────────────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT              NOT NULL CHECK (char_length(title) <= 200),
  body        TEXT              CHECK (char_length(body) <= 1000),
  -- Optional reference to the entity that triggered the notification
  entity_type TEXT              CHECK (entity_type IN
                                       ('course', 'quiz_attempt', 'capstone',
                                        'suggestion', 'subscription', 'transaction')),
  entity_id   UUID,
  is_read     BOOLEAN           NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications            IS 'In-app notification feed per user.';
COMMENT ON COLUMN notifications.entity_id  IS 'Optional FK to the triggering entity (polymorphic reference — no DB FK enforced).';

-- ───────────────────────────────────────────────────────────────────────────
-- 14. AUDIT LOG
-- Append-only. Never updated or deleted. Written by Edge Functions.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  action       audit_action NOT NULL,
  performed_by UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user  UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Polymorphic entity reference
  entity_type  TEXT,        -- 'course_grade', 'subscription', 'capstone', etc.
  entity_id    UUID,
  -- Snapshot of before/after values for grade overrides and role changes
  old_value    JSONB,
  new_value    JSONB,
  metadata     JSONB,       -- any extra context
  ip_address   INET,        -- set by Edge Function from request headers
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  audit_log             IS 'Immutable audit trail. Never update or delete rows. Written by Edge Functions only.';
COMMENT ON COLUMN audit_log.old_value   IS 'State before the action (for overrides, role changes, etc.).';
COMMENT ON COLUMN audit_log.new_value   IS 'State after the action.';
COMMENT ON COLUMN audit_log.ip_address  IS 'Request IP forwarded from Edge Function context.';

-- ───────────────────────────────────────────────────────────────────────────
-- 15. INDEXES
-- Strategy:
--   • B-tree on all FK columns used in JOIN / WHERE
--   • Partial indexes for filtered queries (active subscriptions, pending suggestions, etc.)
--   • Trigram index on course name + description for full-text search
--   • Composite covering indexes for the hottest query paths
-- ───────────────────────────────────────────────────────────────────────────

-- Profiles
CREATE INDEX idx_profiles_user_id       ON profiles (user_id);
CREATE INDEX idx_profiles_role          ON profiles (role);

-- Academic hierarchy
CREATE INDEX idx_years_level            ON years (level);
CREATE INDEX idx_semesters_year         ON semesters (year_id);
CREATE INDEX idx_courses_year_semester  ON courses (year_id, semester_id);
CREATE INDEX idx_courses_code           ON courses (code);
CREATE INDEX idx_courses_status         ON courses (status);
CREATE INDEX idx_courses_premium_status ON courses (is_premium, status)
  WHERE status = 'published';                               -- only published courses are queried
CREATE INDEX idx_lessons_course_order   ON lessons (course_id, sort_order);
CREATE INDEX idx_lessons_published      ON lessons (course_id)
  WHERE is_published = true;
CREATE INDEX idx_resources_lesson_order ON resources (lesson_id, sort_order);

-- Trigram search on course name and description
CREATE INDEX idx_courses_name_trgm      ON courses USING gin (name gin_trgm_ops);
CREATE INDEX idx_courses_desc_trgm      ON courses USING gin (description gin_trgm_ops);

-- Specialization
CREATE INDEX idx_course_tracks_track    ON course_tracks (track_id);
CREATE INDEX idx_course_tracks_course   ON course_tracks (course_id);

-- Prerequisites
CREATE INDEX idx_prereqs_course         ON course_prerequisites (course_id);
CREATE INDEX idx_prereqs_prerequisite   ON course_prerequisites (prerequisite_id);

-- Questions
CREATE INDEX idx_questions_course       ON questions (course_id);
CREATE INDEX idx_questions_exam         ON questions (course_id, is_exam_question);
CREATE INDEX idx_questions_difficulty   ON questions (course_id, difficulty);

-- Quiz attempts — hot path for checking cooldowns and attempt counts
CREATE INDEX idx_attempts_user_course   ON quiz_attempts (user_id, course_id, assessment_type);
CREATE INDEX idx_attempts_cooldown      ON quiz_attempts (user_id, course_id, assessment_type, cooldown_until)
  WHERE cooldown_until IS NOT NULL;
CREATE INDEX idx_attempts_completed     ON quiz_attempts (user_id, course_id, assessment_type, completed_at)
  WHERE completed_at IS NOT NULL;

-- GPA
CREATE INDEX idx_course_grades_user     ON course_grades (user_id);
CREATE INDEX idx_course_grades_course   ON course_grades (course_id);
CREATE INDEX idx_course_grades_passed   ON course_grades (user_id, passed)
  WHERE passed = true;
CREATE INDEX idx_semester_gpas_user     ON semester_gpas (user_id, semester_id);
-- cumulative_gpas uses user_id as PK, no extra index needed

-- Enrollments
CREATE INDEX idx_enrollments_user       ON enrollments (user_id);
CREATE INDEX idx_enrollments_course     ON enrollments (course_id);

-- Progression
CREATE INDEX idx_user_progress_user     ON user_progress (user_id, course_id);
CREATE INDEX idx_user_progress_status   ON user_progress (user_id, status);
CREATE INDEX idx_semester_progress_user ON semester_progress (user_id, semester_id);
CREATE INDEX idx_semester_progress_unlocked ON semester_progress (user_id)
  WHERE is_unlocked = true;

-- Capstone
CREATE INDEX idx_capstone_status        ON capstone_submissions (status);
CREATE INDEX idx_capstone_user          ON capstone_submissions (user_id);

-- Suggestions
CREATE INDEX idx_suggestions_proposer   ON suggestions (proposer_id);
CREATE INDEX idx_suggestions_status     ON suggestions (status, created_at DESC);
CREATE INDEX idx_suggestions_pending    ON suggestions (created_at DESC)
  WHERE status = 'pending';
CREATE INDEX idx_suggestion_votes       ON suggestion_votes (suggestion_id);

-- Monetization
CREATE INDEX idx_plans_active           ON plans (is_active, plan_type)
  WHERE is_active = true;
CREATE INDEX idx_subscriptions_user     ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_active   ON subscriptions (user_id)
  WHERE status = 'active';
CREATE INDEX idx_subscriptions_expiring ON subscriptions (end_date)
  WHERE status = 'active' AND end_date IS NOT NULL;        -- for expiry-job queries
CREATE INDEX idx_transactions_user      ON transactions (user_id, created_at DESC);
CREATE INDEX idx_transactions_status    ON transactions (status, created_at DESC);
CREATE INDEX idx_webhook_events_unprocessed ON webhook_events (received_at)
  WHERE processed = false;

-- Notifications
CREATE INDEX idx_notifications_user     ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread   ON notifications (user_id)
  WHERE is_read = false;

-- Audit log — analytics / admin queries
CREATE INDEX idx_audit_log_action       ON audit_log (action, created_at DESC);
CREATE INDEX idx_audit_log_target_user  ON audit_log (target_user, created_at DESC);
CREATE INDEX idx_audit_log_entity       ON audit_log (entity_type, entity_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 16. SEED DATA
-- ───────────────────────────────────────────────────────────────────────────

-- Years
INSERT INTO years (level, name, sort_order) VALUES
  (100, 'First Year',  1),
  (200, 'Second Year', 2),
  (300, 'Third Year',  3),
  (400, 'Fourth Year', 4);

-- Semesters (2 per year)
INSERT INTO semesters (year_id, number, name)
SELECT id, 1, 'First Semester'  FROM years
UNION ALL
SELECT id, 2, 'Second Semester' FROM years
ORDER BY 1, 2;

-- 400-level specialization tracks
INSERT INTO specialization_tracks (name, slug, description, year_id)
SELECT
  track.name,
  track.slug,
  track.description,
  y.id
FROM (VALUES
  ('Product Design',      'product-design',      'UI/UX, design systems, prototyping, user research'),
  ('Software Engineering','software-engineering', 'Full-stack development, system design, DevOps'),
  ('Product Management',  'product-management',  'Strategy, roadmapping, stakeholder management'),
  ('Scrum & Agile',       'scrum-agile',         'Agile ceremonies, backlog management, sprint planning'),
  ('UX Research',         'ux-research',         'Qualitative and quantitative research methods')
) AS track(name, slug, description)
CROSS JOIN (SELECT id FROM years WHERE level = 400) AS y;

-- Default plans
INSERT INTO plans (name, description, price, currency, billing_type, plan_type, access_scope) VALUES
  (
    'Lifetime Access',
    'One-time payment for permanent premium access to all features.',
    99.00, 'USD', 'one_time', 'lifetime',
    ARRAY['400_level','gpa_export','capstone','mentorship','unlimited_attempts']
  ),
  (
    'Monthly',
    'Full premium access billed monthly. Cancel anytime.',
    9.99, 'USD', 'subscription', 'monthly',
    ARRAY['400_level','gpa_export','capstone','mentorship','unlimited_attempts']
  ),
  (
    'Yearly',
    'Full premium access billed annually. Best value.',
    79.99, 'USD', 'subscription', 'yearly',
    ARRAY['400_level','gpa_export','capstone','mentorship','unlimited_attempts']
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 17. UTILITY TRIGGERS
-- ───────────────────────────────────────────────────────────────────────────

-- 17a. updated_at trigger function ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles',
    'courses',
    'lessons',
    'questions',
    'quiz_attempts',
    'course_grades',
    'subscriptions',
    'user_progress',
    'capstone_submissions'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- 17b. Auto-create profile on signup ───────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO NOTHING;    -- idempotent: safe to replay
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 17c. Unlock Year 100 / Semester 1 on first profile creation ──────────────
-- Every new student automatically has Year 100 Semester 1 unlocked.

CREATE OR REPLACE FUNCTION unlock_initial_semester()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_year_id     UUID;
  v_semester_id UUID;
BEGIN
  SELECT y.id, s.id
    INTO v_year_id, v_semester_id
    FROM years y
    JOIN semesters s ON s.year_id = y.id AND s.number = 1
   WHERE y.level = 100
   LIMIT 1;

  IF v_semester_id IS NOT NULL THEN
    INSERT INTO semester_progress
      (user_id, year_id, semester_id, is_unlocked, unlocked_at)
    VALUES
      (NEW.user_id, v_year_id, v_semester_id, true, NOW())
    ON CONFLICT (user_id, semester_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_created_unlock_semester1
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION unlock_initial_semester();

-- 17d. Contributor auto-promotion ──────────────────────────────────────────
-- When a suggestion is approved, increment the proposer's counter.
-- At 3 approved suggestions, promote from student → contributor.

CREATE OR REPLACE FUNCTION handle_suggestion_approved()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    UPDATE profiles
    SET
      approved_suggestions_count = approved_suggestions_count + 1,
      role = CASE
               WHEN approved_suggestions_count + 1 >= 3 AND role = 'student'
               THEN 'contributor'::user_role
               ELSE role
             END
    WHERE user_id = NEW.proposer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_suggestion_approved
  AFTER UPDATE OF status ON suggestions
  FOR EACH ROW EXECUTE FUNCTION handle_suggestion_approved();

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION 001
-- Run 002_rls_policies.sql next.
-- ═══════════════════════════════════════════════════════════════════════════
