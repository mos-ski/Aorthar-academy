# Internship Product — Architecture

**Last Updated:** 2026-04-03

---

## Route Structure

```
internship.aorthar.com/
├── /                          # Landing page
├── /apply                     # Application portal
│   └── /buy-form             # Paystack checkout for 10k form
├── /quiz                      # Exam portal
│   ├── /enter                 # Name + Code entry
│   └── /take                  # Active exam session
└── /results                   # Results page (for applicants)
```

---

## Data Model

### internship_cohorts

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | e.g. "Q1 2026 Cohort" |
| `status` | TEXT | `registration_open` / `registration_closed` / `exam_window` / `grading` / `results_published` / `placements_active` / `completed` |
| `application_open_at` | TIMESTAMPTZ | When applications open |
| `application_close_at` | TIMESTAMPTZ | When applications close |
| `exam_open_at` | TIMESTAMPTZ | When exam window opens |
| `exam_close_at` | TIMESTAMPTZ | When exam window closes |
| `max_interns` | INTEGER | Default 10 |
| `created_at` | TIMESTAMPTZ | Creation time |

### internship_applications

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles (nullable — can apply without account) |
| `cohort_id` | UUID | FK to internship_cohorts |
| `full_name` | TEXT | Applicant name |
| `email` | TEXT | Applicant email |
| `access_code` | TEXT | Unique code for exam entry |
| `payment_status` | TEXT | `pending` / `paid` / `failed` |
| `paystack_reference` | TEXT | Paystack transaction reference |
| `exam_status` | TEXT | `not_started` / `in_progress` / `submitted` / `graded` |
| `exam_score` | DECIMAL | Percentage score |
| `selected` | BOOLEAN | True if in top 10 |
| `applied_at` | TIMESTAMPTZ | Application timestamp |

### internship_exam_results

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `application_id` | UUID | FK to internship_applications |
| `answers` | JSONB | Exam answers |
| `score` | DECIMAL | Calculated score |
| `submitted_at` | TIMESTAMPTZ | Submission time |
| `duration_minutes` | INTEGER | Time taken |

### internship_placements

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `application_id` | UUID | FK to internship_applications |
| `startup_name` | TEXT | Startup name |
| `role` | TEXT | Intern role (e.g. "Product Design Intern") |
| `start_date` | DATE | Placement start |
| `end_date` | DATE | Placement end (3 months later) |
| `status` | TEXT | `pending` / `active` / `completed` / `terminated` |
| `certificate_issued` | BOOLEAN | Whether certificate was issued |
| `certificate_url` | TEXT | Certificate PDF/storage URL |

---

## Auth Model

- **Public access**: Landing page, application form, cohort info
- **Auth required**: Exam entry (name + code — no Supabase auth needed for exam)
- **Admin access**: All management features at `aorthar.com/admin/internship/**`

### Exam Entry Flow (No Auth Required)

```
Enter Name + Access Code →
System validates code against paid applications →
Start exam session (session stored in server memory/DB) →
Submit answers → Score calculated → Session closed
```

This allows applicants to take the exam without creating an account.

---

## Payment Integration

- Application form: ₦10,000 via Paystack
- `POST /api/internship/checkout` → Paystack → Webhook → Create application record
- Paid applicants receive a unique `access_code` via email
- Access code is required to enter the exam

---

## RLS Policies

| Table | Policy |
|-------|--------|
| `internship_cohorts` | Public read |
| `internship_applications` | Admin read/write; user read own |
| `internship_exam_results` | Admin read/write |
| `internship_placements` | Admin read/write |

---

## See Also

- [Internship Overview](./00-overview.md)
- [Shared Payments](../_shared/03-payments.md)
- [Shared Admin CMS](../_shared/04-admin-cms.md)
