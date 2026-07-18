# Contacts Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only admin Contacts module with unified contact data and CSV/Excel-compatible exports.

**Architecture:** Add a Supabase SQL view that deduplicates existing product records into `admin_contacts`. Build server-side admin utilities that apply shared filters for the page and export endpoints. Add a compact admin UI under `/admin/contacts` and sidebar navigation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Tailwind CSS v4, shadcn/ui, Lucide icons, Vitest where useful.

## Global Constraints

- Package manager is `bun`; do not use `npm` or `pnpm`.
- Contacts is read-only; do not add import, manual editing, or manual tagging.
- Use admin-only server access for contact data and exports.
- CSV and Excel-compatible export must share the same filters as the UI.
- Run `bun run lint` and `bun run build` before reporting completion.

---

### Task 1: Database View

**Files:**
- Create: `supabase/migrations/<generated>_contacts_module.sql`

**Interfaces:**
- Produces: `public.admin_contacts` view with `contact_key`, `first_name`, `last_name`, `full_name`, `email`, `phone`, `sources`, `tags`, `source_count`, `created_at`, `last_seen_at`.

- [ ] **Step 1: Create migration file**

Run: `supabase migration new contacts_module`

- [ ] **Step 2: Add SQL view**

Create helper CTEs for each source, normalize email with `lower(trim(email))`, split names from `full_name`, aggregate `sources` and `tags` with `array_agg(distinct ...)`, and group by normalized email or source-specific fallback key.

- [ ] **Step 3: Verify SQL shape**

Run: `rg -n "admin_contacts|CREATE OR REPLACE VIEW" supabase/migrations`

Expected: the new migration defines `admin_contacts`.

### Task 2: Contact Utilities And Tests

**Files:**
- Create: `src/lib/admin/contacts.ts`
- Create: `src/lib/admin/contacts.test.ts`

**Interfaces:**
- Produces: `type ContactRow`
- Produces: `type ContactFilters`
- Produces: `filterContactsForExport(rows: ContactRow[], filters: ContactFilters): ContactRow[]`
- Produces: `contactsToCsv(rows: ContactRow[]): string`
- Produces: `contactsToExcelXml(rows: ContactRow[]): string`

- [ ] **Step 1: Write tests first**

Test that filtering matches search/source, CSV escapes commas and quotes, and Excel XML escapes special characters.

- [ ] **Step 2: Run tests to verify red**

Run: `bun run test src/lib/admin/contacts.test.ts`

Expected: FAIL because the module does not exist yet.

- [ ] **Step 3: Implement utilities**

Add TypeScript helpers for normalized filtering and export serialization.

- [ ] **Step 4: Run tests to verify green**

Run: `bun run test src/lib/admin/contacts.test.ts`

Expected: PASS.

### Task 3: Admin Contacts Page

**Files:**
- Create: `src/app/(admin)/admin/contacts/page.tsx`
- Create: `src/app/(admin)/admin/contacts/ContactsClient.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `ContactRow`, `filterContactsForExport`

- [ ] **Step 1: Add server page**

Fetch `admin_contacts` with `createAdminClient()`, apply query-string filters, compute source counts, and render the client table.

- [ ] **Step 2: Add client table**

Build search, source filter, export buttons, summary cards, and table.

- [ ] **Step 3: Add sidebar entry**

Add Contacts as a primary admin module with `Users` icon and active-path detection for `/admin/contacts`.

### Task 4: Export API

**Files:**
- Create: `src/app/api/admin/contacts/export/route.ts`

**Interfaces:**
- Consumes: `contactsToCsv`, `contactsToExcelXml`, `filterContactsForExport`

- [ ] **Step 1: Add admin-only route**

Require admin role, read `format`, `q`, and `source`, fetch `admin_contacts`, apply filters, and return CSV or Excel-compatible XML.

- [ ] **Step 2: Verify response headers**

CSV uses `text/csv; charset=utf-8` and `.csv` filename. Excel uses `application/vnd.ms-excel; charset=utf-8` and `.xls` filename.

### Task 5: Verification

**Files:**
- Verify all changed source files.

- [ ] **Step 1: Run focused tests**

Run: `bun run test src/lib/admin/contacts.test.ts`

- [ ] **Step 2: Run lint**

Run: `bun run lint`

- [ ] **Step 3: Run build**

Run: `bun run build`

- [ ] **Step 4: Review changed files**

Run: `git diff --stat` and `git diff --check`
