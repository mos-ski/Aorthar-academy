DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_level') THEN
    CREATE TYPE admin_level AS ENUM ('super_admin', 'content_admin', 'finance_admin');
  END IF;
END $$;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS admin_level admin_level;

UPDATE profiles
SET admin_level = 'super_admin'
WHERE role = 'admin'
  AND admin_level IS NULL;
