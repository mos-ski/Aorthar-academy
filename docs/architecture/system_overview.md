# System Architecture Overview — Aorthar Academy

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            Vercel Edge Network                           │
│                                                                          │
│  ┌─────────────────────┐              ┌─────────────────────────────┐   │
│  │  aorthar.com        │              │  courses.aorthar.com        │   │
│  │  (University)       │              │  (Standalone Courses)       │   │
│  │                     │              │                             │   │
│  │  Next.js 16 SSR     │              │  Next.js 16 SSR             │   │
│  │  (same codebase)    │              │  (same codebase)            │   │
│  └──────────┬──────────┘              └──────────┬──────────────────┘   │
│             │                                     │                      │
│             └──────────────┬──────────────────────┘                      │
│                            │                                              │
│                   ┌────────▼────────┐                                    │
│                   │  Next.js App    │                                    │
│                   │  Router         │                                    │
│                   │                 │                                    │
│                   │  Route Groups:  │                                    │
│                   │  - (auth)       │                                    │
│                   │  - (dashboard)  │                                    │
│                   │  - (classroom)  │                                    │
│                   │  - (admin)      │                                    │
│                   │  - (courses-app)│                                    │
│                   │  - university   │                                    │
│                   │  - root         │                                    │
│                   └────────┬────────┘                                    │
└────────────────────────────┼──────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───────┐ ┌───▼──────┐ ┌────▼───────┐
     │  Supabase      │ │ Paystack │ │  Resend    │
     │                │ │          │ │            │
     │  • Auth        │ │ Payments │ │  Email     │
     │  • Postgres    │ │ Webhooks │ │  Templates │
     │  • Edge Fns    │ │ NGN      │ │            │
     │  • Storage     │ │          │ │            │
     └────────┬───────┘ └──────────┘ └────────────┘
              │
     ┌────────▼───────┐
     │  Gemini AI     │
     │  (generative)  │
     │                │
     │  • Summaries   │
     │  • Related     │
     │  • Deep-dives  │
     │  • Quiz gen    │
     └────────────────┘
```

---

## Data Flow

### Authentication Flow
```
Client → Supabase Auth → Session cookie (.aorthar.com) → 
Next.js middleware validates → Server Component fetches profile → 
Render page
```

### Payment Flow (Standalone)
```
Client → POST /api/standalone/checkout → Paystack → 
User pays → Two paths:
  1. Redirect → GET /api/standalone/verify-payment → Record purchase
  2. Webhook → POST /api/webhooks/paystack → Record purchase (idempotent)
→ Access granted
```

### Payment Flow (University Subscription)
```
Client → POST /api/payments/checkout → Paystack → 
User pays → Webhook → POST /api/webhooks/paystack → 
Forward to Edge Function (verify-payment) → 
Create subscription + transaction → Access granted
```

### Quiz Flow
```
Client → POST /api/quiz/start → Create attempt → 
Return shuffled questions (no correct answers) → 
Client displays quiz → User answers → 
POST /api/quiz/submit → Edge Function (grade-quiz) → 
Server-side grading → Return score + cooldown
```

---

## Database Schema Overview

### Core Entities
```
auth.users ──1:1──→ profiles ──1:N──→ enrollments ──N:1──→ courses
     │                    │                                      │
     │                    │                                      │
     ├──1:N──→ quiz_attempts          courses ──1:N──→ lessons ──1:N──→ resources
     │                    │                   │
     │                    │                   └──1:N──→ questions
     ├──1:N──→ course_grades
     │                    courses ──N:N──→ course_prerequisites
     ├──1:N──→ semester_gpas
     │
     ├──1:N──→ capstone_submissions
     │
     ├──1:N──→ suggestions ──1:N──→ suggestion_votes
     │
     ├──1:N──→ subscriptions
     │
     ├──1:N──→ transactions
     │
     ├──1:N──→ standalone_purchases ──N:1──→ standalone_courses
     │                                                  │
     │                                                  └──1:N──→ standalone_lessons
     │
     └──1:N──→ standalone_lesson_progress
```

### Key Tables Summary
| Table | Purpose | Row Count (est.) |
|-------|---------|-------------------|
| profiles | User profiles with roles | 100–1,000 |
| courses | University courses | 31+ |
| lessons | Course lessons | 200+ |
| questions | Quiz/exam question bank | 1,000+ |
| quiz_attempts | Student quiz attempts | 1,000+ |
| course_grades | Final grades per course | 500+ |
| standalone_courses | Pay-per-course offerings | 5–20 |
| standalone_purchases | Course purchase records | 100+ |
| subscriptions | Premium subscriptions | 50+ |
| transactions | Payment records | 200+ |
| audit_log | Admin action log | 500+ |

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│              Vercel                      │
│                                          │
│  Production: aorthar.com                │
│  Staging: staging.aorthar.com           │
│  Courses: courses.aorthar.com           │
│                                          │
│  Environment Variables:                 │
│  - NEXT_PUBLIC_SUPABASE_URL             │
│  - NEXT_PUBLIC_SUPABASE_ANON_KEY        │
│  - SUPABASE_SERVICE_ROLE_KEY            │
│  - PAYSTACK_SECRET_KEY                  │
│  - PAYSTACK_PUBLIC_KEY                  │
│  - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY      │
│  - PAYSTACK_WEBHOOK_SECRET              │
│  - GEMINI_API_KEY                       │
│  - RESEND_API_KEY                       │
│  - NEXT_PUBLIC_APP_ENV                  │
└─────────────────────────────────────────┘
              │
     ┌────────▼────────┐
     │  Supabase       │
     │  (Production)   │
     │                 │
     │  Project URL    │
     │  Database       │
     │  Auth           │
     │  Edge Functions │
     │  Storage        │
     └─────────────────┘
```

---

## Security Model

### Authentication
- Supabase Auth (email/password)
- Email verification required
- Session cookies with `.aorthar.com` domain for cross-subdomain access
- httpOnly, secure, sameSite=lax cookies

### Authorization
- Role-based: student, contributor, admin
- Admin levels: super_admin, content_admin, finance_admin
- Row Level Security (RLS) on all tables
- `is_admin()` and `is_premium()` helper functions
- Admin route guard (disabled in development)

### Data Protection
- Service role key only used server-side
- RLS prevents cross-user data access
- Audit log is append-only
- Payment data stored with Paystack references (no card data)

---

## Performance Considerations

| Area | Current State | Target |
|------|---------------|--------|
| Page load (SSR) | 1–3s | < 1s |
| API response | 200–500ms | < 200ms |
| Quiz grading | 1–3s (Edge Function) | < 1s |
| Email delivery | 1–30s (Resend) | < 10s |
| Video load | Depends on YouTube/Drive | N/A (external) |
| Admin table load | Full query (limit 100) | Paginated |
