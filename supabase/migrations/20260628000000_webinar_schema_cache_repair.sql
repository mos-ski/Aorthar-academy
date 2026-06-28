-- ─────────────────────────────────────────────────────────────────────────────
-- 20260628000000_webinar_schema_cache_repair.sql
-- Idempotent repair for live webinar columns plus PostgREST schema cache reload.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.webinars
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.webinars
  ADD COLUMN IF NOT EXISTS whatsapp_community_url TEXT;

ALTER TABLE public.webinar_registrations
  ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ;

ALTER TABLE public.webinar_registrations
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.webinar_registrations
  ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS wants_whatsapp_community BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'webinars_thumbnail_url_check'
      AND conrelid = 'public.webinars'::regclass
  ) THEN
    ALTER TABLE public.webinars
      ADD CONSTRAINT webinars_thumbnail_url_check
      CHECK (thumbnail_url IS NULL OR thumbnail_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'webinars_whatsapp_community_url_check'
      AND conrelid = 'public.webinars'::regclass
  ) THEN
    ALTER TABLE public.webinars
      ADD CONSTRAINT webinars_whatsapp_community_url_check
      CHECK (whatsapp_community_url IS NULL OR whatsapp_community_url ~* '^https?://');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_webinar_registrations_attended
  ON public.webinar_registrations (webinar_id, attended_at)
  WHERE attended_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_registrations_webinar_email
  ON public.webinar_registrations (webinar_id, lower(email))
  WHERE email <> '';

NOTIFY pgrst, 'reload schema';
