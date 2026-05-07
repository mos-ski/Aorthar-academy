-- Add address column to internship_applications for scoreboard display
ALTER TABLE internship_applications
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ensure track column exists (may already exist from earlier migrations)
ALTER TABLE internship_applications
ADD COLUMN IF NOT EXISTS track TEXT;
