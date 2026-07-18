-- Add one-way NDA documents to the existing Contracts signing engine.

ALTER TABLE public.contract_templates
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'agreement';

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'agreement',
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_relationship text,
  ADD COLUMN IF NOT EXISTS recipient_company text,
  ADD COLUMN IF NOT EXISTS project_name text,
  ADD COLUMN IF NOT EXISTS completion_delivery_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS completion_delivery_error text;

ALTER TABLE public.contract_templates
  DROP CONSTRAINT IF EXISTS contract_templates_mode_check;
ALTER TABLE public.contract_templates
  ADD CONSTRAINT contract_templates_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));

ALTER TABLE public.contract_template_fields
  DROP CONSTRAINT IF EXISTS contract_template_fields_mode_check;
ALTER TABLE public.contract_template_fields
  ADD CONSTRAINT contract_template_fields_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));

ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_mode_check;
ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));

ALTER TABLE public.contract_templates
  ADD CONSTRAINT contract_templates_document_type_check
  CHECK (document_type IN ('agreement', 'nda'));

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_document_type_check
  CHECK (document_type IN ('agreement', 'nda'));

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_recipient_relationship_check
  CHECK (
    recipient_relationship IS NULL
    OR recipient_relationship IN ('employee', 'contractor', 'client', 'partner', 'vendor', 'other')
  );

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_completion_delivery_status_check
  CHECK (completion_delivery_status IN ('not_started', 'sent', 'partial', 'failed'));

