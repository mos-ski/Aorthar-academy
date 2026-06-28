# Contracts Module Handoff - 2026-06-28

This note captures today’s Contracts module work so we can continue without re-discovering the flow.

## Production State

- Live URL: https://aorthar.com
- Branch: `codex/contracts-module`
- Latest deployed commit: `4f26119 feat: add contract detail actions`
- Supabase migration for the base contracts module was already applied by Moski before the later UI/API refinements.

## What Was Built

- Added the admin Contracts module with:
  - Contracts list
  - New Contract composer
  - Contract detail page
  - Template management
  - Public signing page
- Added three contract modes:
  - Employee
  - Contractor
  - Client
- Added default templates based on the supplied sample PDFs:
  - Client contract/invoice sample
  - Employee offer/engagement sample
  - Contractor template derived from the same contract structure
- Added secure signing links with 7-day expiry and resend support.
- Added typed signature capture with handwriting-style signature preview.
- Added signed email notification to the contact email from settings.
- Added Paystack payment option after client signature, with pay-now/pay-later flow.
- Added manual payment marking from admin.
- Added real PDF generation and native PDF preview.
- Added contract duplicate/delete/preview actions on contract detail.

## Current UX Decisions

- Contract body uses Helvetica/Arial.
- Only the signature preview/proof uses handwriting-style fonts.
- Public signing page is review-first: agreement appears first, signature comes after.
- Draft composer fields are clickable placeholder chips inside the agreement preview.
- Empty placeholders always show as unfilled, whether required or optional.
- Suggestions show as simple lemon text under the field/editor.
- Rich text is used for long contract fields such as responsibilities, deliverables, duties, scope, and milestones.
- Reusable saved field values are stored in `site_settings` under `contract_saved_field_values`; no extra migration was added for that.

## Important Routes

- Admin list: `/admin/contracts`
- New contract: `/admin/contracts/new`
- Contract detail: `/admin/contracts/[id]`
- Templates: `/admin/contracts/templates`
- Public signing: `/contracts/sign/[token]`

## Important API Routes

- `GET /api/admin/contracts`
- `POST /api/admin/contracts`
- `GET /api/admin/contracts/[id]`
- `PATCH /api/admin/contracts/[id]`
- `DELETE /api/admin/contracts/[id]`
- `POST /api/admin/contracts/[id]/send`
- `POST /api/admin/contracts/[id]/resend`
- `POST /api/admin/contracts/[id]/duplicate`
- `GET /api/admin/contracts/[id]/pdf`
- `POST /api/admin/contracts/preview-pdf`
- `GET /api/admin/contracts/field-values`
- `POST /api/admin/contracts/field-values`
- `GET /api/contracts/sign/[token]`
- `POST /api/contracts/sign/[token]`
- `POST /api/contracts/paystack/checkout`
- `GET /api/contracts/paystack/verify`

## Key Files

- `src/app/(admin)/admin/contracts/ContractComposerClient.tsx`
- `src/app/(admin)/admin/contracts/[id]/ContractDetailClient.tsx`
- `src/app/(admin)/admin/contracts/templates/TemplatesClient.tsx`
- `src/app/contracts/sign/[token]/SignContractClient.tsx`
- `src/lib/contracts/placeholders.ts`
- `src/lib/contracts/field-state.ts`
- `src/lib/contracts/field-suggestions.ts`
- `src/lib/contracts/pdf.ts`
- `src/lib/email/templates/contracts.ts`
- `supabase/migrations/20260628010000_contracts_module.sql`
- `supabase/migrations/20260628020000_update_contract_default_templates.sql`

## Verification Used Today

- `bun run test src/__tests__/unit/contracts.test.ts`
- Focused `bun run lint -- ...` on changed contract files
- `bun run build`
- Vercel production deploys using `vercel --prod --yes`

## Known Local Noise

These files were already dirty/untracked locally and were intentionally not committed:

- `.qwen/settings.json`
- `.qwen/settings.json.orig`
- `supabase/.temp/cli-latest`
- `.superpowers/`

## Suggested Next Review

- Review the contract composer end-to-end on production.
- Check whether the PDF rendering spacing needs brand polish.
- Decide if duplicate should keep recipient/payment data or start recipient fields blank.
- Decide if delete should be soft-delete/cancel instead of permanent delete.
- Review email copy against the exact preferred Aorthar email style.
