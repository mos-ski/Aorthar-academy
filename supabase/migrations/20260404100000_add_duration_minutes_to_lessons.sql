-- Add duration_minutes to lessons table
-- The admin UI and lesson API expect this column for displaying/setting lesson duration

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes SMALLINT NOT NULL DEFAULT 45;

COMMENT ON COLUMN lessons.duration_minutes IS 'Estimated watch/read time in minutes. Set by admin; used in lesson cards.';
