-- Add soft-suspension controls for student account management

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended
  ON profiles (is_suspended)
  WHERE is_suspended = true;
