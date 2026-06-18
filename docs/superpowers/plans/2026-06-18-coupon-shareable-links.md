# Coupon Shareable Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a course page auto-apply a coupon from a `?coupon=CODE` URL parameter, and let admins copy a ready-to-share link (with the coupon attached) straight from the coupons admin page.

**Architecture:** Two pure helper functions (`getCouponCodeFromSearch`, `buildCouponShareLink`) in a new `src/utils/couponLink.ts`, unit-tested with vitest. They're then wired into two existing client components — `CourseWatch.tsx` (reads the URL param on mount and reuses the existing coupon-validation fetch) and `CouponAdmin.tsx` (builds and copies a link per coupon row). No database, API route, or schema changes — this reuses the existing `coupon_codes` table and `GET /api/standalone/coupon` endpoint exactly as they are today.

**Tech Stack:** Next.js App Router, React (client components), Tailwind CSS, vitest, `sonner` for toasts, browser Clipboard API.

## Global Constraints

- Package manager is `bun` only — run all commands as `bun run <script>` or `bunx <tool>`, never `npm`/`pnpm`.
- `bun run build` is the project's primary correctness gate (no full test suite beyond the vitest unit/integration tests already in `src/__tests__/`).
- No new database migrations, API routes, or env vars — this feature is pure frontend wiring on top of existing endpoints/tables.
- Existing coupon codes are normalized to uppercase, trimmed server-side and client-side — match that convention in any new code.
- Reuse `window.location.origin`/`window.location.search` client-side rather than introducing a new env var for the site URL.

---

## File Structure

- **Create** `src/utils/couponLink.ts` — two pure functions: parse a coupon code out of a URL search string, and build a shareable course-page link with a coupon code attached.
- **Create** `src/__tests__/unit/couponLink.test.ts` — vitest unit tests for the above, following the existing `formatters.test.ts` pattern (plain function imports, `describe`/`it`/`expect`, node environment — no DOM needed since `URLSearchParams` is a Node global).
- **Modify** `src/app/(courses-app)/courses-app/[slug]/CourseWatch.tsx` — auto-apply a coupon found in the URL on mount, show an inline notice if it's invalid, and pulse the "applied" badge once when auto-applied.
- **Modify** `src/app/globals.css` — add a `.coupon-pulse` utility class + `@keyframes coupon-pulse` inside the existing `@layer components` block (alongside the existing `.landing-pulse` pattern).
- **Modify** `src/app/(admin)/admin/coupons/CouponAdmin.tsx` — add a "Copy link" action per coupon row (direct copy for `scope: 'specific'`, a course-picker popover for `scope: 'all'`).

No new test infrastructure: the existing vitest setup (`vitest.config.ts`) runs in a Node environment with no jsdom/React Testing Library, and the codebase has no precedent for component-level UI tests — only pure-function unit tests and API integration tests. Task 1's helpers are the testable surface; Tasks 2 and 3 are UI wiring verified by `bun run build`, `bun run lint`, and manual browser checks (per project convention — see CLAUDE.md: "production build — primary correctness gate").

---

### Task 1: Coupon link helper functions

**Files:**
- Create: `src/utils/couponLink.ts`
- Test: `src/__tests__/unit/couponLink.test.ts`

**Interfaces:**
- Produces: `getCouponCodeFromSearch(search: string): string | null` — given a URL search string (e.g. `"?coupon=summer50"`), returns the trimmed, uppercased code, or `null` if absent/empty.
- Produces: `buildCouponShareLink(origin: string, slug: string, code: string): string` — given an origin (e.g. `"https://aorthar.academy"`), a course slug, and a coupon code, returns `"{origin}/courses-app/{slug}?coupon={encoded code}"`, stripping any trailing slash from `origin` first.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/unit/couponLink.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCouponCodeFromSearch, buildCouponShareLink } from '@/utils/couponLink';

describe('getCouponCodeFromSearch', () => {
  it('extracts and uppercases the coupon code', () => {
    expect(getCouponCodeFromSearch('?coupon=summer50')).toBe('SUMMER50');
  });

  it('trims surrounding whitespace from the code', () => {
    expect(getCouponCodeFromSearch('?coupon=%20SUMMER50%20')).toBe('SUMMER50');
  });

  it('returns null when the coupon param is missing', () => {
    expect(getCouponCodeFromSearch('?foo=bar')).toBeNull();
  });

  it('returns null when the coupon param is empty', () => {
    expect(getCouponCodeFromSearch('?coupon=')).toBeNull();
  });

  it('returns null for an empty search string', () => {
    expect(getCouponCodeFromSearch('')).toBeNull();
  });
});

