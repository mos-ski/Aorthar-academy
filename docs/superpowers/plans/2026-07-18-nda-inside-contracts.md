# NDA Inside Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-way NDA document workflow inside Contracts, including recipient/project capture, email and manual WhatsApp-link delivery, recipient-only signing, completed PDF emails, and dashboard records.

**Architecture:** Extend the existing contract tables and shared signing engine with `document_type='nda'` and `mode='nda'`; keep NDA relationship metadata separate from agreement modes. Reuse immutable snapshots, tokens, signatures, PDF rendering, email delivery, and admin routes, adding small NDA-focused domain helpers and conditional UI instead of creating a second document engine.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Postgres, Resend, Puppeteer PDF rendering, Vitest, Bun.

## Global Constraints

- NDA lives inside Contracts; do not add another admin sidebar module.
- NDA is one-way: Aorthar discloses and the external recipient receives.
- Only the recipient signs in v1; Aorthar does not countersign.
- The no-posting/no-portfolio restriction is permanent unless Aorthar grants written permission.
- The completed PDF is emailed to the recipient and `site_settings.contact_email` and remains available in the dashboard.
- WhatsApp delivery is manual; provide a prepared `wa.me` link and never call the WhatsApp Business API.
- Existing employee, contractor, and client agreement behavior must remain backward compatible.
- NDA documents never create or expose payment state or payment actions.
- The seeded legal template requires qualified Nigerian counsel review before production use.
- Use `bun`; do not use npm or pnpm.
- The production build is the primary correctness gate.

---

## File Structure

### Create

- `supabase/migrations/20260718151541_nda_inside_contracts.sql` — extend constraints/columns, indexes, and seed the universal NDA template and fields.
- `src/lib/contracts/nda.ts` — NDA classification, metadata validation, template-value mapping, phone normalisation, and WhatsApp sharing.

### Modify

- `src/lib/contracts/types.ts` — add NDA document, mode, relationship, and delivery result types.
- `src/__tests__/unit/contracts.test.ts` — focused NDA domain and regression tests.
- `src/app/api/admin/contracts/route.ts` — create/filter NDA documents and exclude payments.
- `src/app/api/admin/contracts/[id]/route.ts` — update NDA metadata and revoke links when cancelled.
- `src/app/api/admin/contracts/[id]/send/route.ts` — email/link delivery choice and signing URL response.
- `src/app/api/admin/contracts/[id]/duplicate/route.ts` — retain NDA classification and metadata without payments.
- `src/app/api/admin/contracts/[id]/pdf/route.ts` — use NDA-safe file naming and completed snapshots.
- `src/app/api/contracts/sign/[token]/route.ts` — send completed PDF copies after an NDA is signed.
- `src/lib/email/templates/contracts.ts` — NDA request, owner completion, and recipient completion copy.
- `src/app/(admin)/admin/contracts/new/page.tsx` — accept `?type=nda` and load document-type metadata.
- `src/app/(admin)/admin/contracts/ContractComposerClient.tsx` — NDA mode, metadata inputs, email/link choices, and share result.
- `src/app/(admin)/admin/contracts/page.tsx` — select NDA metadata.
- `src/app/(admin)/admin/contracts/ContractsAdminClient.tsx` — Agreements/NDAs filters, NDA metrics, and context.
- `src/app/(admin)/admin/contracts/[id]/page.tsx` — pass signing URLs and NDA metadata.
- `src/app/(admin)/admin/contracts/[id]/ContractDetailClient.tsx` — copy-link/WhatsApp/revoke/download actions and hide payments.
- `src/app/contracts/sign/[token]/SignContractClient.tsx` — NDA-specific trust copy and no payment branch.
- `src/app/(admin)/admin/contracts/templates/TemplatesClient.tsx` — allow NDA templates and identify document type.
- `src/app/api/admin/contract-templates/route.ts` — validate and persist NDA template classification.
- `docs/platform/database-schema.md` and `docs/platform/email-templates.md` — document the extension.

---

### Task 1: NDA Schema, Types, And Seed Template

