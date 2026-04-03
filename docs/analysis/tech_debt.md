# Technical Debt Analysis — Aorthar Academy

---

## Structural Issues

| ID | Issue | Location | Severity | Fix |
|----|-------|----------|----------|-----|
| TD-01 | **Triple purchase recording paths** — `standalone_purchases` can be recorded via: (1) `/api/standalone/verify-payment`, (2) `/api/webhooks/paystack`, (3) `/courses-app/learn/[slug]/page.tsx`. This creates maintenance burden and subtle inconsistency risks. | Standalone checkout | High | Consolidate to single recording function; use webhook as primary, redirect as fallback |
| TD-02 | ~~**Duplicate university pages** — `/university/*` routes exist alongside `(dashboard)` routes.~~ | Resolved | ✅ Fixed | Removed `/university/*` routes; all university links now point to `university.aorthar.com` subdomain |
| TD-03 | ~~**Typo in route** — `univeristy/transaction` (missing 's') exists as a separate page.~~ | Resolved | ✅ Fixed | Removed `/univeristy/*` route and proxy redirect; all links now use `university.aorthar.com` |
| TD-04 | **Inconsistent timestamp columns** — `standalone_purchases` uses `purchased_at`, while `transactions` uses `created_at` and `paid_at`. Other tables use `created_at`. | Database schema | Medium | Standardize on `created_at` for record creation, add domain-specific timestamps as needed |
| TD-05 | **AI library misnamed** — `src/lib/ai/openai.ts` actually calls Gemini API, not OpenAI. | `src/lib/ai/openai.ts` | Low | Rename to `gemini.ts` or `ai.ts` |

## Repeated Logic

| ID | Issue | Location | Severity | Fix |
|----|-------|----------|----------|-----|
| TD-06 | **Email sending pattern repeated** — Welcome, password reset, and purchase confirmation emails each have their own API route with similar boilerplate. | `/api/auth/send-welcome`, `/api/auth/forgot-password`, webhook | Low | Create a shared email dispatch utility |
| TD-07 | **Profile lookup pattern repeated** — `profiles` table queried with `user_id` in dozens of places. | Throughout codebase | Low | Create a `getProfileByUserId(userId)` helper |
| TD-08 | **Domain detection logic repeated** — `window.location.hostname.includes('courses.')` checked in multiple components. | Register, login, checkout pages | Low | Create a `isCoursesDomain()` utility |

## Hardcoded Values

| ID | Value | Location | Severity | Fix |
|----|-------|----------|----------|-----|
| TD-09 | Instructor name `'Adedamola Adewale'` hardcoded as default in `standalone_courses` table | Database default | Low | Move to environment variable or profiles table |
| TD-10 | Dashboard URL `'https://courses.aorthar.com'` hardcoded in email templates | Email templates | Medium | Use environment variable for base URL |
| TD-11 | Preview duration `60` seconds hardcoded in CourseWatch component | `CourseWatch.tsx` | Low | Make configurable per course |
| TD-12 | Grade scale hardcoded in `src/types/index.ts` | `GRADE_SCALE` constant | Low | Move to database or config file for flexibility |
| TD-13 | Department list hardcoded in `src/lib/academics/departments.ts` | Departments file | Medium | Consider database-driven departments for flexibility |

## State Management Issues

| ID | Issue | Location | Severity | Fix |
|----|-------|----------|----------|-----|
| TD-14 | **No global state** — All state is local component state. As the app grows, this will lead to prop drilling and redundant API calls. | Throughout | Medium | Introduce a lightweight state solution (Zustand or React Context) for user session, theme, and demo mode |
| TD-15 | **sessionStorage for checkout flow** — `sessionStorage.setItem(checkoutKey, '1')` used to prevent auto-restart of checkout. Fragile across tabs. | `checkout/[slug]/page.tsx` | Low | Consider URL-based state or cookie |

## Scalability Risks

| ID | Risk | Impact | Severity | Mitigation |
|----|------|--------|----------|------------|
| TD-16 | **No pagination on admin tables** — Users and transactions loaded with `.limit(100)`. Will break at scale. | Admin UX | Medium | Add cursor-based pagination |
| TD-17 | **No database indexing on hot query paths** — Some queries may become slow as data grows (e.g., `standalone_purchases` by `user_id`). | Performance | Medium | Verify indexes exist; add composite indexes where needed |
| TD-18 | **Fire-and-forget email sending** — Emails sent without retry or queue. If Resend is down, emails are lost. | Reliability | Medium | Add retry logic or use a queue (Upstash/SQS) |
| TD-19 | **No CDN caching for static assets** — Course thumbnails, logos served directly. | Performance | Low | Configure Vercel Image Optimization or CDN caching |
| TD-20 | **Single Edge Function for grading** — `grade-quiz` Edge Function handles all quiz grading. May become a bottleneck. | Performance | Low | Monitor execution time; consider batching |

## Security Risks

| ID | Risk | Impact | Severity | Mitigation |
|----|------|--------|----------|------------|
| TD-21 | **Admin guard disabled in development** — `NEXT_PUBLIC_APP_ENV=development` bypasses admin check. If accidentally deployed to production with this value, any user can access admin. | Access control | High | Use server-side env check, not client-side `NEXT_PUBLIC_` variable |
| TD-22 | **No rate limiting** — Auth endpoints, quiz endpoints, and API routes have no rate limiting. Brute force and abuse possible. | Security | Medium | Add rate limiting (Upstash Ratelimit or Vercel Edge Middleware) |
| TD-23 | **Paystack metadata not validated server-side** — `metadata.type`, `metadata.course_id`, `metadata.user_id` trusted from Paystack without additional validation. | Payment integrity | Medium | Add server-side validation of metadata against expected values |
| TD-24 | **No CSRF protection on forms** — Client-side forms don't have CSRF tokens. | Security | Low | Supabase handles this via session cookies, but verify |
| TD-25 | **Audit log IP address may be inaccurate behind proxy** — `ip_address` field in audit_log may show proxy IP instead of real IP. | Audit accuracy | Low | Use `x-forwarded-for` header parsing |

## Code Quality

| ID | Issue | Location | Severity | Fix |
|----|-------|----------|----------|-----|
| TD-26 | **No test coverage** — Vitest is configured but no tests exist. `bun run build` is the only correctness gate. | Entire codebase | High | Add unit tests for core logic (GPA, progression, grading) and integration tests for API routes |
| TD-27 | **Type assertions (`as unknown`)** — Used in payments page to cast Supabase join results. Fragile. | `payments/page.tsx` | Medium | Create proper TypeScript types for joined queries |
| TD-28 | **Large page components** — Some page files exceed 200 lines with mixed data fetching and rendering logic. | Multiple pages | Low | Extract data fetching into separate functions |
| TD-29 | **No error boundaries** — React error boundaries not implemented. A crash in one component can take down the whole page. | Throughout | Medium | Add error boundaries at page and layout level |
| TD-30 | **Console.error used for production errors** — Errors logged to console but not sent to monitoring. | Throughout | Medium | Integrate Sentry or similar error tracking |

---

## Priority Fix Order

1. **TD-21** — Admin guard bypass risk (security)
2. **TD-26** — No test coverage (quality)
3. **TD-01** — Triple purchase recording (reliability)
4. **TD-22** — No rate limiting (security)
5. **TD-16** — No pagination on admin tables (scalability)
6. **TD-18** — Fire-and-forget emails (reliability)
7. **TD-04** — Inconsistent timestamp columns (maintainability)
8. **TD-30** — No error monitoring (observability)
