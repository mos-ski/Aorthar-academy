-- Replace original USD placeholder plans with correct Aorthar NGN plans.
-- Safe to run on a fresh project (no subscribers yet).
-- In production, handle manually if subscriptions exist.

DELETE FROM plans;

INSERT INTO plans (name, description, price, currency, billing_type, plan_type, access_scope) VALUES
  (
    'Standard',
    'One-time payment. Unlocks Years 200–400, full GPA history, transcript downloads, and capstone eligibility.',
    20000,
    'NGN',
    'one_time',
    'lifetime',
    ARRAY['200_level', '300_level', '400_level', 'gpa_export', 'capstone']
  ),
  (
    'Mentorship',
    'Add-on for Standard students. Dedicated mentor, weekly accountability check-ins, and priority support. Upgrades you to Premium.',
    30000,
    'NGN',
    'one_time',
    'lifetime',
    ARRAY['mentorship', 'priority_support']
  );