**Files:**
- Create: `supabase/migrations/20260718151541_nda_inside_contracts.sql`
- Modify: `src/lib/contracts/types.ts`
- Modify: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Produces: `ContractDocumentType = 'agreement' | 'nda'`
- Produces: `ContractMode = 'employee' | 'contractor' | 'client' | 'nda'`
- Produces: `NdaRecipientRelationship = 'employee' | 'contractor' | 'client' | 'partner' | 'vendor' | 'other'`
- Produces: database columns `document_type`, `recipient_phone`, `recipient_relationship`, `recipient_company`, and `project_name`

- [ ] **Step 1: Add failing type/domain test imports**

Extend the contract test imports with the helpers that Task 2 will implement and add a seed-safety assertion using the migration source:

```ts
import { readFileSync } from 'node:fs';
import {
  buildNdaWhatsAppUrl,
  isNdaDocument,
  ndaMetadataFieldValues,
  validateNdaMetadata,
} from '@/lib/contracts/nda';

describe('NDA contracts', () => {
  it('classifies only NDA documents as NDAs', () => {
    expect(isNdaDocument({ document_type: 'nda', mode: 'nda' })).toBe(true);
    expect(isNdaDocument({ document_type: 'agreement', mode: 'client' })).toBe(false);
  });

  it('seeds the permanent no-portfolio restriction', () => {
    const migration = readFileSync('supabase/migrations/20260718151541_nda_inside_contracts.sql', 'utf8');
    expect(migration).toContain('portfolio');
    expect(migration).toContain('prior written permission');
    expect(migration).toContain('survive permanently');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the missing module failure**

Run: `bun run test src/__tests__/unit/contracts.test.ts`

Expected: FAIL because `@/lib/contracts/nda` and the NDA migration do not exist.

- [ ] **Step 3: Extend the shared types**

Add these exact types to `src/lib/contracts/types.ts` and include `nda` in `ContractMode`:

```ts
export type ContractDocumentType = 'agreement' | 'nda';
export type ContractMode = 'employee' | 'contractor' | 'client' | 'nda';
export type NdaRecipientRelationship =
  | 'employee'
  | 'contractor'
  | 'client'
  | 'partner'
  | 'vendor'
  | 'other';

export type NdaMetadata = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientRelationship: NdaRecipientRelationship | '';
  recipientCompany?: string | null;
  projectName: string;
  projectPurpose: string;
  effectiveDate: string;
  confidentialityTerm: string;
};
```

Change payment status logic consumers so `mode='nda'` always produces `not_required`.

- [ ] **Step 4: Add the migration**

The migration must:

```sql
ALTER TABLE public.contract_templates
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'agreement';
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'agreement',
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_relationship text,
  ADD COLUMN IF NOT EXISTS recipient_company text,
  ADD COLUMN IF NOT EXISTS project_name text;

ALTER TABLE public.contract_templates DROP CONSTRAINT IF EXISTS contract_templates_mode_check;
ALTER TABLE public.contract_templates ADD CONSTRAINT contract_templates_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));
ALTER TABLE public.contract_template_fields DROP CONSTRAINT IF EXISTS contract_template_fields_mode_check;
ALTER TABLE public.contract_template_fields ADD CONSTRAINT contract_template_fields_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_mode_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_mode_check
  CHECK (mode IN ('employee', 'contractor', 'client', 'nda'));
