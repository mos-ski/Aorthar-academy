ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_department_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_department_check
  CHECK (
    department IS NULL OR department IN (
      'UI/UX Design',
      'Product Management',
      'Product Design',
      'Design Engineering (FE)',
      'Backend Engineering',
      'Scrum & Agile',
      'Operations',
      'Quality Assurance (QA)'
    )
  );

COMMENT ON COLUMN profiles.department IS 'Student-selected discipline within Faculty of Product Development.';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when the student completed faculty onboarding and semester setup.';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_department TEXT;
BEGIN
  v_department := NULLIF(TRIM(NEW.raw_user_meta_data->>'department'), '');

  IF v_department NOT IN (
    'UI/UX Design',
    'Product Management',
    'Product Design',
    'Design Engineering (FE)',
    'Backend Engineering',
    'Scrum & Agile',
    'Operations',
    'Quality Assurance (QA)'
  ) THEN
    v_department := NULL;
  END IF;

  INSERT INTO profiles (user_id, full_name, department)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    v_department
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

