-- Add sort_order column to courses table (was referenced in code but never defined in schema)
-- Populate with row_number() within each semester to preserve existing relative order

ALTER TABLE courses ADD COLUMN IF NOT EXISTS sort_order SMALLINT NOT NULL DEFAULT 1;

-- Assign sequential sort_order per semester based on current insertion order (created_at / code)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY semester_id ORDER BY created_at, code) AS rn
  FROM courses
)
UPDATE courses
SET sort_order = ranked.rn
FROM ranked
WHERE courses.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_courses_semester_order ON courses (semester_id, sort_order);