```

Add named checks for document type and relationship, add `(document_type, status, created_at desc)` indexes, and seed one idempotent `Aorthar One-Way Project NDA` template plus its fields. The template must contain the clauses enumerated in the approved design and use these placeholders:

```text
effective_date
recipient_name
recipient_email
recipient_phone
recipient_relationship
project_name
project_purpose
confidentiality_term
```

Seed the template as `draft`, with a description stating that Nigerian counsel must approve it before activation.

- [ ] **Step 5: Check SQL and type formatting**

Run: `bunx prettier --check supabase/migrations/20260718151541_nda_inside_contracts.sql src/lib/contracts/types.ts`

Expected: PASS, or only the SQL file is reported as unsupported while TypeScript passes.

- [ ] **Step 6: Commit the schema slice**

```bash
git add supabase/migrations/20260718151541_nda_inside_contracts.sql src/lib/contracts/types.ts src/__tests__/unit/contracts.test.ts
git commit -m "feat: add NDA contract schema"
```

---

### Task 2: NDA Domain Validation And WhatsApp Sharing

**Files:**
- Create: `src/lib/contracts/nda.ts`
- Modify: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Consumes: `NdaMetadata`, `NdaRecipientRelationship`
- Produces: `isNdaDocument(document): boolean`
- Produces: `validateNdaMetadata(input): Array<{ field: string; message: string }>`
- Produces: `ndaMetadataFieldValues(input): Record<string, string>`
- Produces: `normalizeWhatsAppPhone(value, defaultCountryCode?): string`
- Produces: `buildNdaWhatsAppUrl(input): string`

- [ ] **Step 1: Add exact failing validation and sharing tests**

```ts
it('requires recipient and project identity before an NDA is sent', () => {
  expect(validateNdaMetadata({
    recipientName: '', recipientEmail: 'bad', recipientPhone: '', recipientRelationship: '',
    projectName: '', projectPurpose: '', effectiveDate: '', confidentialityTerm: '',
  }).map((issue) => issue.field)).toEqual([
    'recipient_name', 'recipient_email', 'recipient_phone', 'recipient_relationship',
    'project_name', 'project_purpose', 'effective_date', 'confidentiality_term',
  ]);
});

it('maps NDA metadata into immutable template values', () => {
  expect(ndaMetadataFieldValues(validNdaMetadata)).toMatchObject({
    recipient_name: 'Ada Lovelace',
    recipient_relationship: 'Contractor',
    project_name: 'Atlas',
  });
});

it('builds a manual WhatsApp share URL from a Nigerian local number', () => {
  const url = buildNdaWhatsAppUrl({
    phone: '0803 123 4567', recipientName: 'Ada', projectName: 'Atlas',
    signingUrl: 'https://aorthar.com/contracts/sign/token',
  });
  expect(url).toContain('https://wa.me/2348031234567?text=');
  expect(decodeURIComponent(url)).toContain('Atlas');
});
```

- [ ] **Step 2: Run and confirm failures**

Run: `bun run test src/__tests__/unit/contracts.test.ts`

Expected: FAIL with missing helper implementations.

- [ ] **Step 3: Implement focused helpers**

Use explicit return types, a conservative email regex matching the send route, Nigerian `0` to `234` normalisation, preservation of already international numbers, and an empty string when no usable phone remains. The WhatsApp message must read:

```text
Hi {recipientName}, Aorthar has sent you a Non-Disclosure Agreement for {projectName}. Please review and sign it using this secure link: {signingUrl}
```

Do not add network calls or browser globals to this module.

- [ ] **Step 4: Run focused tests**

Run: `bun run test src/__tests__/unit/contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit domain helpers**

```bash
git add src/lib/contracts/nda.ts src/__tests__/unit/contracts.test.ts
git commit -m "feat: add NDA validation and sharing helpers"
```

---

### Task 3: NDA Creation, Update, Duplicate, And Delivery APIs

**Files:**
- Modify: `src/app/api/admin/contracts/route.ts`
- Modify: `src/app/api/admin/contracts/[id]/route.ts`
- Modify: `src/app/api/admin/contracts/[id]/send/route.ts`
- Modify: `src/app/api/admin/contracts/[id]/duplicate/route.ts`
- Modify: `src/app/api/admin/contract-templates/route.ts`

**Interfaces:**
- Consumes: Task 1 database columns and Task 2 helpers
- Produces: `POST /api/admin/contracts` NDA metadata persistence
- Produces: `POST /api/admin/contracts/:id/send` body `{ delivery_method?: 'email' | 'link' }`
- Produces: send response `{ ok, signing_url, expires_at, email_sent, email_error? }`

- [ ] **Step 1: Add route-level pure assertions to the unit suite**

Add tests for `mode='nda'` payment exclusion and valid NDA metadata mapping. Keep database integration out of the unit suite.

- [ ] **Step 2: Extend contract creation**

Accept these fields:

```ts
document_type?: ContractDocumentType;
recipient_phone?: string;
recipient_relationship?: NdaRecipientRelationship | '';
recipient_company?: string | null;
project_name?: string;
```

