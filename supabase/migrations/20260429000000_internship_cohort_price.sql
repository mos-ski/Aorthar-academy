-- Add configurable application fee to internship cohorts
ALTER TABLE internship_cohorts
  ADD COLUMN IF NOT EXISTS price_ngn INTEGER NOT NULL DEFAULT 10000
    CHECK (price_ngn > 0);

COMMENT ON COLUMN internship_cohorts.price_ngn IS 'Application fee in Naira for this cohort. Configurable per cohort from admin.';

-- Set the existing Q2 2026 cohort to 100 for testing
UPDATE internship_cohorts SET price_ngn = 100 WHERE name = 'Q2 2026';
