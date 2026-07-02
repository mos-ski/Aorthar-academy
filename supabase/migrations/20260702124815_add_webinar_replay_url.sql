-- Add an optional replay destination for completed live events.
-- Public event pages can redirect here once scheduled_at + duration_minutes has passed.

ALTER TABLE public.webinars
  ADD COLUMN IF NOT EXISTS replay_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'webinars_replay_url_check'
      AND conrelid = 'public.webinars'::regclass
  ) THEN
    ALTER TABLE public.webinars
      ADD CONSTRAINT webinars_replay_url_check
      CHECK (replay_url IS NULL OR replay_url = '' OR replay_url ~* '^https?://');
  END IF;
END $$;

UPDATE public.webinars
SET replay_url = 'https://youtu.be/5boUdgMli64'
WHERE slug = 'SLTWX'
  AND (replay_url IS NULL OR replay_url = '');

NOTIFY pgrst, 'reload schema';
