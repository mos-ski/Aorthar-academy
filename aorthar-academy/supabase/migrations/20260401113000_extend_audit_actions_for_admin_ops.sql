DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'admin_invited'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'admin_invited';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'admin_role_granted'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'admin_role_granted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'student_suspended'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'student_suspended';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'student_unsuspended'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'student_unsuspended';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'standalone_access_granted'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'standalone_access_granted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'standalone_access_revoked'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'standalone_access_revoked';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumtypid = 'audit_action'::regtype
      AND enumlabel = 'plan_updated'
  ) THEN
    ALTER TYPE audit_action ADD VALUE 'plan_updated';
  END IF;
END $$;
