# Authentication & SSO — Shared Auth Spec

**Last Updated:** 2026-04-03

---

## Overview

All Aorthar subdomains share a single authentication system powered by Supabase Auth with cross-subdomain session sharing via `.aorthar.com` cookies.

### Subdomains Sharing Auth

| Subdomain | Product | Auth Required |
|-----------|---------|---------------|
| `aorthar.com` | Marketing Site | Optional |
| `internship.aorthar.com` | Internship | Optional (required for exam) |
| `university.aorthar.com` | University | Required (after onboarding) |
| `bootcamp.aorthar.com` | Bootcamps | Required (for purchased access) |
| `admin.aorthar.com` | Admin CMS | Required (admin role) |

---

## User Model

### Profiles Table

Every Supabase Auth user gets a corresponding row in the `profiles` table via the `handle_new_user()` database trigger.

| Column | Type | Purpose |
|--------|------|---------|
| `user_id` | UUID (FK to auth.users) | Primary identifier |
| `full_name` | TEXT | Display name |
| `email` | TEXT | Login credential |
| `role` | TEXT | `student` / `contributor` / `admin` |
| `department` | TEXT | University enrollment (null for bootcamp/internship-only users) |
| `onboarding_completed_at` | TIMESTAMPTZ | NULL until university onboarding done |
| `created_at` | TIMESTAMPTZ | Account creation time |

### Access Flags

Access is determined by **product-specific records**, not a single flag:

| Product | Access Check |
|---------|-------------|
| **University** | `profiles.department IS NOT NULL` + `subscriptions.status = 'active'` (for Year 400) |
| **Bootcamps** | `standalone_purchases` row exists for the course |
| **Internship** | `internship_applications` row exists (paid + not expired) |
| **Admin** | `profiles.role = 'admin'` |

---

## Auth Flow

### Registration (University)

```
GET university.aorthar.com/register → Fill name, email, password, department →
POST /api/auth/callback → Email verification →
GET /onboarding → Confirm department →
POST /api/onboarding/complete → Dashboard
```

### Registration (Bootcamp)

```
GET bootcamp.aorthar.com/register → Fill name, email, password →
POST /api/auth/callback → Email verification →
Redirect to course checkout → Paystack → Course access
```

### Registration (Internship)

```
GET internship.aorthar.com/register → Fill name, email, password →
POST /api/auth/callback → Email verification →
Dashboard (apply for next cohort)
```

### Login (Shared)

```
GET aorthar.com/login → Enter email + password →
Redirect to product dashboard (or ?next URL)
```

Session cookie is set on `.aorthar.com` — valid across all subdomains.

---

## Email Verification

- Required for all registration flows
- Supabase sends verification email via Resend
- Expired links show a resend option
- Unverified users cannot access protected routes

---

## Password Reset

- `POST /api/auth/forgot-password` → Resend sends reset email
- Reset link expires after 1 hour
- New password must meet same requirements (8+ chars, uppercase, number)

---

## Session Management

| Property | Value |
|----------|-------|
| Cookie domain | `.aorthar.com` |
| Cookie secure | true |
| Cookie httpOnly | true |
| Cookie sameSite | lax |
| Session refresh | Automatic via Supabase SDK |
| Multi-device | Each device gets independent session |

---

## Route Protection

### By Subdomain

| Subdomain | Route Group | Guard |
|-----------|-------------|-------|
| `aorthar.com` | root | Public (marketing) |
| `university.aorthar.com` | `(dashboard)` | Auth required + onboarding gate |
| `university.aorthar.com` | `(classroom)` | Auth required |
| `bootcamp.aorthar.com` | `(courses-app)` | Auth required for purchase/player |
| `internship.aorthar.com` | `(internship)` | Public browsing, auth required for exam |
| `admin.aorthar.com` | `(admin)` | Auth required + admin role (disabled in dev) |
| All | `(auth)` | Public — login/register/verify |

### Suspension

- `profiles.is_suspended = true` → redirect to `/suspended`
- No bypass possible from any product

---

## See Also

- [University Auth Module](../university/modules/module-02-auth-sign-in.md)
- [University Signup Module](../university/modules/module-03-auth-sign-up.md)
- [Internship Auth Module](../internship/modules/module-01-landing.md)
- [Bootcamps Auth Module](../bootcamps/modules/module-01-catalog.md)
