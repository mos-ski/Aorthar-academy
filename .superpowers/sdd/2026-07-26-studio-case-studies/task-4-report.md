# Task 4 Report: Admin API Routes And Permission Mapping

## Completed

- Mapped `/admin/studio/work` and `/api/admin/studio/case-studies` to the `content` permission group. Super admins and content admins can manage case studies; finance admins are denied by `requireAdminApi('content')`.
- Added guarded list and create endpoints at `/api/admin/studio/case-studies`. Creation normalizes the supplied slug (or title fallback), creates a draft, records the creating/updating admin, and returns the new `{ id }`.
- Added guarded detail, patch, and delete endpoints at `/api/admin/studio/case-studies/[id]`. Detail responses include ordered blocks. Patches support the documented overview, media, metadata, SEO, status, ordering, and featured fields.
- Publishing fetches the current block count and applies `validateCaseStudyPublish`, returning the first issue and the full issue list with HTTP 400 when the study is incomplete. A successful first publish sets `published_at`.
- Deleting a published study archives it; deleting a draft or archived study removes it.
- Added guarded block create, update, delete, and reorder endpoints. Block types are constrained to the six supported structured types, block content must be an object, and update/delete/reorder operations are scoped to the case study ID. New blocks receive the next `sort_order`; reorder writes zero-based indexes.

## Verification

- `bun run test src/__tests__/unit/studio-case-studies.test.ts` - passed: 1 file, 4 tests.
- `bunx eslint src/lib/admin/permissions.ts src/app/api/admin/studio/case-studies` - passed.
- `git diff --cached --check` - passed.
- `bun run lint` - blocked by 54 pre-existing errors in unrelated scripts and application pages. It reported no errors in the new Studio API routes or permission mapping.

## Scope

This task adds no admin pages, list UI, editor UI, freeform JSON editing surface, or upload functionality. Case-study media remains external URL based.

## Review Fixes

- Publishing now validates the effective pending values with an own-property lookup. Explicit `null` updates are no longer replaced by the persisted value during validation, so publishing with `cover_url: null` correctly returns the required-cover error instead of clearing the cover on a published study.
- Reordering now rejects duplicate IDs, reads the complete persisted block set for the case study, and requires `orderedIds` to be an exact unique match. The validated ordering is applied with one `upsert` statement, so the write is atomic rather than a series of independently successful updates.

## Review Fix Verification

- `bun run test src/__tests__/integration/api/admin-studio-case-studies.test.ts src/__tests__/unit/studio-case-studies.test.ts` - passed: 2 files, 7 tests.
- `bunx eslint src/app/api/admin/studio/case-studies/[id]/route.ts src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts src/__tests__/integration/api/admin-studio-case-studies.test.ts` - passed.
- `git diff --check` - passed.

## Review Fix Round 2

- Reorder validation now reads only block IDs and retains the required exact, unique set check.
- Reordering updates only `sort_order` through case-study-scoped per-row updates. It no longer writes the stale `type` or `content` snapshot, so concurrent edits cannot be overwritten and a concurrently deleted block cannot be recreated.
- Atomicity tradeoff: without a database RPC that performs a multi-row, sort-order-only update, PostgREST cannot make these distinct updates transactional. The route therefore favors data safety over all-or-nothing ordering. A later update failure can leave a partially reordered sequence, but it cannot overwrite content or recreate deleted blocks; a subsequent complete reorder restores the requested order.

## Review Fix Round 2 Verification

- `bun run test src/__tests__/integration/api/admin-studio-case-studies.test.ts src/__tests__/unit/studio-case-studies.test.ts` - passed: 2 files, 7 tests.
- `bunx eslint src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts src/__tests__/integration/api/admin-studio-case-studies.test.ts` - passed.
- `git diff --check` - passed.

## Review Fix Round 3

- Added `reorder_studio_case_study_blocks(p_case_study_id uuid, p_ordered_ids uuid[])` in a forward migration. The function locks the parent case study and its blocks, verifies that the submitted UUID array is exactly the current block ID set (including duplicate detection), and updates only `sort_order` in one transaction.
- The admin route now makes one `createAdminClient().rpc('reorder_studio_case_study_blocks', ...)` call. It retains request-shape and duplicate-ID checks, maps set-validation failures to HTTP 400, and no longer performs a stale full-row upsert or independent updates.
- RPC execution is revoked from public roles and granted only to `service_role`, matching the API's `createAdminClient()` write path.

## Review Fix Round 3 Verification

- `bun run test src/__tests__/integration/api/admin-studio-case-studies.test.ts src/__tests__/unit/studio-case-studies.test.ts` - passed: 2 files, 7 tests.
- `bunx eslint src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts src/__tests__/integration/api/admin-studio-case-studies.test.ts` - passed.
- The reorder regression asserts that a valid request delegates to the single atomic RPC with the case-study ID and full ordered block ID array.
- `git diff --check` - passed.
