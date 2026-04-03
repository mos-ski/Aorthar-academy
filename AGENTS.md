# AGENTS.md — Agentic Coding Guidelines

This file provides guidance for agentic coding agents operating in the Aorthar Academy codebase.

## Overview

- **Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Supabase · Zod · React Hook Form · Sonner toasts · Lucide icons
- **Package manager:** `bun` (symlinked at `/usr/local/bin/bun`). Do not use `npm` or `pnpm`.
- **Root:** `/Users/theoneglobal/Documents/Projects/Aorthar`

---

## Build / Lint / Test Commands

```bash
bun dev              # Start dev server (localhost:3000)
bun run build        # Production build — primary correctness gate (no test suite)
bun run lint         # ESLint with Next.js config
bun run start        # Start production server
```

**There is no test suite.** The build (`bun run build`) is the primary correctness gate. Run it after every significant change to catch TypeScript errors and ESLint violations.

---

## Code Style Guidelines

### Imports

- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Order imports groups:
  1. External libraries (React, Next.js, etc.)
  2. Internal imports (`@/lib`, `@/components`, `@/app`, `@/types`)
  3. Type imports (`import type { ... }`)
- Group related imports together; alphabetize within groups

```ts
// ✓ Good
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types';

// ✗ Bad — mixed order
import { Button } from '@/components/ui/button';
import { useState } from 'react';
```

### TypeScript

- Always use explicit types for function parameters and return types
- Use `type` for object shapes and unions, `interface` for extensible objects
- Use `import type` / `export type` for type-only imports

```ts
// ✓ Good
export async function requireAuth(): Promise<{ user: User; profile: Profile }> {
  // ...
}

type UserRole = 'student' | 'admin';

// ✗ Bad
export async function requireAuth() { // missing return type
  // ...
}
```

### Naming Conventions

- **Components:** PascalCase (`CourseViewer`, `Sidebar`)
- **Functions:** camelCase (`requireAuth`, `createClient`)
- **Files:** kebab-case for utilities (`auth.ts`, `formatters.ts`), PascalCase for components (`Sidebar.tsx`)
- **Database tables/columns:** snake_case (`user_id`, `onboarding_completed_at`)
- **Types:** PascalCase (`Role`, `Course`, `Profile`)

### Error Handling

- API routes: Return proper HTTP status codes (401 for unauthorized, 400 for bad request, 500 for server errors)
- Use Zod for input validation with `safeParse()` — return structured errors

```ts
// ✓ Good
const parsed = profileSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
    { status: 400 },
  );
}

// ✗ Bad — generic error messages
if (!parsed.success) {
  return NextResponse.json({ error: 'Error' }, { status: 400 });
}
```

- Supabase errors: Return `error.message` in response

```ts
const { error } = await supabase.from('profiles').update(...);
if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

### React Patterns

- **Client components:** Add `'use client'` directive at the top
- **Server vs Client:** Keep components server-side unless interactivity is needed (useState, useEffect, onClick, etc.)
- **Form handling:** Use React Hook Form + Zod resolvers (see `src/components/onboarding/OnboardingForm.tsx`)
- **Toasts:** Use Sonner (`sonner` package) — `toast.success()`, `toast.error()`

### Tailwind CSS v4

- Use `@import "tailwindcss"` syntax (not `@tailwind base/components/utilities`)
- CSS variables defined in `globals.css` under `:root` and `.dark`
- Use `cn()` utility for conditional class merging

```ts
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'primary' ? "text-primary" : "text-secondary"
)} />
```

### Database Patterns

- **profiles table:** Always use `user_id` (FK to auth.users), not `id` (PK)

```ts
// ✓ Correct
.from('profiles').select(...).eq('user_id', user.id)

// ✗ Wrong
.from('profiles').select(...).eq('id', user.id)
```

- **JSONB options format:** Quiz question options stored as `[{"id":"a","text":"...","is_correct":true}]`

---

## Key Architectural Patterns

### Supabase Client Selection

Use the right client for the context:

- `src/lib/supabase/server.ts` — Server Components and API routes (uses cookies)
- `src/lib/supabase/client.ts` — Client Components only
- `src/lib/supabase/admin.ts` — Admin API routes only (bypasses RLS, uses `SERVICE_ROLE_KEY`)

### Auth & RBAC

```ts
// Server Components / API routes:
const { user, profile } = await requireAuth();       // throws → redirect /login
await requireRole('admin', profile);                  // throws → redirect /unauthorized

