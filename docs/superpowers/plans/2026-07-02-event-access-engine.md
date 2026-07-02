# Event Access Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each webinar automatically move from registration, to live join link, to replay URL without code changes per event.

**Architecture:** Store `replay_url` on `webinars`. The public event page computes `registration | live | replay` from `scheduled_at`, `duration_minutes`, `join_url`, and `replay_url`; the admin editor owns the URL.

**Tech Stack:** Next.js App Router, TypeScript, Supabase/Postgres, Bun, Vitest, Tailwind CSS.

## Global Constraints

- Use `bun`, not npm or pnpm.
- Keep the event engine in `src/lib/events/status.ts`.
- Use a nullable `webinars.replay_url` column with an HTTP(S) check.
- Public event pages redirect to `replay_url` only after the scheduled duration has ended.
- Keep a temporary seeded replay fallback for the existing `SLTWX` event until the production migration is applied.

---

### Task 1: Database Field

**Files:**
- Modify: `supabase/migrations/20260702124815_add_webinar_replay_url.sql`

**Interfaces:**
- Produces: `public.webinars.replay_url TEXT NULL`

- [x] Add nullable `replay_url` to `public.webinars`.
- [x] Add a check constraint allowing only null/empty or HTTP(S) URLs.
- [x] Notify PostgREST to reload schema.

### Task 2: Event Access Library

**Files:**
- Modify: `src/lib/events/status.ts`
- Modify: `src/__tests__/unit/eventStatus.test.ts`

**Interfaces:**
- Produces: `normalizeEventUrl(url?: string | null): string`

- [x] Add URL normalizer for join/replay URLs.
- [x] Remove slug-based replay overrides.
- [x] Keep a seeded transition fallback so the existing completed event does not regress before the migration is applied.
- [x] Add unit coverage for URL normalization.

### Task 3: Public Event Page

**Files:**
- Modify: `src/app/(events)/events/[slug]/page.tsx`

**Interfaces:**
- Consumes: `normalizeEventUrl`
- Consumes: `webinars.replay_url`

- [x] Select `replay_url`.
- [x] Redirect to the normalized replay URL after class end when set.
- [x] Keep the live state using the normalized join URL.

### Task 4: Admin Editor And API

**Files:**
- Modify: `src/app/(admin)/admin/webinars/[id]/WebinarEditor.tsx`
- Modify: `src/app/api/admin/webinars/[id]/route.ts`

**Interfaces:**
- Consumes/produces: `replay_url`

- [x] Add `replay_url` to editor type/state.
- [x] Persist `replay_url` in the update API.
- [x] Add a replay URL field near the join URL.

### Task 5: Verification

**Commands:**
- `bun run test src/__tests__/unit/eventStatus.test.ts`
- `bunx eslint 'src/app/(events)/events/[slug]/page.tsx' 'src/app/(admin)/admin/webinars/[id]/WebinarEditor.tsx' 'src/app/api/admin/webinars/[id]/route.ts' src/lib/events/status.ts src/__tests__/unit/eventStatus.test.ts`
- `bun run build`
