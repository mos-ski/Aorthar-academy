# Module 02: Application Form Purchase

## Overview

Applicants purchase a ₦10,000 application form via Paystack to register for the next cohort. Upon successful payment, they receive a unique access code via email.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /apply` | GET | Application portal landing |
| `POST /api/internship/checkout` | POST | Initiate Paystack payment |
| `GET /api/internship/verify-payment` | GET | Verify payment and create application |
| `POST /api/webhooks/paystack` | POST | Webhook handler (idempotent) |

## Flow

```
User → /apply → Click "Buy Form" →
POST /api/internship/checkout → Paystack →
User pays →
  Path A: Redirect → GET /api/internship/verify-payment → Create application + generate code
  Path B: Webhook → POST /api/webhooks/paystack → Same (idempotent)
→ Email sent with access code → User redirected to /quiz/enter
```

## Database

### internship_applications (insert on payment)

| Column | Value |
|--------|-------|
| `user_id` | Auth user ID (if logged in) or NULL |
| `cohort_id` | Current active cohort |
| `full_name` | From Paystack metadata or form |
| `email` | From Paystack metadata or form |
| `access_code` | Auto-generated unique code |
| `payment_status` | `paid` |
| `paystack_reference` | From Paystack |
| `exam_status` | `not_started` |

## Requirements

- Payment amount: ₦10,000 (fixed, not configurable per user)
- One form per cohort per applicant (prevent duplicate purchases)
- Access code generated on successful payment
- Access code sent via email using Resend
- Idempotent webhook handling
- If registration is closed, block new purchases

## Email Template

**Subject:** Your Aorthar Internship Application Access Code

```
Hi {name},

Thank you for purchasing your application form for the {cohort_name} cohort.

Your Access Code: {access_code}

To take the exam, visit: internship.aorthar.com/quiz/enter
Enter your name and the access code above.

Exam Window: {exam_open_at} — {exam_close_at}

Good luck!
The Aorthar Team
```

## See Also

- [Shared Payments](../../_shared/03-payments.md)
- [Exam Module](./module-03-quiz.md)
