-- ─────────────────────────────────────────────────────────────────────────────
-- 20260626000000_webinars.sql
-- Webinars / live classes: scheduled events people register for and attend
-- via an external join link (Zoom/Google Meet). Free or paid.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE webinar_status AS ENUM ('draft', 'published');

CREATE TABLE webinars (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  scheduled_at       TIMESTAMPTZ NOT NULL,
  duration_minutes   SMALLINT NOT NULL DEFAULT 60,
  capacity           INTEGER,                 -- nullable = unlimited
  price_ngn          INTEGER NOT NULL DEFAULT 0,
  join_url           TEXT NOT NULL DEFAULT '',
  course_id          UUID REFERENCES standalone_courses(id) ON DELETE SET NULL, -- optional, unused v1
  status             webinar_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webinar_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webinar_id            UUID NOT NULL REFERENCES webinars(id) ON DELETE RESTRICT,
  paystack_reference    TEXT UNIQUE,
  amount_paid_ngn       INTEGER NOT NULL DEFAULT 0,
  registered_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_1d_sent_at   TIMESTAMPTZ,
  reminder_1h_sent_at   TIMESTAMPTZ,
  UNIQUE (user_id, webinar_id)
);

CREATE INDEX idx_webinars_status_scheduled ON webinars(status, scheduled_at);
CREATE INDEX idx_webinar_registrations_user ON webinar_registrations(user_id);
CREATE INDEX idx_webinar_registrations_webinar ON webinar_registrations(webinar_id);

CREATE OR REPLACE FUNCTION update_webinars_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_webinars_updated_at
  BEFORE UPDATE ON webinars FOR EACH ROW EXECUTE FUNCTION update_webinars_updated_at();

ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webinars_public_read"
  ON webinars FOR SELECT
  USING (status = 'published');

CREATE POLICY "webinars_admin_all"
  ON webinars FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "webinar_registrations_owner_read"
  ON webinar_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "webinar_registrations_admin_all"
  ON webinar_registrations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
