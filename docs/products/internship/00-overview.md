# Internship Product — Overview

**Last Updated:** 2026-04-03

---

## What It Is

The Aorthar Internship is a **quarterly cohort program** that trains early-career product talent and places them in startups for a 3-month internship. It is completely separate from the University and Bootcamps products.

---

## Goals

1. Attract talented early-career individuals interested in product roles
2. Assess applicants fairly through an online exam
3. Select the top performers (top 10 per cohort)
4. Place interns at partner startups for 3-month internships
5. Issue certifications upon completion

---

## User Personas

| Persona | Description |
|---------|-------------|
| **Applicant** | Early-career individual interested in product roles. Buys a form, takes the exam, waits for results. |
| **Intern** | Selected applicant (top 10). Undergoes 3-month placement at a startup. Receives certificate. |
| **Admin** | Manages cohorts, reviews exam results, selects top performers, manages placements. |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Application Fee** | ₦10,000 (one-time per cohort) |
| **Cohort Frequency** | Quarterly (4x per year) |
| **Selection Size** | Top 10 per cohort |
| **Placement Duration** | 3 months |
| **Exam Format** | Online MCQ + essay (90 minutes) |
| **Exam Location** | `internship.aorthar.com/quiz` |

---

## Application Flow

```
Visit internship.aorthar.com →
Click "Apply" → Buy application form (₦10,000 via Paystack) →
Enter Name + Access Code → Take Exam (90 min) →
Submit → Wait for results (email notification) →
Top 10 selected → Placement at startup (3 months) → Certificate
```

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Subdomain | `internship.aorthar.com` |
| Frontend | Next.js App Router (same codebase) |
| Route Group | `(internship)` |
| Auth | Shared Supabase Auth (SSO) |
| Payments | Paystack (application form purchase) |
| Exam | Online MCQ + essay via platform |
| Email | Resend (results notification) |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `internship_cohorts` | Cohort metadata (name, application open/close dates, status) |
| `internship_applications` | Application records (user, cohort, payment status, exam status) |
| `internship_exam_results` | Exam scores and submission data |
| `internship_placements` | Startup placement records (intern, startup, start/end dates, status) |

---

## Cohort Lifecycle

| Phase | Description |
|-------|-------------|
| **Registration Open** | Application forms available for purchase |
| **Registration Closed** | No new applications accepted |
| **Exam Window** | Applicants who paid can access the exam |
| **Grading** | Admin reviews all submissions |
| **Results** | Top 10 announced via email |
| **Placement** | Selected interns matched with startups |
| **Active** | 3-month internship period |
| **Completed** | Certificates issued |

---

## See Also

- [Internship Architecture](./01-architecture.md)
- [Internship User Stories](./02-user-stories.md)
- [Shared Auth](../_shared/02-auth-sso.md)
- [Shared Payments](../_shared/03-payments.md)
