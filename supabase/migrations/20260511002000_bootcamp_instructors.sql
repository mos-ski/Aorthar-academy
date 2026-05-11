CREATE TABLE IF NOT EXISTS bootcamp_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bootcamp_instructors_active_name
  ON bootcamp_instructors (is_active, full_name);

CREATE OR REPLACE FUNCTION update_bootcamp_instructors_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootcamp_instructors_updated_at ON bootcamp_instructors;
CREATE TRIGGER trg_bootcamp_instructors_updated_at
  BEFORE UPDATE ON bootcamp_instructors
  FOR EACH ROW EXECUTE FUNCTION update_bootcamp_instructors_updated_at();

ALTER TABLE bootcamp_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bootcamp_instructors_public_read"
  ON bootcamp_instructors FOR SELECT
  USING (is_active = true);

CREATE POLICY "bootcamp_instructors_admin_all"
  ON bootcamp_instructors FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('bootcamp-instructors', 'bootcamp-instructors', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "bootcamp_instructor_avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bootcamp-instructors');

CREATE POLICY "bootcamp_instructor_avatars_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bootcamp-instructors' AND is_admin());

CREATE POLICY "bootcamp_instructor_avatars_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'bootcamp-instructors' AND is_admin())
  WITH CHECK (bucket_id = 'bootcamp-instructors' AND is_admin());

CREATE POLICY "bootcamp_instructor_avatars_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bootcamp-instructors' AND is_admin());