For NDA creation, force `document_type='nda'`, `mode='nda'`, `payment_status='not_required'`, `payment_amount_ngn=null`, merge `ndaMetadataFieldValues()` into `values`, and never insert `contract_payments`. Draft creation may have missing fields; sending may not.

- [ ] **Step 3: Extend update and cancellation**

Permit NDA metadata updates only while the document is not signed. When status becomes `cancelled`, set `cancelled_at` and revoke every active signing token in the same request flow.

- [ ] **Step 4: Make send support email or link delivery**

Validate NDA metadata with `validateNdaMetadata()` in addition to placeholder completeness. Always create the token and snapshot. Send email only when `delivery_method !== 'link'`.

Return a successful result even when Resend fails after token creation:

```ts
return NextResponse.json({
  ok: true,
  signing_url: contractSigningUrl(token),
  expires_at: expiresAt,
  email_sent: emailError === null,
  ...(emailError ? { email_error: emailError } : {}),
});
```

Use NDA-specific email copy for NDA documents and existing agreement copy otherwise.

- [ ] **Step 5: Preserve NDA metadata on duplicate**

Select and insert `document_type`, `recipient_phone`, `recipient_relationship`, `recipient_company`, and `project_name`. Ensure duplicated NDAs remain draft and never create a payment row.

- [ ] **Step 6: Permit NDA templates**

Accept `document_type` in the template route, require `mode='nda'` when `document_type='nda'`, and retain agreement validation for existing modes.

- [ ] **Step 7: Run route lint**

Run:

```bash
bun run lint -- src/app/api/admin/contracts/route.ts src/app/api/admin/contracts/[id]/route.ts src/app/api/admin/contracts/[id]/send/route.ts src/app/api/admin/contracts/[id]/duplicate/route.ts src/app/api/admin/contract-templates/route.ts
```

Expected: PASS.

- [ ] **Step 8: Commit the API slice**

```bash
git add src/app/api/admin/contracts src/app/api/admin/contract-templates/route.ts
git commit -m "feat: add NDA contract APIs"
```

---

### Task 4: NDA Emails And Completed PDF Copies

**Files:**
- Modify: `src/lib/email/templates/contracts.ts`
- Modify: `src/app/api/contracts/sign/[token]/route.ts`
- Modify: `src/app/api/admin/contracts/[id]/pdf/route.ts`
- Modify: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Produces: `ndaSigningRequestSubject(title): string`
- Produces: `ndaSigningRequestHtml(data): string`
- Produces: `ndaCompletedSubject(title): string`
- Produces: `ndaCompletedRecipientHtml(data): string`
- Produces: `ndaCompletedOwnerHtml(data): string`
- Consumes: `contractPdfBuffer()` and `sendEmail({ attachments })`

- [ ] **Step 1: Add failing email-copy tests**

Assert that request copy says `Non-Disclosure Agreement`, completion copy identifies the project, and dynamic recipient/project strings are HTML escaped.

- [ ] **Step 2: Implement NDA email templates**

Reuse `baseContractEmail()`. Do not duplicate the full email shell. The recipient completion email says that the attached PDF is the completed copy; the owner email identifies signer name, signer email, project, and signed time.

- [ ] **Step 3: Generate the completed NDA PDF after signing**

Extend the signing query with `document_type` and `project_name`. After the signature and status/token updates succeed, and only for `document_type='nda'`:

```ts
const pdf = await contractPdfBuffer({
  title: result.contract.title,
  recipientName: result.contract.recipient_name,
  recipientEmail: result.contract.recipient_email,
  contractHtml: snapshotHtml,
  signature: {
    signer_name: signerName,
    signer_email: result.contract.recipient_email,
    signed_at: signedAt,
    ip_address: ipAddress,
    consent_text: consentText,
  },
});
const attachment = {
  filename: `${safeContractFilename(result.contract.title)}-signed.pdf`,
  content: pdf.toString('base64'),
};
```

Await recipient and owner sends with `Promise.allSettled()`, log rejected sends, and never roll back the stored signature. Existing agreement notification behavior remains unchanged.

- [ ] **Step 4: Confirm NDA payment exclusion in the signing response**

Return `payment_required=false` for NDA regardless of any legacy payment values.

