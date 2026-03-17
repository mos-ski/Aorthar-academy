# Pricing — PRD

## 1. Overview

The Pricing module is Aorthar Academy's monetisation gateway. It presents the subscription plans clearly, drives conversions, and handles the Paystack payment flow. It is a public page — accessible to both logged-out visitors and enrolled students.

**Current plan structure:**

| Tier | Access | Price |
|---|---|---|
| Free | Year 100 (all departments, Semester 1 + 2) | ₦0 — no card required |
| Standard | Years 100–400 (full academic access, all semesters) | ₦20,000 — one-time payment |
| Mentorship | Standard add-on: dedicated mentor/accountability teacher. Subscribing makes the student **Premium**. | ₦30,000 — separate one-time payment |

> **Mentorship is an add-on exclusively for Standard students.** Free students cannot purchase it. Subscribing to Mentorship upgrades the student's tier to Premium. Mentorship is not required to complete the curriculum.

**Nav rename note:** The student sidebar link previously labelled "Capstone" is renamed to "Pricing" and links to this page (`/pricing`).

**Who uses it:** Unauthenticated visitors, free-tier students, students considering upgrading.
**Why it exists:** Sustainable funding for the academy, and a clear value exchange — free access to lay the foundation, then a one-time investment to go deeper.

---

## 2. User Stories

- As a visitor, I want to see the pricing plans without logging in so I can evaluate whether Aorthar Academy is worth joining.
- As a Year 100 student, I want to understand what I'll unlock with a ₦20,000 Standard payment so I can decide if it's worth it.
- As a Standard student, I want to know about Mentorship and easily add it without hunting through settings.
- As a free student who wants to continue into Year 200, I want to pay once and never be asked again for the base content.
- As a student who has already subscribed, I want the pricing page to show my current plan status so I'm not confused about whether I need to pay again.
- As a student who just paid, I want to be redirected to the dashboard with a confirmation so I know the payment worked.

---

## 3. Functional Requirements

### 3.1 Plan Cards

The page displays **two plan cards** (Free + Standard). Mentorship is not a third card — it is surfaced as an add-on after Standard is active (see §3.2).

**Free plan card:**
- Label: "Free"
- Price: ₦0
- Feature list: Year 100 access (both semesters), all free courses, basic GPA tracking, suggest content.
- CTA: "Get Started Free" → `/register` (logged-out) or "Your current plan" disabled badge (logged-in free student).

**Standard plan card:**
- Label: "Standard"
- Badge: "Most Popular" (highlighted card).
- Price: ₦20,000 — one-time payment.
- Feature list: Everything in Free + Years 200–400 access, full GPA & transcript history, capstone eligibility, certificate of completion.
- CTA for logged-out visitors: "Pay ₦20,000" → redirect to `/login?return=/pricing`.
- CTA for free-tier students: "Pay ₦20,000" → opens **Upgrade Modal** (see §3.2).
- For already-subscribed students: CTA replaced by "Active" badge.

### 3.2 Upgrade Modal (Standard checkout)

When a logged-in free student clicks "Pay ₦20,000":

1. A dialog opens titled "Upgrade to Standard".
2. The dialog shows a summary of Standard features.
3. Below the features, a toggle card shows the **Mentorship add-on (₦30,000)** — **pre-selected by default**.
   - Student can click the card to uncheck/deselect it.
   - When selected: a note reads "Mentorship is a separate ₦30,000 payment. You'll see it on the pricing page right after upgrading."
4. Footer has "Cancel" and "Pay ₦20,000" buttons.
5. Clicking "Pay ₦20,000" always initiates the **Standard checkout only** (₦20,000). The Mentorship toggle is informational — it does not bundle or queue a second payment.
6. After Standard payment succeeds → student returns to `/pricing` where the Mentorship add-on row is now visible (see §3.3).

**Rationale:** Standard and Mentorship are always separate transactions. The pre-selected Mentorship in the modal is an awareness upsell, not a bundled checkout.

### 3.3 Mentorship Add-on Row

Shown **below the two plan cards** only for **logged-in Standard students** who have not yet added Mentorship.

- Compact horizontal row (not a full plan card). Styled as a billing line item.
- Shows: mentor icon, "Mentorship add-on", price (₦30,000), feature summary, "Add →" button.
- Clicking "Add →" initiates a separate Mentorship Paystack checkout (₦30,000).
- If Mentorship is already active: the row shows a green "Active" badge instead.

### 3.4 Checkout Flow (Paystack)

1. Student clicks a "Pay" CTA.
2. If not logged in: redirect to `/login?return=/pricing`.
3. If logged in: call `POST /api/payments/checkout` with `{ plan_id }`.
4. API creates a Paystack payment session and returns `authorization_url`.
5. Client redirects to the Paystack-hosted checkout page.
6. On successful payment: Paystack redirects to the callback URL.
7. Callback verifies via `POST /api/webhooks/paystack`.
8. On verified success:
   - Insert a `transactions` row (`status: 'success'`, `plan_id`, `amount`, `paystack_reference`).
   - Insert or update a `subscriptions` row (`status: 'active'`, `plan_id`, `activated_at`).
   - Redirect to `/dashboard` with toast: "Welcome to Standard! Year 200 is now unlocked."
9. On payment failure or cancellation: redirect to `/pricing` with toast: "Payment was not completed. You can try again any time."

### 3.5 Webhook Handling (`POST /api/webhooks/paystack`)

