# Task 1 Report: Database Migration

## Status

Complete.

## Changes

- Added `supabase/migrations/20260726000000_studio_case_studies.sql` with the two Studio case study tables, indexes, updated-at triggers, RLS, published-only public read policies, and admin management policies from the task brief.
- Added `Studio Tables` documentation for `studio_case_studies` and `studio_case_study_blocks` to `docs/platform/database-schema.md`.
- Added the Studio management section, including the Work route, to `docs/products/_shared/04-admin-cms.md`.

No TypeScript helpers, public pages, admin routes, UI, or file-upload behavior were added.

## Verification

Commands run:

```text
awk '/^```sql$/{capture=1; next} capture && /^```$/{exit} capture{print}' .superpowers/sdd/2026-07-26-studio-case-studies/task-1-brief.md | diff -u - supabase/migrations/20260726000000_studio_case_studies.sql
rg -n "studio_case_studies|studio_case_study_blocks" supabase/migrations docs/platform/database-schema.md docs/products/_shared/04-admin-cms.md
git diff --check
```

Results:

- Migration content matched the SQL in the brief exactly.
- Both table names appear in the migration and database schema documentation. The required reference check completed successfully.
- No whitespace errors were reported.

## Concerns

- No concerns identified for Task 1.

## Review Fix

The review identified that the original admin policies checked only `profiles.role = 'admin'`, which also allowed finance admins to manage case studies. Updated both the case study and block management policies, including their `using` and `with check` clauses, to require `COALESCE(profiles.admin_level, 'super_admin') IN ('super_admin', 'content_admin')`. Finance admins are now excluded from both tables while legacy admin rows with a null level retain super-admin behavior.

Follow-up verification:

- Confirmed all four management policy predicates include the restricted admin-level condition.
- Confirmed the public policies remain published-only.
- `git diff --check` completed without errors.
