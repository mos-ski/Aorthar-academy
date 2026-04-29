-- ═══════════════════════════════════════════════════════════════════════════
-- AORTHAR INTERNSHIP MODULE — SCHEMA
-- Migration: 20260428000000_internship_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. COHORTS ────────────────────────────────────────────────────────────
CREATE TYPE internship_cohort_status AS ENUM ('open', 'closed', 'completed');

CREATE TABLE internship_cohorts (
  id          UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT                     NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  status      internship_cohort_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE internship_cohorts IS 'One row per cohort cycle (e.g. Q2 2026). Admin-managed.';

-- ── 2. QUESTIONS ──────────────────────────────────────────────────────────
CREATE TABLE internship_questions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text   TEXT        NOT NULL CHECK (char_length(question_text) BETWEEN 5 AND 3000),
  option_a        TEXT        NOT NULL CHECK (char_length(option_a) BETWEEN 1 AND 500),
  option_b        TEXT        NOT NULL CHECK (char_length(option_b) BETWEEN 1 AND 500),
  option_c        TEXT        NOT NULL CHECK (char_length(option_c) BETWEEN 1 AND 500),
  option_d        TEXT        NOT NULL CHECK (char_length(option_d) BETWEEN 1 AND 500),
  correct_option  CHAR(1)     NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  sort_order      SMALLINT    NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_internship_questions_active ON internship_questions (sort_order)
  WHERE is_active = true;

COMMENT ON TABLE internship_questions IS 'Question bank for the internship assessment. correct_option is server-side only — never exposed to client.';

-- ── 3. APPLICATIONS ───────────────────────────────────────────────────────
CREATE TYPE internship_track AS ENUM (
  'Product Design',
  'Product Management',
  'QA & Testing',
  'Scrum & Agile',
  'Tech Operations'
);

CREATE TYPE internship_current_status AS ENUM (
  'Student',
  'New Graduate',
  'Career Changer',
  'Currently Employed',
  'Other'
);

CREATE TYPE internship_payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE internship_app_status AS ENUM ('pending', 'submitted', 'selected', 'rejected');

CREATE TABLE internship_applications (
  id                  UUID                       PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id           UUID                       REFERENCES internship_cohorts(id) ON DELETE SET NULL,

  -- Payment (idempotency key)
  paystack_reference  TEXT                       UNIQUE CHECK (char_length(paystack_reference) BETWEEN 5 AND 120),
  payment_status      internship_payment_status  NOT NULL DEFAULT 'pending',
  amount_paid_ngn     INTEGER                    CHECK (amount_paid_ngn IS NULL OR amount_paid_ngn > 0),
  paid_at             TIMESTAMPTZ,

  -- Applicant identity (no auth.users FK — external applicants)
  full_name           TEXT                       CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 2 AND 120),
  email               TEXT                       CHECK (email IS NULL OR email ~* '^[^@]+@[^@]+\.[^@]+$'),
  phone               TEXT                       CHECK (phone IS NULL OR char_length(phone) <= 30),
  portfolio_url       TEXT                       CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://'),
  track               internship_track,
  current_status      internship_current_status,
  motivation          TEXT                       CHECK (motivation IS NULL OR char_length(motivation) <= 3000),

  -- Application state
  app_status          internship_app_status      NOT NULL DEFAULT 'pending',
  form_submitted_at   TIMESTAMPTZ,

  created_at          TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ                NOT NULL DEFAULT NOW(),

  CONSTRAINT paid_has_reference
    CHECK (payment_status = 'pending' OR paystack_reference IS NOT NULL),
  CONSTRAINT submitted_form_has_required_fields
    CHECK (
      form_submitted_at IS NULL
      OR (email IS NOT NULL AND full_name IS NOT NULL AND track IS NOT NULL)
    )
);

CREATE INDEX idx_int_apps_email          ON internship_applications (email);
CREATE INDEX idx_int_apps_reference      ON internship_applications (paystack_reference);
CREATE INDEX idx_int_apps_payment_status ON internship_applications (payment_status);
CREATE INDEX idx_int_apps_app_status     ON internship_applications (app_status, created_at DESC);

COMMENT ON TABLE internship_applications IS 'One row per paid application slot. email is not unique — idempotency is via paystack_reference.';

-- ── 4. EXAM TOKENS ────────────────────────────────────────────────────────
CREATE TABLE internship_exam_tokens (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID        NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One live (unused) token per application at a time
CREATE UNIQUE INDEX uq_exam_token_application
  ON internship_exam_tokens (application_id)
  WHERE used_at IS NULL;

CREATE INDEX idx_int_exam_tokens_app ON internship_exam_tokens (application_id);

COMMENT ON TABLE internship_exam_tokens IS '24-hour single-use UUID token. Creates the exam link sent in the onboarding email.';

-- ── 5. OTP CODES ──────────────────────────────────────────────────────────
CREATE TABLE internship_otp_codes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID        NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
  otp_code        TEXT        NOT NULL CHECK (otp_code ~ '^[0-9]{6}$'),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_int_otp_app ON internship_otp_codes (application_id, created_at DESC);

COMMENT ON TABLE internship_otp_codes IS '6-digit email OTP for exam portal identity confirmation. New row per send; verify checks latest live code.';

-- ── 6. EXAM ATTEMPTS ──────────────────────────────────────────────────────
CREATE TABLE internship_exam_attempts (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID         NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
  token_id        UUID         NOT NULL REFERENCES internship_exam_tokens(id) ON DELETE RESTRICT,

  -- Submitted answers: { "question_uuid": "a" | "b" | "c" | "d" }
  answers         JSONB        NOT NULL DEFAULT '{}'::jsonb,

  score_percent   NUMERIC(5,2) CHECK (score_percent IS NULL OR score_percent BETWEEN 0 AND 100),
  correct_count   SMALLINT     CHECK (correct_count IS NULL OR correct_count >= 0),
  total_questions SMALLINT     CHECK (total_questions IS NULL OR total_questions > 0),
  passed          BOOLEAN,

  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (application_id),    -- enforces no-retakes at DB level

  CONSTRAINT completed_has_score
    CHECK (completed_at IS NULL OR (score_percent IS NOT NULL AND passed IS NOT NULL))
);

CREATE INDEX idx_int_attempts_app ON internship_exam_attempts (application_id);

COMMENT ON TABLE internship_exam_attempts IS 'One per application (UNIQUE enforces no-retakes). Graded server-side; correct_option never stored client-side.';

-- ── 7. UPDATED_AT TRIGGERS ────────────────────────────────────────────────
CREATE TRIGGER trg_internship_cohorts_updated_at
  BEFORE UPDATE ON internship_cohorts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_internship_questions_updated_at
  BEFORE UPDATE ON internship_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_internship_applications_updated_at
  BEFORE UPDATE ON internship_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 8. RLS — disabled (all access via service role key) ───────────────────
-- Applicants have no auth.users accounts. All reads/writes use createAdminClient().
ALTER TABLE internship_cohorts         DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_questions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications    DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_exam_tokens     DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_otp_codes       DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_exam_attempts   DISABLE ROW LEVEL SECURITY;

-- ── 9. SEED — one open cohort ─────────────────────────────────────────────
INSERT INTO internship_cohorts (name, status)
VALUES ('Q2 2026', 'open');
