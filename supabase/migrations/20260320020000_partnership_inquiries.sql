-- Partnership inquiry submissions from /partnership page
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  type text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Only admins can read; inserts are done via service role key (API route)
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read partnership inquiries"
  ON partnership_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
