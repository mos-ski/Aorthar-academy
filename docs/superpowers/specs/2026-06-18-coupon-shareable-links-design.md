# Coupon Shareable Links

## Problem

Admins can create coupon codes (`coupon_codes` table) and bootcamp visitors can manually
type a code into a field on the course page to get a discount. There's no way to share a
single link that arrives already discounted — admins currently have to tell people the
code and trust them to type it in correctly.

## Goal

1. A course page URL like `/courses-app/{slug}?coupon={CODE}` auto-applies that coupon on
   load, so the visitor sees the discounted price and CTA immediately.
2. The admin coupons page gets a one-click "Copy link" action per coupon that builds and
   copies that URL.

No changes to the coupon data model, validation rules, or checkout/payment flow — this
reuses the existing `coupon_codes` table and `GET /api/standalone/coupon` validation
endpoint as-is.

## Part 1 — Auto-apply via URL param (`CourseWatch.tsx`)

File: `src/app/(courses-app)/courses-app/[slug]/CourseWatch.tsx`

- Read a `coupon` search param on mount (e.g. via `useSearchParams`).
- If present, call the existing `GET /api/standalone/coupon?code={code}&course_id={courseId}`
  validation endpoint — the same call the manual "Apply" button already makes. No new
  backend logic; scope/expiry/usage-limit checks are already enforced there.
- **Valid coupon:** feed the result into the same state setter the manual "Apply" flow
  uses, so the existing green "applied" badge, discount badge, and discounted
  price/button label (`"Buy now — ₦{discountedPrice}"`) render exactly as they do today.
  Additionally, trigger a one-time CSS pulse/highlight animation on the price element so
  a first-time visitor's eye is drawn to the discount (a CSS keyframe animation applied
  once on mount when auto-applied; no dependency on the manual-apply path, which doesn't
  get the pulse since the user already knows they just applied it).
- **Invalid/expired/usage-maxed coupon:** show a small inline notice near the price (e.g.
  "This coupon code is no longer valid") and fall back to the normal price — same visual
  state as if no `coupon` param had been present, just with the added notice. The notice
  is dismissible or simply persists for the page view (no need for persistence beyond
  that).
- The existing manual coupon input/toggle remains visible and usable underneath,
  unchanged — a visitor can still swap in a different code by hand.

## Part 2 — "Copy link" action on admin coupons page

File: `src/app/(admin)/admin/coupons/CouponAdmin.tsx`

Add a "Copy link" button into each coupon row's existing action group (alongside the
current active-toggle/delete actions):

- **`scope = "specific"` coupons:** the row already knows its associated course (it's
  displayed in the "applies to" column). Clicking "Copy link" immediately builds
  `${window.location.origin}/courses-app/{course.slug}?coupon={code}` and writes it to
  the clipboard via the Clipboard API, with a brief "Copied!" inline confirmation
  (matching whatever toast/confirmation pattern already exists in the admin UI, or a
  simple temporary button-label swap if none does).
- **`scope = "all"` coupons:** there's no single course to link to, since the coupon
  works on any bootcamp. Clicking "Copy link" opens a small popover/dropdown listing all
  `standalone_courses` (title — reusing whatever course list the create-coupon form's
  course picker already loads). Selecting a course builds and copies that course's URL
  with the coupon attached, same as above.
- Uses `window.location.origin` client-side (not an env var), so the copied link is
  always correct for whatever environment (localhost, preview, production) the admin is
  using when they click it.

## Out of scope

- No changes to coupon validation, discount calculation, or checkout/payment logic.
- No new database fields or migrations.
- No support for stacking multiple coupons or for the `(marketplace)` checkout flow
  (which has no coupon support today and is a separate system).
- No persistence of "coupon came from a link" — it's treated identically to a
  manually-typed code once validated.

## Testing

- Manual: visit `/courses-app/{slug}?coupon={validCode}` and confirm the discounted
  price/badge appear with the pulse animation; visit with an invalid/expired code and
  confirm the inline notice + fallback to normal price.
- Manual: from the admin coupons page, copy a link for a `specific`-scope coupon and a
  `all`-scope coupon (picking a course in the popover), and confirm the resulting URL
  applies correctly.
