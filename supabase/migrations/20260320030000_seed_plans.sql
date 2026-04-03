-- Seed default Aorthar Academy payment plans
-- Safe to run multiple times (ON CONFLICT DO NOTHING)

INSERT INTO plans (id, name, price, currency, plan_type, billing_type, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Standard',
    20000,
    'NGN',
    'standard',
    'one_time',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Mentorship',
    30000,
    'NGN',
    'mentorship',
    'one_time',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
