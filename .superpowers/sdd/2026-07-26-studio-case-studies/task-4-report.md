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
