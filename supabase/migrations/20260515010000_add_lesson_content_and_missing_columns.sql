-- Add content (markdown notes/summary) column to standalone_lessons
ALTER TABLE standalone_lessons ADD COLUMN IF NOT EXISTS content TEXT;

-- Add youtube_url column if it doesn't exist (rename from video_url was partial)
-- The API already uses youtube_url; ensure it exists
ALTER TABLE standalone_lessons ADD COLUMN IF NOT EXISTS youtube_url TEXT NOT NULL DEFAULT '';

-- Add sale_type column to standalone_courses if missing
ALTER TABLE standalone_courses ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'recorded_course';

-- Add instructor columns to standalone_courses if missing
ALTER TABLE standalone_courses ADD COLUMN IF NOT EXISTS instructor_name TEXT NOT NULL DEFAULT 'Aorthar Instructor';
ALTER TABLE standalone_courses ADD COLUMN IF NOT EXISTS instructor_avatar_url TEXT;