# Admin CMS — Shared Spec

**Last Updated:** 2026-04-03

---

## Overview

One admin CMS at `admin.aorthar.com` manages all three products. Admins use the same login credentials (SSO) and can switch between product management views.

---

## Admin Levels

| Level | Permissions |
|-------|-------------|
| **Super** | Full access — all features, user management, audit logs |
| **Content** | Courses, lessons, questions, curriculum, suggestions, capstone |
| **Finance** | Payments, transactions, pricing, audit logs |

---

## Product Management Sections

### Internship Management

| Feature | Route | Description |
|---------|-------|-------------|
| Applications | `/admin/internship/applications` | View all applicants, filter by status |
| Exam Results | `/admin/internship/results` | View scores, select top 10 |
| Cohorts | `/admin/internship/cohorts` | Open/close registration windows |
| Placements | `/admin/internship/placements` | Track startup placements |

### University Management

| Feature | Route | Description |
|---------|-------|-------------|
| Curriculum | `/admin/curriculum` | Year/semester structure CRUD |
| Courses | `/admin/courses` | Course list + inline editing |
| Course Detail | `/admin/courses/[courseId]` | Lessons, quiz, exam, settings tabs |
| Users | `/admin/users` | Search, filter, role changes |
| Suggestions | `/admin/suggestions` | Review and approve/reject |
| Capstone | `/admin/capstone` | Review and pass/fail submissions |
| Payments | `/admin/payments` | Transaction audit |

### Bootcamps Management

| Feature | Route | Description |
|---------|-------|-------------|
| Bootcamp List | `/admin/bootcamps` | All bootcamps, status, pricing |
| Bootcamp Detail | `/admin/bootcamps/[id]` | Lessons, pricing, settings |
| Purchases | `/admin/bootcamps/purchases` | Purchase history |

---

## Admin Access Control

### Guard

- All `/admin/**` routes require authentication
- Admin role check in middleware (`requireRole('admin')`)
- **Disabled in development** (`NEXT_PUBLIC_APP_ENV=development`)
- In staging/production, non-admins are redirected to `/unauthorized`

### RLS Bypass

- Admin write operations use `createAdminClient()` (bypasses Row Level Security)
- Read operations use `createClient()` (respects RLS)

---

## Audit Logging

All admin actions are logged to the `audit_log` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `admin_id` | UUID | Admin who performed action |
| `action` | TEXT | e.g. `course.update`, `user.role_change` |
| `target_type` | TEXT | e.g. `course`, `user`, `question` |
| `target_id` | UUID | ID of the affected record |
| `changes` | JSONB | Before/after snapshot |
| `created_at` | TIMESTAMPTZ | Action timestamp |

---

## Admin Update Principles

1. Never hard-delete graded records
2. Use draft → publish lifecycle for course changes
3. Keep stable course codes (e.g. `DES101`) as external references
4. Version assessment content when changing answer keys
5. Track update owner and timestamp for every admin change

---

## See Also

- [Admin CMS Implementation](/docs/admin-cms.md) (implementation reference)
- [Admin User Stories](/docs/user-stories-admin.md)
- [University Admin Modules](../university/modules/)
