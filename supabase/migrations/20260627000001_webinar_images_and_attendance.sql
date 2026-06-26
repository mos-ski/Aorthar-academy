-- ─────────────────────────────────────────────────────────────────────────────
-- 20260627000001_webinar_images_and_attendance.sql
-- Public event image support and attendance tracking for webinars.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE webinars
  ADD COLUMN thumbnail_url TEXT CHECK (thumbnail_url IS NULL OR thumbnail_url ~* '^https?://');

ALTER TABLE webinars
  ADD COLUMN whatsapp_community_url TEXT CHECK (whatsapp_community_url IS NULL OR whatsapp_community_url ~* '^https?://');

ALTER TABLE webinar_registrations
  ADD COLUMN attended_at TIMESTAMPTZ;

ALTER TABLE webinar_registrations
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE webinar_registrations
  ADD COLUMN first_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN last_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN email TEXT NOT NULL DEFAULT '',
  ADD COLUMN whatsapp_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN wants_whatsapp_community BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_webinar_registrations_attended
  ON webinar_registrations (webinar_id, attended_at)
  WHERE attended_at IS NOT NULL;

CREATE UNIQUE INDEX idx_webinar_registrations_webinar_email
  ON webinar_registrations (webinar_id, lower(email))
  WHERE email <> '';
