-- Add department column to courses table
-- This allows courses to be organized by department while maintaining the year/semester structure

ALTER TABLE courses ADD COLUMN IF NOT EXISTS department TEXT;

-- Add index for department lookups
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);

-- Add comment
COMMENT ON COLUMN courses.department IS 'Department this course belongs to (e.g., Frontend Engineering, DevOps Engineering, etc.)';
