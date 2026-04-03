# Payments & Monetization — Shared Spec

**Last Updated:** 2026-04-03

---

## Overview

All Aorthar products use **Paystack** for payment processing, but each product has a distinct payment model and flow.

---

## Product Payment Models

| Product | Model | Amount | Frequency | Access Duration |
|---------|-------|--------|-----------|-----------------|
| **Internship** | Application form | ₦10,000 | One-time (per cohort) | Exam access |
| **University** | Subscription | Variable (semester/monthly/yearly/lifetime) | Recurring | While active |
| **Bootcamps** | Course purchase | Per-course price | One-time | Permanent |

---

## Database Tables

### Plans (University)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Display name (e.g. "Semester Plan") |
| `amount` | INTEGER | Amount in kobo |
| `interval` | TEXT | `semester` / `monthly` / `yearly` / `lifetime` |
| `currency` | TEXT | `NGN` |
| `is_active` | BOOLEAN | Show on pricing page |

### Subscriptions (University)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `plan_id` | UUID | FK to plans |
| `status` | TEXT | `active` / `cancelled` / `expired` |
| `current_period_end` | TIMESTAMPTZ | Subscription expiry |
| `paystack_reference` | TEXT | Paystack transaction reference |

### Standalone Purchases (Bootcamps)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `course_id` | UUID | FK to standalone_courses |
| `amount` | INTEGER | Amount paid in kobo |
| `paystack_reference` | TEXT | Paystack transaction reference |
| `purchased_at` | TIMESTAMPTZ | Purchase timestamp |

### Transactions (All Products)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `product` | TEXT | `internship` / `university` / `bootcamp` |
| `amount` | INTEGER | Amount in kobo |
| `currency` | TEXT | `NGN` |
| `status` | TEXT | `success` / `failed` / `pending` |
| `paystack_reference` | TEXT | Paystack reference |
| `reference` | TEXT | Internal reference code |
| `created_at` | TIMESTAMPTZ | Transaction time |

---

## Payment Flows

### University Subscription

```
User → /pricing → Select plan →
POST /api/payments/checkout → Paystack →
User pays → Webhook → POST /api/webhooks/paystack →
Edge Function (verify-payment) → Create subscription + transaction →
Access granted
```

### Bootcamp Purchase

```
User → /courses-app/[courseId] → Click "Buy" →
POST /api/standalone/checkout → Paystack →
Two paths:
  1. Redirect → GET /api/standalone/verify-payment → Record purchase
  2. Webhook → POST /api/webhooks/paystack → Record purchase (idempotent)
Access granted
```

### Internship Form

```
User → /internship/apply → Click "Buy Form" →
POST /api/internship/checkout → Paystack →
User pays → Webhook → Create internship_application record →
Exam access granted
```

---

## Webhook Handling

All Paystack webhooks go to `POST /api/webhooks/paystack`:

1. Verify webhook signature (Paystack secret key)
2. Check event type (`charge.success`, `subscription.create`, etc.)
3. Idempotent processing — check if `paystack_reference` already recorded
4. Forward to Edge Function for final processing
5. Create/update relevant records

### Idempotency

- All purchase recording is idempotent via `paystack_reference` uniqueness
- Duplicate webhooks (Paystack may send multiple) are safely ignored

---

## Access Control

| Product | Access Check |
|---------|-------------|
| **University** | `subscriptions.status = 'active'` (Year 400 only) |
| **Bootcamps** | `standalone_purchases` row exists |
| **Internship** | `internship_applications` status = `paid` |

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Payment fails | User sees error, no record created, can retry |
| Webhook fails | Edge Function retries; manual reconciliation in admin |
| Duplicate payment | Idempotency check prevents double recording |
| Refund | Admin manually processes; subscription marked `cancelled` |

---

## See Also

- [University Pricing Module](../university/modules/module-15-pricing-and-subscription.md)
- [Bootcamps Purchase Module](../bootcamps/modules/module-04-purchase.md)
- [Internship Application Module](../internship/modules/module-02-application.md)