1. Paystack posts `charge.success` events to this endpoint.
2. The `verify-payment` Edge Function validates the HMAC-SHA512 signature.
3. Idempotent: if `paystack_reference` already exists in `transactions`, returns 200 with no duplicate insert.
4. On valid event: same DB writes as §3.4 step 8.

### 3.6 Active Plan State (Logged-In Student)

1. The page fetches the student's active subscription (`subscriptions.status = 'active'`).
2. The matching plan card shows "Active" and the CTA is disabled.
3. Free card always shows "Your current plan" for logged-in students on free tier.

### 3.7 Close Button / Back Navigation

A "← Back to Dashboard" link is shown top-left for logged-in students. Not shown for visitors.

### 3.8 Payment History

1. Shown below the plan cards for logged-in students only.
2. Fetches all rows from `transactions` for the current user, ordered by `created_at DESC`, limited to 20.
3. Columns: **Date**, **Plan**, **Amount**, **Reference** (hidden on mobile), **Status** badge.
4. Status badge colours: `success` → default (dark), `pending` → secondary (grey), `failed` → destructive (red).
5. Empty state: "No payment history yet."
6. In demo mode (`aorthar_demo=1`), shows three sample rows (success, failed, pending) for UI preview.

### 3.9 Fallback Plans (Dev / Pre-migration)

When the `plans` table is empty, the page falls back to hardcoded display values (₦20,000 / ₦30,000). The CTA buttons will render but checkout will fail gracefully with a toast until plans are seeded via `007_update_plans_seed.sql`.

### 3.10 Free Tier Gating (Enforcement)

Enforced in middleware and API routes:
- Year 200+ without Standard → redirect to `/pricing`.
- Mentor features without Mentorship → redirect to `/pricing`.

---

## 4. Non-Functional Requirements

- **Public access:** `/pricing` must not require authentication. Server components handle `user = null` gracefully.
- **Security:**
  - Payment amount is never set on the client. Server reads price from `plans` table.
  - Webhook signature verification is mandatory (401 on failure).
  - `SERVICE_ROLE_KEY` used only in the webhook handler via `createAdminClient()`.
- **Idempotency:** Webhook events use `paystack_reference` as a unique key.
- **Mobile:** Plan cards stack in a single column. Mentorship add-on row stacks gracefully.
- **Currency display:** All prices use `formatCurrency(amount, 'NGN')` — ₦ symbol + comma separators.

---

## 5. UI / UX

### Page Layout

1. **Header:** Badge ("Pricing"), heading ("Unlock your full potential"), subheading.
2. **Plan cards:** 2 cards in a horizontal row (desktop, max-w-3xl centered) or stacked (mobile).
3. **Mentorship add-on row:** Compact line item below cards, visible to Standard students only.
4. **Payment History:** Table below a divider, logged-in users only.

### Plan Card States

| State | Standard CTA |
|---|---|
| Logged-out visitor | "Pay ₦20,000" → `/login?return=/pricing` |
| Logged-in, Free tier | "Pay ₦20,000" → opens Upgrade Modal |
| Logged-in, Standard | "Active" (disabled) |
| Logged-in, Mentorship | "Active" (disabled) |

### Mentorship Add-on Row States

| State | Row appearance |
|---|---|
| Not shown | User is Free tier or not logged in |
| Active | Green border + "Active" badge |
| Not yet added | Normal border + "Add →" button |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `plans` | SELECT | Fetched server-side; ordered by price |
| `subscriptions` | SELECT | Fetched for logged-in user to determine active plan |
| `transactions` | SELECT | Fetched for logged-in user (limit 20, desc) |
| `transactions` | INSERT | Created on payment success |
| `subscriptions` | INSERT / UPDATE | Activated on payment verification |

### API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/payments/checkout` | Required | Create Paystack session, return `authorization_url` |
| POST | `/api/webhooks/paystack` | Signature-verified | Process Paystack `charge.success` webhook |

### Edge Functions

| Function | Purpose |
|---|---|
| `verify-payment` | HMAC-SHA512 validation + idempotent transaction insert + subscription activation |

### Key Utilities

- `formatCurrency(amount, 'NGN')` — `src/utils/formatters.ts`
- `isDemoMode()` — `src/lib/demo/mode.ts`
- `createAdminClient()` — `src/lib/supabase/admin.ts` (webhook handler only)
- Paystack helpers — `src/lib/paystack.ts`

### Migrations

Run `007_update_plans_seed.sql` to seed the correct NGN plans.

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student pays Standard but webhook is delayed | Subscription not active immediately. Student sees Free tier. Webhook activates it within seconds. |
| Double-click on "Pay" | Button shows spinner and is disabled after first click. Only one checkout session created. |
| Webhook received twice (retry) | `paystack_reference` uniqueness prevents duplicate transaction. Second webhook returns 200 with no DB change. |
| Student attempts Year 200 without Standard | Middleware redirects to `/pricing` with explanatory toast. |
| Payment succeeds but user closes window before redirect | Webhook fires independently. Subscription is still activated. On next login, student has full access. |
| `plans` table is empty | Fallback hardcoded plan data is used (display only). Checkout fails gracefully with toast. |
| Standard student wants Mentorship later | Mentorship add-on row is always visible on `/pricing` for Standard students. |

---

## 8. Success Metrics

- Free-to-Standard conversion rate: > 20% of Year 100 completers.
- Payment success rate (started checkout → transaction success): > 90%.
- Webhook processing latency: < 5 seconds from Paystack event to subscription activation.
- Chargeback/refund rate: < 2% of transactions.
- Mentorship adoption: > 10% of Standard students add Mentorship within 30 days.
- Zero cases of students accessing Year 200+ without a valid Standard subscription.