// Check premium access:
const isPremium = await checkPremiumAccess(user.id);
```

### Middleware Flow

1. Refresh Supabase session
2. Auth-route redirect (logged-in → dashboard)
3. Public-route passthrough
4. Onboarding gate — redirect to `/onboarding` if no department
5. Admin route guard — **disabled in development** (`NEXT_PUBLIC_APP_ENV=development`)
6. Premium route guard — checks `subscriptions.status = 'active'`

### Demo Mode

- `isDemoMode()` from `src/lib/demo/mode.ts` — checks `aorthar_demo` cookie
- Returns `false` in production
- Two layers: passive fallback (empty tables) and forced toggle (cookie)

---

## Subdomain Architecture

Aorthar runs on **five subdomains**, each with a distinct purpose:

| Subdomain | Product | Auth | Purpose |
|-----------|---------|------|---------|
| `aorthar.com` | Marketing Site | Public | Brand, landing page, CTAs to products |
| `university.aorthar.com` | University | Required + onboarding gate | 4-year academic program |
| `internship.aorthar.com` | Internship | Public browsing, required for exam | Quarterly cohort program |
| `bootcamp.aorthar.com` | Bootcamps | Required for purchase | Self-paced courses |
| `admin.aorthar.com` | Admin CMS | Required (admin guard) | Internal management |

### Shared Auth (SSO)

All subdomains share Supabase Auth via `.aorthar.com` cookie domain. One credential works everywhere.

### Route Groups by Subdomain

#### University (`university.aorthar.com`)

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(auth)` | `/login`, `/register`, `/verify` | public | Auth pages |
| `(dashboard)` | `/dashboard`, `/courses`, etc. | required + onboarding gate | Student app |
| `(classroom)` | `/classroom/[courseId]` | required | Full-screen course viewer |

#### Internship (`internship.aorthar.com`)

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | public | Landing page |
| `/apply` | public | Application + form purchase |
| `/quiz/enter` | public | Exam entry (name + code) |
| `/quiz/take` | public | Active exam session |
| `/results` | public | Results lookup |

#### Bootcamps (`bootcamp.aorthar.com`)

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | public | Bootcamp catalog |
| `/courses-app/[courseId]` | public | Bootcamp detail |
| `/courses-app/[courseId]/player` | required | Lesson player |
| `/courses-app/[courseId]/checkout` | required | Purchase flow |

#### Admin (`admin.aorthar.com`)

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | admin required | Admin dashboard |
| `/courses`, `/users`, etc. | admin required | Product management |
| `/internship/**` | admin required | Internship management |
| `/bootcamps/**` | admin required | Bootcamp management |

**Admin guard is disabled when `NEXT_PUBLIC_APP_ENV=development`.** In staging/prod, non-admins are redirected to `/unauthorized`.

---

## Documentation

All product documentation is in `docs/`. Start with the master index:

- **Master Index:** `docs/README.md`
- **Products:** `docs/products/{internship,university,bootcamps}/`
- **Shared:** `docs/products/_shared/` (auth, payments, admin, landing)
- **Platform:** `docs/platform/` (database, API, RLS, edge functions, email, env vars)
- **Analysis:** `docs/analysis/` (roadmap, gaps, tech debt, scope)

### Key Documentation Files

| File | Role |
|------|------|
| `docs/README.md` | Master index — links to everything |
| `docs/products/_shared/01-overview.md` | 3-product architecture overview |
| `docs/products/university/00-overview.md` | University product overview |
| `docs/products/internship/00-overview.md` | Internship product overview |
| `docs/products/bootcamps/00-overview.md` | Bootcamps product overview |
| `docs/platform/database-schema.md` | All database tables (all products) |
| `docs/platform/api-reference.md` | All API routes |
| `docs/platform/rls-policies.md` | Row Level Security inventory |
| `docs/platform/email-templates.md` | All Resend email templates |

---

## Terminology

| Term | University | Bootcamp | Internship |
|------|-----------|----------|------------|
| **Product** | University | Bootcamp | Internship |
| **Learning unit** | Course | Bootcamp | — |
| **Content item** | Class | Lesson | — |
| **Assessment** | Quiz + Exam | None | One-time exam |
| **Structure** | Dept → Year → Semester → Course → Class | Bootcamp → Lesson | Application → Exam → Placement |
| **Access model** | Subscription | One-time purchase | One-time form fee |
| **Certificate** | End of program | End of bootcamp | End of placement |
| **Subdomain** | `university.aorthar.com` | `bootcamp.aorthar.com` | `internship.aorthar.com` |

---

## Common Gotchas

- **Dashboard padding:** `(dashboard)/layout.tsx` applies `px-[15%]` padding. Do not add per-page horizontal padding.
- **Environment variable:** `NEXT_PUBLIC_APP_ENV=development|staging|production` controls env badge and demo toggle visibility.
- **Edge Functions:** Located in `supabase/functions/`. Excluded from `tsconfig.json`. Use Deno imports.
- **Five subdomains, one codebase:** All products share the same Next.js app. Use subdomain detection and route groups to separate logic.
- **Terminology:** "Course" in University ≠ "Bootcamp" in standalone. A University Course has Classes; a Bootcamp has Lessons.
- **Admin is separate:** `admin.aorthar.com` is its own subdomain, not `/admin` on the main site.

---

## Important Files

| File | Role |
|------|------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/middleware.ts` | Auth + onboarding + premium guards |
| `src/utils/validators.ts` | Zod schemas for form inputs |
| `src/utils/formatters.ts` | GPA, currency, date formatters |
| `src/lib/auth.ts` | requireAuth, requireRole, checkPremiumAccess |
| `src/lib/demo/mode.ts` | isDemoMode() helper |
| `src/components/courses/CourseViewer.tsx` | Full classroom UI |
| `docs/README.md` | Master documentation index |

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_APP_ENV=development
```
