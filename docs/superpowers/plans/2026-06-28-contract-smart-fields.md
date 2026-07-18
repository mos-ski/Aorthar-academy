# Contract Smart Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make contract drafting faster and safer with smart placeholder inputs, reusable saved values, richer long-form fields, Helvetica document rendering, and a review-first public signing page.

**Architecture:** Keep the current contract module intact and add a small field intelligence layer in `src/lib/contracts`. Store reusable admin field values in the existing `site_settings` table to avoid requiring another production migration. Render normal fields as escaped text, render admin-entered rich contract sections as controlled rich HTML, and block sending when any placeholder in the template remains empty.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Tiptap RichTextEditor, shadcn/ui, Vitest, Bun.

## Global Constraints

- Use `bun`, not `npm` or `pnpm`.
- Use absolute imports with `@/`.
- Run `bun run build` after significant changes.
- Do not revert unrelated dirty files.
- Contract document body should use Helvetica/Arial; signature preview should use a handwriting-style font only.
- Public signer should review the agreement first, then proceed to signature.
- Sending must be blocked when important placeholders are empty.

---

### Task 1: Placeholder Safety and Rich Rendering

**Files:**
- Modify: `src/lib/contracts/placeholders.ts`
- Modify: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Produces: `findMissingContractFields(html, fields, values)` for send blocking.
- Produces: `renderContractHtml(html, values, fields?)` with rich HTML support for `long_text` fields.

- [ ] **Step 1: Write failing tests** for missing placeholders not registered in `contract_template_fields`, escaped text fields, and rich `long_text` rendering.
- [ ] **Step 2: Run** `bun run test src/__tests__/unit/contracts.test.ts` and verify the new tests fail.
- [ ] **Step 3: Implement** placeholder discovery, missing-field merging, and field-aware rich rendering.
- [ ] **Step 4: Re-run** `bun run test src/__tests__/unit/contracts.test.ts`.

### Task 2: Smart Field Suggestions

**Files:**
- Create: `src/lib/contracts/field-suggestions.ts`
- Modify: `src/__tests__/unit/contracts.test.ts`

**Interfaces:**
- Produces: `getContractFieldSuggestions(field)` returning quick-fill strings based on field key, label, and type.
- Produces: `shouldUseRichContractInput(field)` and `suggestContractFieldType(key, label)`.

- [ ] **Step 1: Write failing tests** for duration dropdown values, Aorthar company defaults, and rich-field detection for responsibilities/deliverables.
- [ ] **Step 2: Run** `bun run test src/__tests__/unit/contracts.test.ts` and verify failures.
- [ ] **Step 3: Implement** the helper with conservative pattern matching.
- [ ] **Step 4: Re-run** the contract unit tests.

### Task 3: Saved Contract Field Memory API

**Files:**
- Create: `src/app/api/admin/contracts/field-values/route.ts`

**Interfaces:**
- `GET /api/admin/contracts/field-values?field_key=...` returns `{ values: string[] }`.
- `POST /api/admin/contracts/field-values` accepts `{ field_key: string; value: string }` and persists the value in `site_settings.contract_saved_field_values`.

- [ ] **Step 1: Implement** the small API using `requireAdminApi('finance')` and `createAdminClient()`.
- [ ] **Step 2: Keep values unique** and most-recent-first, capped at 12 values per field.

### Task 4: Admin Composer UX

**Files:**
- Modify: `src/app/(admin)/admin/contracts/ContractComposerClient.tsx`

**Interfaces:**
- Consumes: helpers from `src/lib/contracts/field-suggestions.ts`.
- Consumes: field memory API from Task 3.

- [ ] **Step 1: Merge unknown placeholders** into the field list as required smart fields.
- [ ] **Step 2: Replace plain long text with `RichTextEditor`** for rich fields.
- [ ] **Step 3: Add quick-fill chips** for suggestions and saved values.
- [ ] **Step 4: Add a “save for next time” checkbox** in the field modal.
- [ ] **Step 5: Make send errors show missing field names** returned from the API.
- [ ] **Step 6: Render preview in Helvetica/Arial.**

### Task 5: Send Route Enforcement

**Files:**
- Modify: `src/app/api/admin/contracts/[id]/send/route.ts`

**Interfaces:**
- Consumes: `findMissingContractFields` and field-aware `renderContractHtml`.

- [ ] **Step 1: Block send** if any template placeholder lacks a value, even if the field was not registered.
- [ ] **Step 2: Render long text as rich contract content.**

### Task 6: Public Signing Review Page

**Files:**
- Modify: `src/app/contracts/sign/[token]/SignContractClient.tsx`

**Interfaces:**
- Keeps current token and payment flows unchanged.

- [ ] **Step 1: Make the agreement the first visual focus** with a page-like Helvetica document.
- [ ] **Step 2: Hide signature controls behind a “Proceed to signature” action** after review.
- [ ] **Step 3: Use handwriting-style font for signature preview only.**

### Task 7: Verification and Deploy

**Files:**
- No source edits unless verification finds a bug.

- [ ] **Step 1: Run** `bun run test src/__tests__/unit/contracts.test.ts`.
- [ ] **Step 2: Run focused lint** for changed contract files if feasible.
- [ ] **Step 3: Run** `bun run build`.
- [ ] **Step 4: Commit, push, and deploy to production Vercel.**
