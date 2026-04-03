# Module 04: Purchase & Checkout

## Overview

The payment flow for purchasing a bootcamp. One-time payment via Paystack with permanent access.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `POST /api/standalone/checkout` | POST | Initiate Paystack payment |
| `GET /api/standalone/verify-payment` | GET | Verify payment via redirect |
| `POST /api/webhooks/paystack` | POST | Webhook handler (idempotent) |

## Flow

```
User → Bootcamp detail → Click "Buy Now" →
POST /api/standalone/checkout → Paystack →
User pays →
  Path A: Redirect → GET /api/standalone/verify-payment → Create purchase record
  Path B: Webhook → POST /api/webhooks/paystack → Same (idempotent)
→ Access granted → Redirect to lesson player
```

## Database

### standalone_purchases (insert on payment)

| Column | Value |
|--------|-------|
| `user_id` | Auth user ID |
| `course_id` | Bootcamp ID |
| `amount` | Bootcamp price (from checkout request) |
| `paystack_reference` | From Paystack |
| `purchased_at` | Current timestamp |

## Requirements

- User must be authenticated before checkout
- One purchase per user per bootcamp (prevent duplicates)
- Idempotent webhook handling
- Price is set by the bootcamp (not user-configurable)
- On successful payment → create purchase record → grant access

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Already purchased | "You already own this bootcamp" → redirect to player |
| Payment fails | Error shown → can retry |
| User not logged in | Redirect to /register → return to checkout after auth |

## See Also

- [Shared Payments](../../_shared/03-payments.md)
