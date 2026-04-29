-- Add study period tracking columns to internship_applications
ALTER TABLE internship_applications
  ADD COLUMN IF NOT EXISTS exam_link_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exam_link_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN internship_applications.exam_link_scheduled_at IS 'When the exam link should be dispatched (form_submitted_at + 24h). Set on form submission.';
COMMENT ON COLUMN internship_applications.exam_link_sent_at IS 'When the exam link email was actually sent by the cron job. NULL = not sent yet.';

-- Clear the Nazza-specific questions — replaced by Aorthar Standard questions
DELETE FROM internship_questions;
