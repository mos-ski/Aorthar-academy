-- ─────────────────────────────────────────────────────────────────────────────
-- 20260627000000_webinar_broadcasts.sql
-- Log of admin broadcast emails sent to a webinar's registered attendees.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE webinar_broadcasts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id        UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL,
  body_html         TEXT NOT NULL,
  recipient_count   INTEGER NOT NULL DEFAULT 0,
  sent_by           UUID REFERENCES auth.users(id),
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webinar_broadcasts_webinar ON webinar_broadcasts(webinar_id);

ALTER TABLE webinar_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webinar_broadcasts_admin_all"
  ON webinar_broadcasts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
