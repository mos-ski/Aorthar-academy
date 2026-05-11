ALTER TABLE standalone_courses
ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'recorded_course'
CHECK (sale_type IN ('pre_sale', 'live_class', 'recorded_course'));

COMMENT ON COLUMN standalone_courses.sale_type IS
  'How the bootcamp is sold: pre_sale, live_class, or recorded_course.';
