# AGENTS.md — Agentic Coding Guidelines

This file provides guidance for agentic coding agents operating in the Aorthar Academy codebase.

## Overview

- **Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Supabase · Zod · React Hook Form · Sonner toasts · Lucide icons
- **Package manager:** `bun` (symlinked at `/usr/local/bin/bun`). Do not use `npm` or `pnpm`.
- **Root:** `/Users/theoneglobal/Documents/Aorthar/aorthar-academy`

---

## Build / Lint / Test Commands

```bash
cd aorthar-academy

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

## Route Groups

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(auth)` | `/login`, `/register`, `/verify` | public | Auth pages |
| `(dashboard)` | `/dashboard`, `/courses`, etc. | required + onboarding gate | Student app |
| `(classroom)` | `/classroom/[courseId]` | required | Full-screen course viewer |
| `(admin)` | `/admin/**` | required (guard disabled in dev) | Admin CMS |
| root | `/`, `/pricing`, `/onboarding` | public | Landing, pricing, onboarding |

---

## Common Gotchas

- **Admin guard:** Disabled when `NEXT_PUBLIC_APP_ENV=development`. In staging/prod, non-admins are redirected to `/unauthorized`.
- **Dashboard padding:** `(dashboard)/layout.tsx` applies `px-[15%]` padding. Do not add per-page horizontal padding.
- **Environment variable:** `NEXT_PUBLIC_APP_ENV=development|staging|production` controls env badge and demo toggle visibility.
- **Edge Functions:** Located in `supabase/functions/`. Excluded from `tsconfig.json`. Use Deno imports.

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
