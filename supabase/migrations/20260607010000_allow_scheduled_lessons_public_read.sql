-- The standalone_lessons_public_read RLS policy only allowed is_published = true,
-- so scheduled-but-unrecorded lessons (is_published = false, is_scheduled = true)
-- were invisible to the app even though the course-watch query asks for them —
-- RLS silently dropped those rows before the .or() filter could match them.
-- Allow public read of scheduled lessons too, so they can render as
-- greyed-out "Scheduled" placeholders in the Course Menu.

DROP POLICY IF EXISTS "standalone_lessons_public_read" ON standalone_lessons;

CREATE POLICY "standalone_lessons_public_read"
  ON standalone_lessons FOR SELECT
  USING (
    (is_published = true OR is_scheduled = true)
    AND EXISTS (
      SELECT 1 FROM standalone_courses sc
      WHERE sc.id = course_id AND sc.status = 'published'
    )
  );
