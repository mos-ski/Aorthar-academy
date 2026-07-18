-- Contracts module: templates, drafts, signing tokens, signatures, and payments.

CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('employee', 'contractor', 'client')),
  name text NOT NULL,
  description text,
  content_html text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contract_template_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.contract_templates(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('employee', 'contractor', 'client')),
  key text NOT NULL CHECK (key ~ '^[a-zA-Z0-9_.-]+$'),
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text' CHECK (
    field_type IN ('text', 'long_text', 'money', 'date', 'email', 'phone', 'address', 'url', 'checkbox')
  ),
  is_required boolean NOT NULL DEFAULT true,
  help_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, key)
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  mode text NOT NULL CHECK (mode IN ('employee', 'contractor', 'client')),
  title text NOT NULL,
  recipient_name text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'expired', 'signed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'not_required' CHECK (
    payment_status IN ('not_required', 'pending', 'paid', 'manual_paid', 'failed')
  ),
  payment_amount_ngn integer,
  payment_description text,
  rendered_html text,
  signed_snapshot_html text,
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contract_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, field_key)
);

CREATE TABLE IF NOT EXISTS public.contract_signing_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  sent_to_email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  viewed_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  token_id uuid REFERENCES public.contract_signing_tokens(id) ON DELETE SET NULL,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL DEFAULT 'v1',
  ip_address text,
  user_agent text,
  snapshot_html text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id)
);

CREATE TABLE IF NOT EXISTS public.contract_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'manual_paid', 'failed')),
  amount_ngn integer NOT NULL,
  method text NOT NULL DEFAULT 'paystack' CHECK (method IN ('paystack', 'bank_transfer', 'cash', 'other')),
  paystack_reference text UNIQUE,
  manual_reference text,
  note text,
  paid_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_templates_mode_status ON public.contract_templates(mode, status);
