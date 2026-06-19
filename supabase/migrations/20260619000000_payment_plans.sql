-- ─────────────────────────────────────────────────────────────────────────────
-- 20260619000000_payment_plans.sql
-- Payment plans for standalone courses: pay a percentage now, the rest later.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE standalone_courses
  ADD COLUMN allow_payment_plan BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE payment_plan_status AS ENUM ('awaiting_balance', 'completed', 'forfeited');

CREATE TABLE course_payment_plans (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id                   UUID NOT NULL REFERENCES standalone_courses(id) ON DELETE RESTRICT,
  total_price_ngn             INTEGER NOT NULL,
  first_payment_percent       NUMERIC(5,2) NOT NULL,
  first_payment_ngn           INTEGER NOT NULL,
  balance_ngn                 INTEGER NOT NULL,
  first_paystack_reference    TEXT UNIQUE NOT NULL,
  balance_paystack_reference  TEXT UNIQUE,
  status                      payment_plan_status NOT NULL DEFAULT 'awaiting_balance',
  deadline_at                 TIMESTAMPTZ NOT NULL,
  terms_accepted_at           TIMESTAMPTZ NOT NULL,
  first_paid_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  balance_paid_at             TIMESTAMPTZ,
  forfeited_at                TIMESTAMPTZ,
  reminder_7d_sent_at         TIMESTAMPTZ,
  reminder_1d_sent_at         TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one ACTIVE plan per user/course; a forfeited or completed plan
-- doesn't block a future purchase or a new plan for the same course.
CREATE UNIQUE INDEX idx_payment_plans_active_unique
  ON course_payment_plans(user_id, course_id)
  WHERE status = 'awaiting_balance';

CREATE INDEX idx_payment_plans_status ON course_payment_plans(status);
CREATE INDEX idx_payment_plans_user ON course_payment_plans(user_id);

ALTER TABLE course_payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_plans_owner_read"
  ON course_payment_plans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "payment_plans_admin_all"
  ON course_payment_plans FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO site_settings (key, label, value, group_name) VALUES
  ('payment_plan_min_percent',   'Minimum first payment (%)',      '50', 'payment_plans'),
  ('payment_plan_deadline_days', 'Days to pay remaining balance',  '30', 'payment_plans')
ON CONFLICT (key) DO NOTHING;