describe('buildCouponShareLink', () => {
  it('builds a URL with the coupon code attached', () => {
    expect(buildCouponShareLink('https://aorthar.academy', 'ai-with-moskie', 'SUMMER50'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SUMMER50');
  });

  it('URL-encodes special characters in the code', () => {
    expect(buildCouponShareLink('https://aorthar.academy', 'ai-with-moskie', 'SAVE 50%'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SAVE%2050%25');
  });

  it('strips a trailing slash from the origin', () => {
    expect(buildCouponShareLink('https://aorthar.academy/', 'ai-with-moskie', 'SUMMER50'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SUMMER50');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test src/__tests__/unit/couponLink.test.ts`
Expected: FAIL — `Cannot find module '@/utils/couponLink'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/utils/couponLink.ts`:

```ts
export function getCouponCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const code = params.get('coupon');
  if (!code) return null;
  const trimmed = code.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function buildCouponShareLink(origin: string, slug: string, code: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/courses-app/${slug}?coupon=${encodeURIComponent(code)}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test src/__tests__/unit/couponLink.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/couponLink.ts src/__tests__/unit/couponLink.test.ts
git commit -m "feat: add coupon link helper functions"
```

---

### Task 2: Auto-apply coupon from URL on the course page

**Files:**
- Modify: `src/app/(courses-app)/courses-app/[slug]/CourseWatch.tsx:1-3` (imports), `:78-120` (state + coupon logic), `:300-311` (desktop applied-coupon badge), `:313-321` (desktop toggle button), `:595-606` (mobile applied-coupon badge), `:608-616` (mobile toggle button)
- Modify: `src/app/globals.css` (add pulse animation inside `@layer components`, after the existing `landing-float` keyframes block)

**Interfaces:**
- Consumes: `getCouponCodeFromSearch(search: string): string | null` and the existing `GET /api/standalone/coupon?code={code}&course_id={courseId}` endpoint (response shape: `{ code, discount_type, discount_value }` on success, `{ error }` on failure — already used by the existing `applyCoupon` function).
- Produces: no new exports — this is leaf UI wiring.

- [ ] **Step 1: Add the pulse animation to `globals.css`**

In `src/app/globals.css`, inside the existing `@layer components { ... }` block, immediately after the `@keyframes landing-float { ... }` block (currently the last rule before the closing `}` of that layer), add:

```css
  .coupon-pulse {
    animation: coupon-pulse 0.6s ease-out;
  }

  @keyframes coupon-pulse {
    0% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }
```

- [ ] **Step 2: Import `useEffect` and the new helper in `CourseWatch.tsx`**

Change line 3 from:

```tsx
import { useState } from 'react';
```

to:

```tsx
import { useState, useEffect } from 'react';
```

Add a new import after line 9 (`import UserAvatar from '@/components/standalone/UserAvatar';`):

```tsx
import { getCouponCodeFromSearch } from '@/utils/couponLink';
```

- [ ] **Step 3: Add new state and refactor coupon validation into a shared function**

Replace the existing state block and `applyCoupon`/`removeCoupon` functions (current lines 81-120):

```tsx
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const discountedPrice = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.max(0, Math.round(course.price_ngn * (1 - appliedCoupon.discount_value / 100)))
      : Math.max(0, appliedCoupon.discount_value)
    : course.price_ngn;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/standalone/coupon?code=${encodeURIComponent(couponInput.trim())}&course_id=${course.id}`);
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? 'Invalid coupon code');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value });
      setCouponError('');
    } catch (err) {
      console.error('[CourseWatch] Coupon validation error:', err);
      setCouponError('Could not validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }
```

with:

```tsx
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  const [urlCouponNotice, setUrlCouponNotice] = useState('');

  const discountedPrice = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.max(0, Math.round(course.price_ngn * (1 - appliedCoupon.discount_value / 100)))
      : Math.max(0, appliedCoupon.discount_value)
    : course.price_ngn;

  async function validateCoupon(code: string, fromUrl: boolean) {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/standalone/coupon?code=${encodeURIComponent(code.trim())}&course_id=${course.id}`);
      const data = await res.json();
      if (!res.ok) {
        if (fromUrl) {
          setUrlCouponNotice(data.error ?? 'This coupon code is no longer valid');
        } else {
          setCouponError(data.error ?? 'Invalid coupon code');
        }
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value });
      setCouponError('');
      setUrlCouponNotice('');
      if (fromUrl) setAutoApplied(true);
    } catch (err) {
      console.error('[CourseWatch] Coupon validation error:', err);
      if (fromUrl) {
        setUrlCouponNotice('Could not validate coupon. Please try again.');
      } else {
        setCouponError('Could not validate coupon. Please try again.');
      }
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  async function applyCoupon() {
    await validateCoupon(couponInput, false);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  useEffect(() => {
    const code = getCouponCodeFromSearch(window.location.search);
    if (code) {
      setCouponInput(code);
      validateCoupon(code, true);
    }
    // Intentionally run once on mount only — re-running on every render would
    // re-fetch and could clobber a coupon the visitor entered manually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 4: Add the pulse class and invalid-link notice to the desktop sidebar**

In the desktop "Buy CTA below menu" block, replace (current lines 300-321):

```tsx
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs" style={{ color: '#a7d252' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>applied</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                      -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₦${appliedCoupon.discount_value.toLocaleString()}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
                </div>
              )}

              {!appliedCoupon && (
                <button
                  onClick={() => { setShowCouponInput(!showCouponInput); setCouponError(''); }}
                  className="text-xs transition-colors text-left"
                  style={{ color: showCouponInput ? 'rgba(167,210,82,0.7)' : '#a7d252' }}
                >
                  {showCouponInput ? 'Close' : 'Do you have a coupon?'}
                </button>
              )}
```

with:

```tsx
              {appliedCoupon && (
                <div className={`flex items-center justify-between text-xs ${autoApplied ? 'coupon-pulse' : ''}`} style={{ color: '#a7d252' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>applied</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                      -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₦${appliedCoupon.discount_value.toLocaleString()}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
                </div>
              )}

              {urlCouponNotice && !appliedCoupon && (
                <p className="text-xs text-amber-400">{urlCouponNotice}</p>
              )}

              {!appliedCoupon && (
                <button
                  onClick={() => { setShowCouponInput(!showCouponInput); setCouponError(''); }}
                  className="text-xs transition-colors text-left"
                  style={{ color: showCouponInput ? 'rgba(167,210,82,0.7)' : '#a7d252' }}
                >
                  {showCouponInput ? 'Close' : 'Do you have a coupon?'}
                </button>
              )}
```

- [ ] **Step 5: Add the same pulse class and notice to the mobile buy CTA**

In the "Mobile buy CTA" block, replace (current lines 595-616):

```tsx
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs" style={{ color: '#a7d252' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>applied</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                      -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₦${appliedCoupon.discount_value.toLocaleString()}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
                </div>
              )}

              {!appliedCoupon && (
                <button
                  onClick={() => { setShowCouponInput(!showCouponInput); setCouponError(''); }}
                  className="text-xs transition-colors text-left"
                  style={{ color: showCouponInput ? 'rgba(167,210,82,0.7)' : '#a7d252' }}
                >
                  {showCouponInput ? 'Close' : 'Do you have a coupon?'}
                </button>
              )}
```

with:

```tsx
              {appliedCoupon && (
                <div className={`flex items-center justify-between text-xs ${autoApplied ? 'coupon-pulse' : ''}`} style={{ color: '#a7d252' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>applied</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                      -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₦${appliedCoupon.discount_value.toLocaleString()}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
                </div>
              )}

              {urlCouponNotice && !appliedCoupon && (
                <p className="text-xs text-amber-400">{urlCouponNotice}</p>
              )}

              {!appliedCoupon && (
                <button
                  onClick={() => { setShowCouponInput(!showCouponInput); setCouponError(''); }}
                  className="text-xs transition-colors text-left"
                  style={{ color: showCouponInput ? 'rgba(167,210,82,0.7)' : '#a7d252' }}
                >
                  {showCouponInput ? 'Close' : 'Do you have a coupon?'}
                </button>
              )}
```

Note: this block appears twice in the file (desktop sidebar and mobile sidebar are separate JSX trees, not a shared component) — both occurrences need the same edit, which is why this is broken into Steps 4 and 5.

- [ ] **Step 6: Verify the build and lint pass**

Run: `bun run build`
Expected: build succeeds with no new errors.

Run: `bun run lint`
Expected: no new lint errors (the `eslint-disable-next-line react-hooks/exhaustive-deps` comment on the new `useEffect` suppresses the one expected warning).

- [ ] **Step 7: Manually verify in the browser**

Run: `bun dev`, then in a browser:
1. Find an existing coupon code and a published course slug (check `/admin/coupons` and the `standalone_courses` table, or create a test coupon there first).
2. Visit `/courses-app/{slug}?coupon={VALID_CODE}` — confirm the green "applied" badge and discounted price appear automatically, with a brief scale pulse on load, and the buy button label shows the discounted price.
3. Visit `/courses-app/{slug}?coupon=NOTAREALCODE` — confirm the page loads at the normal price with a small amber notice (e.g. "This coupon code is no longer valid" / "Invalid coupon code") near the buy button, and no pulse.
4. Visit `/courses-app/{slug}` with no `coupon` param — confirm everything behaves exactly as before (no notice, no pulse, manual coupon entry still works).

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css "src/app/(courses-app)/courses-app/[slug]/CourseWatch.tsx"
git commit -m "feat: auto-apply coupon code from URL on course page"
```

---

### Task 3: "Copy link" action on the admin coupons page

**Files:**
- Modify: `src/app/(admin)/admin/coupons/CouponAdmin.tsx:1-4` (imports), `:27-30` (state), `:296-303` (row actions cell)

**Interfaces:**
- Consumes: `buildCouponShareLink(origin: string, slug: string, code: string): string` from Task 1; the existing `courses: Course[]` prop (`{ id, title, slug }[]`, already passed into this component) and the existing `coupon.standalone_courses: { title: string; slug: string } | null` field (already present on each row for `scope: 'specific'` coupons).
- Produces: no new exports — leaf UI wiring.

- [ ] **Step 1: Import the helper**

Add after line 4 (`import { toast } from 'sonner';`) in `CouponAdmin.tsx`:

```tsx
import { buildCouponShareLink } from '@/utils/couponLink';
```

- [ ] **Step 2: Add popover state and a copy handler**

After the existing state declarations (current lines 28-39, ending with the `form` state's closing `});`), add:

```tsx
  const [linkPickerFor, setLinkPickerFor] = useState<string | null>(null);

  async function copyLink(slug: string, code: string) {
    const link = buildCouponShareLink(window.location.origin, slug, code);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('[CouponAdmin] Failed to copy link:', err);
      toast.error('Could not copy link');
    }
  }
```

- [ ] **Step 3: Replace the row actions cell**

Replace the existing actions `<td>` (current lines 296-303):

```tsx
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteCoupon(coupon)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
```

with:

```tsx
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {coupon.scope === 'specific' ? (
                          <button
                            onClick={() => coupon.standalone_courses && copyLink(coupon.standalone_courses.slug, coupon.code)}
                            disabled={!coupon.standalone_courses}
                            className="text-xs hover:underline disabled:opacity-40 disabled:no-underline"
                          >
                            Copy link
                          </button>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setLinkPickerFor(linkPickerFor === coupon.id ? null : coupon.id)}
                              className="text-xs hover:underline"
                            >
                              Copy link
                            </button>
                            {linkPickerFor === coupon.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setLinkPickerFor(null)} />
                                <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-md border bg-card shadow-lg py-1 max-h-64 overflow-y-auto">
                                  {courses.length === 0 ? (
                                    <p className="px-3 py-2 text-xs text-muted-foreground">No bootcamps available</p>
                                  ) : (
                                    courses.map((c) => (
                                      <button
                                        key={c.id}
                                        onClick={() => { copyLink(c.slug, coupon.code); setLinkPickerFor(null); }}
                                        className="block w-full text-left px-3 py-2 text-xs hover:bg-muted"
                                      >
                                        {c.title}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => deleteCoupon(coupon)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
```

- [ ] **Step 4: Verify the build and lint pass**

Run: `bun run build`
Expected: build succeeds with no new errors.

Run: `bun run lint`
Expected: no new lint errors.

- [ ] **Step 5: Manually verify in the browser**

Run: `bun dev`, then as an admin user visit `/admin/coupons`:
1. For a coupon with `scope: 'specific'` (tied to one bootcamp): click "Copy link", confirm the "Link copied to clipboard" toast appears, and paste the clipboard contents somewhere to confirm it matches `{origin}/courses-app/{that course's slug}?coupon={CODE}`.
2. For a coupon with `scope: 'all'`: click "Copy link", confirm a dropdown of bootcamp titles appears; click one, confirm the toast appears and the copied link uses the slug of the bootcamp you picked.
3. Click "Copy link" on an "all"-scope coupon, then click elsewhere on the page — confirm the dropdown closes without copying anything.
4. Confirm the existing "Active/Inactive" toggle and "Delete" button still work unchanged.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(admin)/admin/coupons/CouponAdmin.tsx"
git commit -m "feat: add copy-link action to admin coupons page"
```

---

## Self-Review Notes

- **Spec coverage:** Part 1 (URL auto-apply, invalid notice, pulse) → Task 2. Part 2 (copy-link button, specific vs. all scope, course picker, `window.location.origin`) → Task 3. Shared logic → Task 1. All spec sections covered.
- **Placeholder scan:** No TBD/TODO; every step has complete code.
- **Type consistency:** `getCouponCodeFromSearch`/`buildCouponShareLink` signatures match between Task 1 (definition) and Tasks 2/3 (usage). `appliedCoupon`, `autoApplied`, `urlCouponNotice` state names are consistent within Task 2. `linkPickerFor`, `copyLink` consistent within Task 3.