CREATE INDEX IF NOT EXISTS idx_contract_template_fields_template ON public.contract_template_fields(template_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contracts_mode_status ON public.contracts(mode, status);
CREATE INDEX IF NOT EXISTS idx_contracts_payment_status ON public.contracts(payment_status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contract_signing_tokens_token ON public.contract_signing_tokens(token);
CREATE INDEX IF NOT EXISTS idx_contract_signing_tokens_contract ON public.contract_signing_tokens(contract_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract ON public.contract_signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_payments_contract ON public.contract_payments(contract_id);

CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contract_templates_updated_at ON public.contract_templates;
CREATE TRIGGER trg_contract_templates_updated_at
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_contracts_updated_at();

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON public.contracts;
CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_contracts_updated_at();

DROP TRIGGER IF EXISTS trg_contract_field_values_updated_at ON public.contract_field_values;
CREATE TRIGGER trg_contract_field_values_updated_at
  BEFORE UPDATE ON public.contract_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_contracts_updated_at();

DROP TRIGGER IF EXISTS trg_contract_payments_updated_at ON public.contract_payments;
CREATE TRIGGER trg_contract_payments_updated_at
  BEFORE UPDATE ON public.contract_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_contracts_updated_at();

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signing_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_contract_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND COALESCE(admin_level, 'super_admin') IN ('super_admin', 'finance_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE POLICY "Contract admins manage templates"
  ON public.contract_templates FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage template fields"
  ON public.contract_template_fields FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage contracts"
  ON public.contracts FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage field values"
  ON public.contract_field_values FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage signing tokens"
  ON public.contract_signing_tokens FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage signatures"
  ON public.contract_signatures FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

CREATE POLICY "Contract admins manage payments"
  ON public.contract_payments FOR ALL
  USING (public.is_contract_admin())
  WITH CHECK (public.is_contract_admin());

WITH inserted_templates AS (
  INSERT INTO public.contract_templates (mode, name, description, content_html, status)
  VALUES
    (
      'employee',
      'Standard Employee Agreement',
      'Default employee employment contract.',
      '<h2>Employment Agreement</h2><p>This Employment Agreement is entered into between Aorthar and {{employee_name}} of {{employee_address}}.</p><p>{{employee_name}} will serve as {{role_title}} starting on {{start_date}}.</p><p>The monthly salary is {{salary}} and normal work hours are {{work_hours}}.</p><p>The employee agrees to perform assigned duties, protect company information, and follow Aorthar policies.</p>',
      'active'
    ),
    (
      'contractor',
      'Standard Contractor Agreement',
      'Default independent contractor agreement.',
      '<h2>Contractor Agreement</h2><p>This Contractor Agreement is entered into between Aorthar and {{contractor_name}} of {{contractor_address}}.</p><p>The contractor will provide {{deliverables}} by {{deadline}}.</p><p>Total contractor fee is {{contractor_fee}}. Milestones: {{milestones}}.</p><p>The contractor remains independent and is responsible for delivering accepted work.</p>',
      'active'
    ),
    (
      'client',
      'Standard Client Service Agreement',
      'Default client service agreement with payment terms.',
      '<h2>Client Service Agreement</h2><p>This Service Agreement is entered into between Aorthar and {{client_name}} of {{client_address}}.</p><p>Aorthar will deliver {{deliverables}} according to this timeline: {{timeline}}.</p><p>The project fee is {{payment_amount}}. Payment terms: {{payment_terms}}.</p><p>Receipt or part-payment notes: {{receipt_note}}.</p>',
      'active'
    )
  RETURNING id, mode
)
INSERT INTO public.contract_template_fields (template_id, mode, key, label, field_type, is_required, help_text, sort_order)
SELECT id, mode, key, label, field_type, is_required, help_text, sort_order
FROM inserted_templates
CROSS JOIN LATERAL (
  VALUES
    ('employee_name', 'Employee Name', 'text', true, 'Full legal name of the employee.', 10),
    ('employee_address', 'Employee Address', 'address', true, 'Residential address.', 20),
    ('role_title', 'Role Title', 'text', true, 'Job title or position.', 30),
    ('start_date', 'Start Date', 'date', true, 'Employment start date.', 40),
    ('salary', 'Salary', 'money', true, 'Monthly or agreed salary.', 50),
    ('work_hours', 'Work Hours', 'text', true, 'Expected working hours.', 60)
) employee_fields(key, label, field_type, is_required, help_text, sort_order)
WHERE mode = 'employee'
UNION ALL
SELECT id, mode, key, label, field_type, is_required, help_text, sort_order
FROM inserted_templates
CROSS JOIN LATERAL (
  VALUES
    ('contractor_name', 'Contractor Name', 'text', true, 'Full legal name of the contractor.', 10),
    ('contractor_address', 'Contractor Address', 'address', true, 'Contractor address.', 20),
    ('deliverables', 'Deliverables', 'long_text', true, 'Expected deliverables.', 30),
    ('deadline', 'Deadline', 'date', true, 'Final delivery date.', 40),
    ('contractor_fee', 'Contractor Fee', 'money', true, 'Total contractor fee.', 50),
    ('milestones', 'Milestones', 'long_text', false, 'Optional milestone breakdown.', 60)
) contractor_fields(key, label, field_type, is_required, help_text, sort_order)
WHERE mode = 'contractor'
UNION ALL
SELECT id, mode, key, label, field_type, is_required, help_text, sort_order
FROM inserted_templates
CROSS JOIN LATERAL (
  VALUES
    ('client_name', 'Client Name', 'text', true, 'Client legal name or company name.', 10),
    ('client_address', 'Client Address', 'address', true, 'Client address.', 20),
    ('deliverables', 'Deliverables', 'long_text', true, 'What Aorthar will deliver.', 30),
    ('timeline', 'Timeline', 'long_text', true, 'Project delivery timeline.', 40),
    ('payment_amount', 'Payment Amount', 'money', true, 'Contract fee.', 50),
    ('payment_terms', 'Payment Terms', 'long_text', true, 'Deposit, balance, or payment timing.', 60),
    ('receipt_note', 'Receipt Note', 'long_text', false, 'Receipt, part payment, or bank transfer note.', 70)
) client_fields(key, label, field_type, is_required, help_text, sort_order)
WHERE mode = 'client';