ALTER TABLE public.contract_templates
  ADD CONSTRAINT contract_templates_document_mode_check
  CHECK (
    (document_type = 'nda' AND mode = 'nda')
    OR (document_type = 'agreement' AND mode IN ('employee', 'contractor', 'client'))
  );

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_document_mode_check
  CHECK (
    (document_type = 'nda' AND mode = 'nda')
    OR (document_type = 'agreement' AND mode IN ('employee', 'contractor', 'client'))
  );

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_nda_payment_check
  CHECK (
    document_type <> 'nda'
    OR (
      payment_status = 'not_required'
      AND payment_amount_ngn IS NULL
      AND payment_description IS NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_contract_templates_document_type_status
  ON public.contract_templates(document_type, status);
CREATE INDEX IF NOT EXISTS idx_contracts_document_type_status_created
  ON public.contracts(document_type, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.cancel_contract_document(
  p_contract_id uuid,
  p_cancelled_at timestamptz DEFAULT now()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_cancelled boolean := false;
BEGIN
  UPDATE public.contracts
  SET status = 'cancelled', cancelled_at = p_cancelled_at
  WHERE id = p_contract_id
    AND status NOT IN ('signed', 'cancelled');

  v_cancelled := FOUND;
  IF NOT v_cancelled THEN
    RETURN false;
  END IF;

  UPDATE public.contract_signing_tokens
  SET status = 'revoked', revoked_at = p_cancelled_at
  WHERE contract_id = p_contract_id
    AND status = 'active';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_contract_document(uuid, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_contract_document(uuid, timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.send_contract_document(
  p_contract_id uuid,
  p_token text,
  p_expires_at timestamptz,
  p_sent_to_email text,
  p_created_by uuid,
  p_rendered_html text,
  p_sent_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contracts
  SET
    status = 'sent',
    rendered_html = p_rendered_html,
    sent_at = p_sent_at
  WHERE id = p_contract_id
    AND status NOT IN ('signed', 'cancelled');

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.contract_signing_tokens
  SET status = 'revoked', revoked_at = p_sent_at
  WHERE contract_id = p_contract_id
    AND status = 'active';

  INSERT INTO public.contract_signing_tokens (
    contract_id,
    token,
    expires_at,
    sent_to_email,
    sent_at,
    created_by
  ) VALUES (
    p_contract_id,
    p_token,
    p_expires_at,
    p_sent_to_email,
    p_sent_at,
    p_created_by
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.send_contract_document(uuid, text, timestamptz, text, uuid, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_contract_document(uuid, text, timestamptz, text, uuid, text, timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.update_nda_contract_draft(
  p_contract_id uuid,
  p_update jsonb,
  p_values jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contracts
  SET
    title = CASE WHEN p_update ? 'title' THEN p_update ->> 'title' ELSE title END,
    recipient_name = CASE WHEN p_update ? 'recipient_name' THEN p_update ->> 'recipient_name' ELSE recipient_name END,
    recipient_email = CASE WHEN p_update ? 'recipient_email' THEN p_update ->> 'recipient_email' ELSE recipient_email END,
    recipient_phone = CASE WHEN p_update ? 'recipient_phone' THEN NULLIF(btrim(p_update ->> 'recipient_phone'), '') ELSE recipient_phone END,
    recipient_relationship = CASE WHEN p_update ? 'recipient_relationship' THEN NULLIF(btrim(p_update ->> 'recipient_relationship'), '') ELSE recipient_relationship END,
    recipient_company = CASE WHEN p_update ? 'recipient_company' THEN NULLIF(btrim(p_update ->> 'recipient_company'), '') ELSE recipient_company END,
    project_name = CASE WHEN p_update ? 'project_name' THEN NULLIF(btrim(p_update ->> 'project_name'), '') ELSE project_name END
  WHERE id = p_contract_id
    AND status = 'draft'
    AND document_type = 'nda'
    AND mode = 'nda';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.contract_field_values (
    contract_id,
    field_key,
    field_label,
    field_type,
    value
  )
  SELECT
    p_contract_id,
    field_entry.key,
    initcap(replace(field_entry.key, '_', ' ')),
    'text',
    field_entry.value
  FROM jsonb_each_text(COALESCE(p_values, '{}'::jsonb)) AS field_entry
  ON CONFLICT (contract_id, field_key) DO UPDATE SET
    value = EXCLUDED.value;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.update_nda_contract_draft(uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_nda_contract_draft(uuid, jsonb, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.sign_contract_document(
  p_token text,
  p_signer_name text,
  p_consent_text text,
  p_consent_version text,
  p_ip_address text,
  p_user_agent text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_token public.contract_signing_tokens%ROWTYPE;
  v_contract public.contracts%ROWTYPE;
  v_now timestamptz;
BEGIN
  SELECT *
  INTO v_token
  FROM public.contract_signing_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  -- Lock contract before token, matching cancellation's lock order.
  SELECT *
  INTO v_contract
  FROM public.contracts
  WHERE id = v_token.contract_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  SELECT *
  INTO v_token
  FROM public.contract_signing_tokens AS signing_token
  WHERE signing_token.id = v_token.id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  v_now := clock_timestamp();

  IF v_contract.status = 'cancelled' THEN
    RETURN jsonb_build_object('status', 'cancelled');
  END IF;

  IF v_contract.status = 'signed' THEN
    RETURN jsonb_build_object('status', 'already_signed');
  END IF;

  IF v_token.status <> 'active' THEN
    RETURN jsonb_build_object('status', 'inactive');
  END IF;

  IF v_token.expires_at <= v_now THEN
    UPDATE public.contract_signing_tokens
    SET status = 'expired'
    WHERE id = v_token.id;

    UPDATE public.contracts
    SET status = 'expired'
    WHERE id = v_contract.id
      AND status NOT IN ('signed', 'cancelled');

    RETURN jsonb_build_object('status', 'expired');
  END IF;

  IF COALESCE(btrim(v_contract.rendered_html), '') = '' THEN
    RETURN jsonb_build_object('status', 'invalid_snapshot');
  END IF;

  INSERT INTO public.contract_signatures (
    contract_id,
    token_id,
    signer_name,
    signer_email,
    consent_text,
    consent_version,
    ip_address,
    user_agent,
    snapshot_html,
    signed_at
  ) VALUES (
    v_contract.id,
    v_token.id,
    p_signer_name,
    v_contract.recipient_email,
    p_consent_text,
    p_consent_version,
    p_ip_address,
    p_user_agent,
    v_contract.rendered_html,
    v_now
  );

  UPDATE public.contract_signing_tokens
  SET status = 'used', used_at = v_now
  WHERE id = v_token.id;

  UPDATE public.contracts
  SET
    status = 'signed',
    signed_at = v_now,
    signed_snapshot_html = v_contract.rendered_html
  WHERE id = v_contract.id;

  RETURN jsonb_build_object(
    'status', 'signed',
    'signed_at', v_now,
    'snapshot_html', v_contract.rendered_html,
    'signer_email', v_contract.recipient_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sign_contract_document(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_contract_document(text, text, text, text, text, text) TO service_role;

INSERT INTO public.contract_templates (
  mode,
  document_type,
  name,
  description,
  content_html,
  status
)
SELECT
  'nda',
  'nda',
  'Aorthar One-Way Project NDA',
  'Universal recipient-only NDA. Qualified Nigerian counsel must approve this template before activation or production use.',
  $nda$
    <h1 style="text-align:center;">NON-DISCLOSURE AGREEMENT</h1>
    <p>This Non-Disclosure Agreement (the <strong>Agreement</strong>) takes effect on <strong>{{effective_date}}</strong>.</p>
    <p><strong>Disclosing Party:</strong> {{disclosing_party_name}}, of {{disclosing_party_address}} (called <strong>Aorthar</strong> in this Agreement).</p>
    <p><strong>Receiving Party:</strong> {{recipient_name}} ({{recipient_relationship}}), reachable at {{recipient_email}} and {{recipient_phone}} (called the <strong>Recipient</strong> in this Agreement).</p>

    <h2>1. Project and permitted purpose</h2>
    <p>The Recipient will receive access to confidential information only for <strong>{{project_name}}</strong>. The permitted purpose is: {{project_purpose}}</p>

    <h2>2. Confidential information</h2>
    <p>Confidential Information means non-public information disclosed or made accessible by Aorthar, its clients, partners, personnel, or systems in writing, verbally, visually, digitally, through credentials, or through access to any project. It includes client identities and data, briefs, strategy, research, designs, source code, repositories, credentials, processes, pricing, finances, business plans, recordings, documents, prototypes, work in progress, deliverables, and any information that a reasonable person would understand to be confidential.</p>

    <h2>3. Recipient obligations</h2>
    <p>The Recipient shall use Confidential Information only for the permitted purpose, protect it with reasonable care, restrict access to people expressly authorised in writing by Aorthar, and promptly report any suspected loss or unauthorised access. The Recipient shall not disclose, sell, license, copy, download, reproduce, reverse engineer, or retain Confidential Information except to the limited extent necessary for the permitted purpose and authorised by Aorthar.</p>

    <h2>4. Permanent no-posting, no-portfolio, and no-publicity restriction</h2>
    <p>The Recipient shall not claim, present, publish, display, describe, or imply ownership or authorship of Aorthar or client work without Aorthar's prior written permission. This restriction includes portfolios, social media, websites, GitHub or other repositories used as work samples, Behance, Dribbble, case studies, demos, screenshots, recordings, before-and-after comparisons, pitches, proposals, interviews, talks, training materials, award submissions, or use of any Aorthar or client name, brand, logo, testimonial, or project detail for publicity.</p>
    <p>This Section 4 shall survive permanently after the project or relationship ends unless Aorthar gives prior written permission for a specific use.</p>

    <h2>5. Ownership and no licence</h2>
    <p>All project materials supplied by Aorthar or its client remain the property of their existing owner. Access to Confidential Information grants no licence, ownership, publicity, portfolio, or attribution right. Ownership of work product created during the project remains governed by the applicable employment, contractor, client, or project agreement; this Agreement does not reduce any ownership rights granted to Aorthar under that separate agreement.</p>

    <h2>6. Exclusions</h2>
    <p>The obligations in this Agreement do not apply to information the Recipient can prove was already lawfully known without a confidentiality duty, becomes public without breach of this Agreement, is independently developed without using Confidential Information, or is lawfully received from a third party without a confidentiality duty.</p>

    <h2>7. Required disclosure</h2>
    <p>If law or a binding order requires disclosure, the Recipient shall, where legally permitted, promptly notify Aorthar in writing, disclose only the minimum required information, and reasonably assist Aorthar in seeking protective treatment.</p>

    <h2>8. Return and deletion</h2>
    <p>On Aorthar's request or when the project or relationship ends, the Recipient shall stop using Confidential Information and promptly return or securely delete it, including copies in personal devices, cloud accounts, messaging apps, and repositories, except for a copy that law requires the Recipient to retain.</p>

    <h2>9. Term and survival</h2>
    <p>The general confidentiality and non-use duties continue for <strong>{{confidentiality_term}}</strong> after the effective date. Duties covering trade secrets continue for as long as the information remains a trade secret. Section 4, ownership protections, and obligations intended by their nature to survive shall continue as stated in this Agreement.</p>

    <h2>10. Remedies</h2>
    <p>The Recipient acknowledges that unauthorised use or disclosure may cause harm that money alone may not adequately remedy. Aorthar may seek available injunctive or other equitable relief in addition to any other lawful remedy.</p>

    <h2>11. Governing law</h2>
    <p>This Agreement is governed by the laws of the Federal Republic of Nigeria. The parties shall first attempt in good faith to resolve a dispute promptly before pursuing any remedy available under Nigerian law.</p>

    <h2>12. Entire agreement and electronic signature</h2>
    <p>This Agreement records the parties' understanding about its subject matter and may be changed only in writing by Aorthar and the Recipient. If a provision is unenforceable, the remaining provisions continue. The Recipient agrees that typing their full legal name and submitting it with the electronic-signature consent is intended to authenticate and sign this Agreement.</p>
  $nda$,
  'draft'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.contract_templates
  WHERE document_type = 'nda'
    AND name = 'Aorthar One-Way Project NDA'
);

WITH nda_template AS (
  SELECT id
  FROM public.contract_templates
  WHERE document_type = 'nda'
    AND name = 'Aorthar One-Way Project NDA'
  ORDER BY created_at
  LIMIT 1
), fields(key, label, field_type, is_required, help_text, sort_order) AS (
  VALUES
    ('effective_date', 'Effective Date', 'date', true, 'The date this NDA begins.', 10),
    ('disclosing_party_name', 'Disclosing Party Legal Name', 'text', true, 'Enter Aorthar''s registered legal entity name.', 20),
    ('disclosing_party_address', 'Disclosing Party Address', 'address', true, 'Enter Aorthar''s registered business address.', 30),
    ('recipient_name', 'Recipient Legal Name', 'text', true, 'Enter the recipient''s full legal name.', 40),
    ('recipient_relationship', 'Recipient Relationship', 'text', true, 'Employee, contractor, client, partner, vendor, or other.', 50),
    ('recipient_email', 'Recipient Email', 'email', true, 'The email tied to the signing record.', 60),
    ('recipient_phone', 'Recipient Phone or WhatsApp', 'phone', true, 'Use an international or Nigerian mobile number.', 70),
    ('project_name', 'Project Name', 'text', true, 'The private project or engagement covered by this NDA.', 80),
    ('project_purpose', 'Project Purpose', 'long_text', true, 'Explain why the recipient is receiving access.', 90),
    ('confidentiality_term', 'Confidentiality Term', 'text', true, 'For example: 5 years. The no-portfolio restriction remains permanent.', 100)
)
INSERT INTO public.contract_template_fields (
  template_id,
  mode,
  key,
  label,
  field_type,
  is_required,
  help_text,
  sort_order
)
SELECT
  nda_template.id,
  'nda',
  fields.key,
  fields.label,
  fields.field_type,
  fields.is_required,
  fields.help_text,
  fields.sort_order
FROM nda_template
CROSS JOIN fields
ON CONFLICT (template_id, key) DO UPDATE SET
  label = EXCLUDED.label,
  field_type = EXCLUDED.field_type,
  is_required = EXCLUDED.is_required,
  help_text = EXCLUDED.help_text,
  sort_order = EXCLUDED.sort_order;
