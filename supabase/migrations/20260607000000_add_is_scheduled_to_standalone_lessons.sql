ALTER TABLE standalone_lessons
  ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN NOT NULL DEFAULT false;
