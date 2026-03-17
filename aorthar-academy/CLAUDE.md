# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # start dev server (localhost:3000)
bun run build    # production build — run this after every significant change to catch TypeScript errors
bun run lint     # ESLint (Next.js config)
```

No test suite exists. The build (`bun run build`) is the primary correctness gate.

**Package manager:** `bun` (symlinked at `/usr/local/bin/bun`). Do not use `npm` or `pnpm`.

## Architecture Overview

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Supabase · Zod · React Hook Form · Sonner toasts · Lucide icons

### Route groups

| Group | Path prefix | Auth | Purpose |
|---|---|---|---|
| `(auth)` | `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password` | public | Auth pages — split-panel layout, no shared layout file |
| `(dashboard)` | `/dashboard`, `/courses`, `/progress`, `/gpa`, `/capstone`, `/suggest`, `/settings` | required + onboarding gate | Student app. Shared layout at `src/app/(dashboard)/layout.tsx` with Sidebar + Navbar. All pages get `px-[15%]` padding via the layout wrapper div. |
| `(classroom)` | `/classroom/[courseId]` | required | Full-screen dark course viewer. Separate layout, no sidebar. |
| `(admin)` | `/admin/**` | required (guard disabled in dev) | Admin CMS. Shared layout at `src/app/(admin)/admin/layout.tsx`. Includes: courses, questions, users, suggestions, capstone, payments, curriculum, departments pages. |
| root | `/`, `/pricing`, `/onboarding` | public / conditional | Landing, pricing, and student onboarding pages. |

### Supabase client selection

Three clients with distinct scopes — use the right one:

- `src/lib/supabase/server.ts` — `createClient()` — Server Components and API routes. Uses cookies for session.
- `src/lib/supabase/client.ts` — `createClient()` — Client Components only.
- `src/lib/supabase/admin.ts` — `createAdminClient()` — Admin API routes only. Uses `SERVICE_ROLE_KEY`; bypasses RLS. Import only in `/api/admin/**` routes.

### Auth & RBAC pattern

```ts
// Server Components / API routes:
const { user, profile } = await requireAuth();          // throws → redirect /login
await requireRole('admin', profile);                     // throws → redirect /unauthorized

// Profile rows use user_id (FK), not id (PK):
.from('profiles').select(...).eq('user_id', user.id)    // ✓ correct
.from('profiles').select(...).eq('id', user.id)          // ✗ wrong
```

`src/lib/auth.ts` exports `requireAuth()`, `requireRole()`, `checkPremiumAccess()`.

### Middleware flow (`src/middleware.ts`)

1. Refresh Supabase session (gracefully handles unconfigured env)
2. Auth-route redirect (logged-in → dashboard)
3. Public-route passthrough
4. **Onboarding gate** — students without `profile.department` + `profile.onboarding_completed_at` are redirected to `/onboarding`
5. Admin route guard — **disabled when `NEXT_PUBLIC_APP_ENV=development`**, enforced in staging + production
6. Premium route guard — checks `subscriptions.status = 'active'`

### Academic data model

```
years (level: 100|200|300|400)
  └─ semesters (number: 1|2)
       └─ courses (code, is_premium, pass_mark, status)
            ├─ lessons → resources (youtube|link|document)
            └─ questions (options: JSONB array [{id,text,is_correct}], is_exam_question)
```

Grade formula: `quiz_weight (0.4) × quiz_score + exam_weight (0.6) × exam_score`. Pass mark defaults to 60%. GPA scale is 5.0.

Progression rules:
- Semester 2 unlocks when all Semester 1 courses pass
- Year N+1 unlocks when all Year N courses pass
- Year 400 requires an active premium subscription
- Capstone requires all 400-level courses + GPA ≥ 3.5 + premium

### Department / onboarding

Eight departments in `src/lib/academics/departments.ts` (`AORTHAR_DEPARTMENTS`). Semester-1 enrollment codes per department are defined in `src/lib/academics/plan.ts` → `getSemester1EnrollmentCodes(department)`. These are shared between the frontend (onboarding preview) and the API route.

### Edge Functions (Deno runtime — `supabase/functions/`)

| Function | Trigger | What it does |
|---|---|---|
| `grade-quiz` | `POST /api/quiz/submit` | Server-side grading; strips correct answers from client |
| `calculate-gpa` | internal | Calls `compute_semester_gpa` / `compute_cumulative_gpa` RPCs |
| `check-progression` | internal | Validates year/semester unlock conditions |
| `verify-payment` | `POST /api/webhooks/paystack` | Paystack HMAC-SHA512 verification + idempotent transaction insert |

Edge Functions use Deno imports and are excluded from `tsconfig.json`. Do not add them to the TS project.

### API routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `POST /api/quiz/start` | Create attempt, return shuffled questions (no answers) |
| `POST /api/quiz/submit` | Delegates to grade-quiz Edge Function |
| `GET /api/quiz/attempt/[id]` | Fetch attempt state |
| `GET /api/quiz/attempt/[id]/solutions` | Fetch graded solutions post-submission |
| `POST /api/quiz/generate` | AI-generate questions for a lesson |
| `POST /api/payments/checkout` | Create Paystack session |
| `POST /api/webhooks/paystack` | Delegates to verify-payment Edge Function |
| `POST /api/capstone/submit` | Submit capstone (premium only) |
| `POST /api/suggestions` | Submit suggestion |
| `GET\|PUT /api/profile` | Read/update student profile fields |
| `DELETE /api/account` | Delete account |
| `GET /api/transcript/download` | Generate and stream transcript PDF |
| `POST /api/onboarding/change-department` | Switch department post-onboarding |
| `POST /api/unlock-next-level` | Trigger progression unlock check |
| `GET\|POST /api/lessons/comments` | Lesson comments |
| `POST /api/lessons/comments/reaction` | React to a comment |
| `POST /api/lessons/reaction` | React to a lesson |
| `GET /api/lessons/summary\|related\|deep-dive` | AI-generated lesson content |
| `GET\|POST /api/admin/courses` | List/create courses |
| `GET\|POST /api/admin/years` | List/create academic years |
| `GET\|POST /api/admin/semesters` | List/create semesters |
| `GET /api/admin/curriculum` | Full curriculum tree |
| `POST /api/demo-mode` | Flip `aorthar_demo` cookie |

### Demo mode

Two layers:

1. **Passive fallback** — when `years` table is empty, student pages use `src/lib/demo/studentSnapshot.ts` and admin pages use `src/lib/demo/adminSnapshot.ts` (31 real courses seeded).
2. **Forced demo toggle** — a cookie `aorthar_demo=1` overrides live data on any page. Toggle is exposed in the Navbar (hidden in production). `POST /api/demo-mode` flips the cookie.

Helper: `isDemoMode()` from `src/lib/demo/mode.ts` — call at the top of any server page/layout that needs to respect the toggle. Returns `false` unconditionally when `NEXT_PUBLIC_APP_ENV=production`.

### Environments

`NEXT_PUBLIC_APP_ENV` controls the environment badge in the Navbar and gates the demo toggle:

| Value | Navbar badge | Demo toggle |
|---|---|---|
| `development` | yellow DEV | visible |
| `staging` | blue STAGING | visible |
| `production` | green PROD | hidden |

Set per deployment in Vercel environment variables. Local `.env.local` uses `development`.

### Payments

Paystack (Nigerian market). `src/lib/paystack.ts` for helpers. Webhook at `POST /api/webhooks/paystack`. Subscriptions stored in `subscriptions` table; premium check is always `subscriptions.status = 'active'` — do not cache it in profiles.

## Key files quick-reference

| File | Role |
|---|---|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/middleware.ts` | Auth + onboarding + premium route guards |
| `src/utils/validators.ts` | Zod schemas for all form inputs |
| `src/utils/formatters.ts` | GPA, currency (NGN default), date, year/semester label formatters |
| `src/lib/gpa.ts` | GPA calculation logic (server-only) |
| `src/lib/progression.ts` | Unlock / progression logic |
| `src/lib/demo/mode.ts` | `isDemoMode()` — reads `aorthar_demo` cookie; false in production |
| `src/lib/demo/adminSnapshot.ts` | Admin demo data — 31 courses, 8 users, full curriculum |
| `src/lib/demo/studentSnapshot.ts` | Student demo data — parsed from markdown curriculum |
| `src/lib/courses/loadCourseViewerData.ts` | Data loader for the classroom viewer |
| `src/components/courses/CourseViewer.tsx` | Full classroom UI (tabs: Class Info, Materials, Related, Classroom) |
| `src/components/layout/Navbar.tsx` | Top nav — env badge + demo toggle (client component) |
| `src/components/settings/SettingsClient.tsx` | Settings page client component (profile, account, department) |
| `src/lib/academics/departments.ts` | `AORTHAR_DEPARTMENTS` — 8 department definitions |
| `src/lib/academics/plan.ts` | `getSemester1EnrollmentCodes(dept)` — onboarding course enrollment |
| `supabase/migrations/001_initial_schema.sql` | Canonical schema — all tables |
| `supabase/migrations/002_rls_policies.sql` | RLS + `is_admin()` / `is_premium()` helpers |
| `supabase/migrations/003_functions.sql` | GPA RPCs, cooldown checks, contributor auto-promotion trigger |

## Database migrations

Run in order when setting up a new Supabase project:

```
001_initial_schema.sql
002_rls_policies.sql
003_functions.sql
005_aorthar_curriculum_seed.sql   (or 005_aorthar_full_curriculum_seed.sql)
006_learning_features.sql
20240306000000_create_curriculum_schema.sql
20260306001000_add_student_onboarding_fields.sql
20260306003000_classroom_learning_features.sql
```

## Environment variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_APP_ENV=development   # development | staging | production
```

## Important patterns & gotchas

- **`profiles.user_id` vs `profiles.id`** — `user_id` is the FK to `auth.users`. Always filter with `.eq('user_id', user.id)`, never `.eq('id', user.id)`.
- **Admin guard** — Active when `NEXT_PUBLIC_APP_ENV !== 'development'`. In dev, any logged-in user can access `/admin`. In staging/prod, non-admins are redirected to `/unauthorized`.
- **JSONB options format** — Quiz question options are stored as `[{"id":"a","text":"...","is_correct":true}]`. Always use this shape when inserting.
- **Tailwind v4** — Uses `@import "tailwindcss"` syntax, not `@tailwind base/components/utilities`. CSS variables are defined in `globals.css` under `:root` and `.dark`.
- **shadcn components** — Added via `bunx shadcn add <component>`. Config is in `components.json`.
- **`px-[15%]` layout padding** — Applied in `(dashboard)/layout.tsx` wrapper div. Do not add per-page horizontal padding on top of this in dashboard pages.
- **AI utilities** — `src/lib/ai/` contains server-side AI helpers used by `GET /api/lessons/summary|related|deep-dive`. Never import from this directory in Client Components.
- **Dependency patches** — `patches/` holds `patch-package` diffs applied automatically via the `postinstall` script. If a build breaks after adding/upgrading a package, check here for conflicts. Regenerate with `bunx patch-package <package-name>`.
