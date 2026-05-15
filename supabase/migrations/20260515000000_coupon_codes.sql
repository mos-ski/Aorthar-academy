-- Coupon codes for bootcamp discounts
CREATE TABLE coupon_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  scope         TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'specific')),
  course_id     UUID REFERENCES standalone_courses(id) ON DELETE CASCADE,
  max_uses      INTEGER,
  used_count    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by code
CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_course_id ON coupon_codes(course_id);
CREATE INDEX idx_coupon_codes_is_active ON coupon_codes(is_active);

-- scope='specific' must have a course_id
ALTER TABLE coupon_codes ADD CONSTRAINT coupon_specific_requires_course
  CHECK (NOT (scope = 'specific' AND course_id IS NULL));

-- RLS policies
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY coupon_codes_admin_all ON coupon_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY coupon_codes_public_validate ON coupon_codes
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RPC function to atomically increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id_input UUID)
RETURNS void AS $$
UPDATE coupon_codes
SET used_count = used_count + 1, updated_at = now()
WHERE id = coupon_id_input AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER;