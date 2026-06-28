# Contracts Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin Contracts module with editable rich text templates, clickable fields, public token signing, email notifications, Paystack/manual payment tracking, and admin PDF download.

**Architecture:** Store templates, field definitions, contracts, signing tokens, signatures, and payments in Supabase tables. Keep contract rendering/token/payment decisions in focused `src/lib/contracts/*` modules with Vitest coverage, then wire them into admin and public Next.js routes. Use server routes/actions for all database writes and token validation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Bun, Tailwind CSS v4, shadcn/ui, Tiptap RichTextEditor, Supabase, Resend email helper, Paystack helper, Vitest.

## Global Constraints

- Package manager is `bun`; do not use `npm` or `pnpm`.
- Admin routes live under `/admin`; public signer route is `/contracts/sign/[token]`.
- Contracts are visible to super admins and finance admins in v1; content admins do not see the module.
- Signing links expire after 7 days.
- Drafts may have missing fields; sending is blocked until all required fields are filled.
- Signed contracts use immutable rendered snapshots, not current template content.
- Signed-contract notification email goes to `site_settings.contact_email`.
- Run `bun run test`, `bun run lint`, and `bun run build` before completion.

---

### Task 1: Contract Core Library And Tests

**Files:**
- Create: `src/lib/contracts/types.ts`
- Create: `src/lib/contracts/placeholders.ts`
- Create: `src/lib/contracts/tokens.ts`
- Create: `src/lib/contracts/payments.ts`
- Create: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Produces `extractPlaceholderKeys(html: string): string[]`
- Produces `renderContractHtml(html: string, values: Record<string, string>): string`
- Produces `findMissingRequiredFields(fields: ContractTemplateField[], values: Record<string, string>): ContractTemplateField[]`
- Produces `createTokenExpiry(now?: Date): Date`
- Produces `isTokenExpired(expiresAt: string, now?: Date): boolean`
- Produces `nextPaymentStatus(input: ContractPaymentInput): ContractPaymentStatus`

- [ ] Write failing Vitest tests for placeholder extraction, required field completeness, 7-day token expiry, and payment status transitions.
- [ ] Run `bun run test src/__tests__/unit/contracts.test.ts`; expected failure because files/functions do not exist.
- [ ] Implement the focused contract library modules.
- [ ] Run `bun run test src/__tests__/unit/contracts.test.ts`; expected pass.
- [ ] Commit with `feat: add contract core utilities`.

### Task 2: Database Migration And Seed Defaults

**Files:**
- Create: `supabase/migrations/20260628010000_contracts_module.sql`

**Interfaces:**
- Produces tables `contract_templates`, `contract_template_fields`, `contracts`, `contract_field_values`, `contract_signing_tokens`, `contract_signatures`, `contract_payments`.
- Produces enums/checks for contract modes and statuses.
- Produces three active default templates: employee, contractor, client.

- [ ] Write migration with tables, indexes, RLS, admin policies, token history, and default templates/fields.
- [ ] Validate SQL with `bun run build` later; no local Supabase requirement for this task.
- [ ] Commit with `feat: add contracts database schema`.

### Task 3: Email Templates And URL Helpers

**Files:**
- Modify: `src/lib/urls.ts`
- Create: `src/lib/email/templates/contracts.ts`

**Interfaces:**
- Produces `contractSigningUrl(token: string): string`
- Produces `contractSigningRequestSubject(contractTitle: string): string`
- Produces `contractSigningRequestHtml(data: ContractSigningRequestEmailData): string`
- Produces `contractSignedNotificationSubject(contractTitle: string): string`
- Produces `contractSignedNotificationHtml(data: ContractSignedNotificationEmailData): string`

- [ ] Write email template functions using existing HTML email style.
- [ ] Add URL helper for public signing link.
- [ ] Commit with `feat: add contract email templates`.

### Task 4: Admin API Routes

**Files:**
- Create: `src/app/api/admin/contracts/route.ts`
- Create: `src/app/api/admin/contracts/[id]/route.ts`
- Create: `src/app/api/admin/contracts/[id]/send/route.ts`
- Create: `src/app/api/admin/contracts/[id]/resend/route.ts`
- Create: `src/app/api/admin/contracts/[id]/manual-payment/route.ts`
- Create: `src/app/api/admin/contract-templates/route.ts`
- Create: `src/app/api/admin/contract-templates/[id]/route.ts`

**Interfaces:**
- Consumes Task 1 utilities, Task 2 tables, Task 3 email templates.
- Produces JSON APIs for template CRUD, contract draft save, send, resend, and manual payment.

- [ ] Implement permission guard using `requireAdminApi('finance')`.
- [ ] Validate inputs with Zod-style checks or explicit structured validation.
- [ ] Send/resend creates fresh 7-day tokens and emails recipient.
- [ ] Manual payment marks client contract paid and records amount/method/reference/date.
- [ ] Commit with `feat: add contract admin APIs`.

### Task 5: Public Signing And Payment APIs

**Files:**
- Create: `src/app/api/contracts/sign/[token]/route.ts`
- Create: `src/app/api/contracts/paystack/checkout/route.ts`
- Create: `src/app/api/contracts/paystack/verify/route.ts`
- Modify: `src/app/api/webhooks/paystack/route.ts`

**Interfaces:**
- Consumes Task 1 token/payment helpers and Task 3 signed notification email.
- Produces public token signing endpoint and Paystack checkout/verify endpoints.

- [ ] Validate token server-side and reject expired/revoked/signed tokens.
- [ ] Store signature proof with typed name, email, timestamp, IP, user agent, consent version, token id, and snapshot.
- [ ] Send signed notification email to `site_settings.contact_email`.
- [ ] Initialize Paystack after signing for client contracts with payment pending.
- [ ] Verify Paystack references and update `contract_payments`.
- [ ] Extend webhook to handle metadata type `contract_payment`.
- [ ] Commit with `feat: add contract signing and payment APIs`.

### Task 6: Admin Sidebar And Pages

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/lib/admin/permissions.ts`
- Create: `src/app/(admin)/admin/contracts/page.tsx`
- Create: `src/app/(admin)/admin/contracts/ContractsAdminClient.tsx`
- Create: `src/app/(admin)/admin/contracts/new/page.tsx`
- Create: `src/app/(admin)/admin/contracts/ContractComposerClient.tsx`
- Create: `src/app/(admin)/admin/contracts/[id]/page.tsx`
- Create: `src/app/(admin)/admin/contracts/[id]/ContractDetailClient.tsx`
- Create: `src/app/(admin)/admin/contracts/templates/page.tsx`
- Create: `src/app/(admin)/admin/contracts/templates/TemplatesClient.tsx`

**Interfaces:**
- Consumes admin APIs and tables.
- Produces Contracts sidebar module, list, composer, detail, and template manager.

- [ ] Add Contracts module visible only to super admin and finance admin.
- [ ] Build list page with status/payment filters and New Contract action.
- [ ] Build mode cards for Employee, Contractor, Client.
- [ ] Build rich text template manager with placeholder field definitions.
- [ ] Build composer with clickable placeholder chips that open edit modal.
- [ ] Block Send until required placeholders and recipient email are complete.
- [ ] Build detail page with resend, manual payment, PDF download link, and audit proof.
- [ ] Commit with `feat: add contracts admin UI`.

### Task 7: Public Signing Page And PDF Download

**Files:**
- Create: `src/app/contracts/sign/[token]/page.tsx`
- Create: `src/app/contracts/sign/[token]/SignContractClient.tsx`
- Create: `src/app/api/admin/contracts/[id]/pdf/route.ts`

**Interfaces:**
- Consumes public signing API and stored snapshots.
- Produces public signing page and admin PDF download route.

- [ ] Render contract snapshot and signing form.
- [ ] Show typed full name in signature-style font.
- [ ] Require consent checkbox before submit.
- [ ] After signature, show Paystack/manual payment choices for client payment contracts.
- [ ] Generate a printable HTML/PDF response for admin download from stored snapshot and signature proof.
- [ ] Commit with `feat: add contract signing page and PDF export`.

### Task 8: Verification And Deployment Readiness

**Files:**
- Modify only files required by failing verification.

**Interfaces:**
- Consumes all previous tasks.
- Produces verified implementation ready for Vercel auto-deploy or manual deployment.

- [ ] Run `bun run test`.
- [ ] Run `bun run lint`.
- [ ] Run `bun run build`.
- [ ] Fix failures using the systematic debugging workflow if needed.
- [ ] Commit fixes with focused messages.
- [ ] Report commit SHA and local verification results; if deployment status is available, report Vercel live URL/status.
