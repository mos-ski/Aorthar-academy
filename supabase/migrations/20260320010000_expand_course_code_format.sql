-- Allow planned curriculum codes like PM101, UXR202, PORT401, TEAM402.
ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_code_check;

ALTER TABLE courses
  ADD CONSTRAINT courses_code_check
  CHECK (code ~ '^[A-Z]{2,4}[0-9]{3}$');