- [ ] **Step 5: Run tests and focused lint**

Run:

```bash
bun run test src/__tests__/unit/contracts.test.ts
bun run lint -- src/lib/email/templates/contracts.ts src/app/api/contracts/sign/[token]/route.ts src/app/api/admin/contracts/[id]/pdf/route.ts
```

Expected: PASS.

- [ ] **Step 6: Commit completion delivery**

```bash
git add src/lib/email/templates/contracts.ts src/app/api/contracts/sign/[token]/route.ts src/app/api/admin/contracts/[id]/pdf/route.ts src/__tests__/unit/contracts.test.ts
git commit -m "feat: email completed NDA copies"
```

---

### Task 5: NDA Composer And Share Result

**Files:**
- Modify: `src/app/(admin)/admin/contracts/new/page.tsx`
- Modify: `src/app/(admin)/admin/contracts/ContractComposerClient.tsx`

**Interfaces:**
- Consumes: document-type templates and Task 2 WhatsApp helper
- Produces: direct `/admin/contracts/new?type=nda` entry
- Produces: email send and manual-link creation actions

- [ ] **Step 1: Add the NDA document choice**

Add an NDA card with `ShieldCheck`. Keep Employee, Contractor, and Client cards labelled as agreements. Initialise from `searchParams.type`, with NDA selected when it equals `nda`.

- [ ] **Step 2: Add NDA metadata fields**

Show phone, relationship, company, and project name only for NDA. Synchronise recipient name/email/phone/relationship/project name into template `values` keys so the live preview and stored columns cannot diverge. Project purpose, effective date, and confidentiality term remain clickable template fields.

- [ ] **Step 3: Add distinct delivery actions**

For NDA, provide:

- `Save Draft`
- `Create Link` using `{ delivery_method: 'link' }`
- `Email & Create Link` using `{ delivery_method: 'email' }`

On success, show a dialog containing the secure URL, `Copy Link`, and `Share on WhatsApp`. If `email_sent=false`, show a warning toast with `email_error` while retaining the share dialog.

- [ ] **Step 4: Preserve agreement behavior**

Existing modes retain Save Draft, Preview, and Send. Fix the duplicate nested `<div className="flex gap-2">` encountered in the current composer while editing that action section.

- [ ] **Step 5: Run focused lint and build type checking**

Run:

```bash
bun run lint -- src/app/(admin)/admin/contracts/new/page.tsx src/app/(admin)/admin/contracts/ContractComposerClient.tsx
bun run build
```

Expected: PASS.

- [ ] **Step 6: Commit composer UI**

```bash
git add src/app/(admin)/admin/contracts/new/page.tsx src/app/(admin)/admin/contracts/ContractComposerClient.tsx
git commit -m "feat: add NDA composer and sharing"
```

---

### Task 6: NDA Dashboard, Detail Actions, And Public Copy

**Files:**
- Modify: `src/app/(admin)/admin/contracts/page.tsx`
- Modify: `src/app/(admin)/admin/contracts/ContractsAdminClient.tsx`
- Modify: `src/app/(admin)/admin/contracts/[id]/page.tsx`
- Modify: `src/app/(admin)/admin/contracts/[id]/ContractDetailClient.tsx`
- Modify: `src/app/contracts/sign/[token]/SignContractClient.tsx`
- Modify: `src/app/(admin)/admin/contracts/templates/TemplatesClient.tsx`

**Interfaces:**
- Consumes: NDA metadata, current token, `contractSigningUrl()`, and `buildNdaWhatsAppUrl()`
- Produces: All/Agreements/NDAs filtering and NDA detail/share actions

- [ ] **Step 1: Extend list queries and row types**

Select `document_type`, `recipient_phone`, `recipient_relationship`, `recipient_company`, and `project_name`. Add document-type filter buttons/tabs and show project plus relationship on NDA rows. Change the CTA to `New Document` and offer direct Agreement and NDA links.

- [ ] **Step 2: Add NDA-aware metrics**

Show Total, Signed, and Awaiting Signature for an NDA-filtered list. Preserve Pending Payment as an agreement-only metric.

- [ ] **Step 3: Add NDA detail actions**

Type the token row with its `token`. For an active unsigned NDA, show Copy Link, Share on WhatsApp, Resend Email, and Cancel/Revoke. Hide all payment cards/actions. Continue showing the PDF button, immutable preview, token history, and signature proof.

- [ ] **Step 4: Make signer copy document-aware**

Extend `PublicContract` with `document_type` and `project_name`. NDA pages say `Non-Disclosure Agreement for review`, identify the project, use `Submit NDA Signature`, and never render payment controls.

- [ ] **Step 5: Permit NDA template management**

Include NDA in template modes and visibly label its legal-review state. Do not automatically activate the seeded draft template.

- [ ] **Step 6: Run focused lint**

Run:

```bash
bun run lint -- src/app/(admin)/admin/contracts/page.tsx src/app/(admin)/admin/contracts/ContractsAdminClient.tsx src/app/(admin)/admin/contracts/[id]/page.tsx src/app/(admin)/admin/contracts/[id]/ContractDetailClient.tsx src/app/contracts/sign/[token]/SignContractClient.tsx src/app/(admin)/admin/contracts/templates/TemplatesClient.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit dashboard and signer UX**

```bash
git add src/app/(admin)/admin/contracts src/app/contracts/sign/[token]/SignContractClient.tsx
git commit -m "feat: add NDA dashboard and signing UX"
```

---

### Task 7: Documentation And Full Verification

**Files:**
- Modify: `docs/platform/database-schema.md`
- Modify: `docs/platform/email-templates.md`
- Modify: `docs/modules/contracts-2026-06-28-handoff.md`

**Interfaces:**
- Documents: schema columns, NDA lifecycle, manual WhatsApp sharing, emails, legal-review gate, and routes.

- [ ] **Step 1: Update platform documentation**

Document the new columns, `nda` mode, `agreement|nda` classification, the universal template, and the fact that NDA payment is always `not_required`.

- [ ] **Step 2: Update email documentation**

Add NDA signature request and completed-copy emails, including PDF attachment behavior and failure handling.

- [ ] **Step 3: Update the Contracts handoff**

Add NDA routes, new actions, migration name, and the production legal-review requirement.

- [ ] **Step 4: Run migration and placeholder sanity checks**

Run:

```bash
rg -n "Aorthar One-Way Project NDA|survive permanently|prior written permission" supabase/migrations/20260718151541_nda_inside_contracts.sql
rg -n "T[B]D|T[O]DO|implement[[:space:]]+later|fill[[:space:]]+in[[:space:]]+details" docs/superpowers/plans/2026-07-18-nda-inside-contracts.md
```

Expected: the migration search finds the template clauses; the placeholder scan returns no output.

- [ ] **Step 5: Run full verification**

```bash
bun run test src/__tests__/unit/contracts.test.ts
bun run lint
bun run build
```

Expected: all commands exit 0. If unrelated dirty Checkly work causes a failure, rerun focused checks and report the unrelated blocker with the exact file and error.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD~1
```

Expected: no whitespace errors; only NDA work plus the user's pre-existing local changes appear.

- [ ] **Step 7: Commit documentation and verification state**

```bash
git add docs/platform/database-schema.md docs/platform/email-templates.md docs/modules/contracts-2026-06-28-handoff.md
git commit -m "docs: document NDA contracts workflow"
```

---

## Acceptance Checklist

- [ ] An admin can create an NDA draft inside Contracts.
- [ ] Required recipient identity includes name, email, and phone/WhatsApp number.
- [ ] Required project identity includes project name, purpose, effective date, and confidentiality term.
- [ ] Email delivery and link-only delivery return the same secure signing URL.
- [ ] The admin can copy the URL or open a prepared manual WhatsApp message.
- [ ] The recipient can read and sign without an Aorthar account.
- [ ] A signed NDA cannot be signed again.
- [ ] The immutable snapshot contains the permanent no-posting/no-portfolio restriction.
- [ ] The recipient and Aorthar receive the same completed PDF.
- [ ] The dashboard retains the PDF, signature proof, and token history.
- [ ] NDA documents never show or create payment controls.
- [ ] Existing agreements continue to create, send, sign, pay, and export as before.
- [ ] The seeded NDA template remains draft until qualified Nigerian counsel approves activation.
