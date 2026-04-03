# Aorthar Academy — Documentation

**Last Updated:** 2026-04-03

---

## Quick Start

| If you want to... | Go to... |
|-------------------|----------|
| Understand the whole product | [Product Overview](./products/_shared/01-overview.md) |
| See all database tables | [Database Schema](./platform/database-schema.md) |
| See all API routes | [API Reference](./platform/api-reference.md) |
| See what's built vs what's next | [Gap Analysis](./analysis/gap-analysis.md) |
| See the quarterly roadmap | [Roadmap](./analysis/roadmap.md) |
| See technical debt | [Tech Debt](./analysis/tech-debt.md) |

---

## Products

Aorthar has **three products** plus a marketing site and admin CMS, each on its own subdomain:

### Marketing Site — `aorthar.com`
Brand awareness, product overview, and CTAs to the three products.

### Internship — `internship.aorthar.com`
Quarterly cohort program. Applicants buy a form (₦10k), take an online exam, top 10 get placed at startups for 3 months.

- [Overview](./products/internship/00-overview.md)
- [Architecture](./products/internship/01-architecture.md)
- [User Stories](./products/internship/02-user-stories.md)
- **Modules:**
  - [01 — Landing](./products/internship/modules/module-01-landing.md)
  - [02 — Application (Form Purchase)](./products/internship/modules/module-02-application.md)
  - [03 — Online Exam](./products/internship/modules/module-03-quiz.md)
  - [04 — Results & Placement](./products/internship/modules/module-04-results.md)

### University — `university.aorthar.com`
4-year structured academic program. Students enroll in a department, progress through curricula, take assessments, earn CGPA, submit capstone.

- [Overview](./products/university/00-overview.md)
- [Architecture](./products/university/01-architecture.md)
- [User Stories](./products/university/02-user-stories.md)
- **Curriculum:**
  - [Product Design](./products/university/curriculum/product-design.md) ✅
  - [Frontend Engineering](./products/university/curriculum/frontend.md) 🚧
  - [Backend Engineering](./products/university/curriculum/backend.md) 🚧
  - [Product Management](./products/university/curriculum/product-management.md) 🚧
  - [Operations](./products/university/curriculum/operations.md) 🚧
  - [UI/UX Design](./products/university/curriculum/ui-ux-design.md) 🚧
  - [Scrum](./products/university/curriculum/scrum.md) 🚧
  - [QA](./products/university/curriculum/qa.md) 🚧
- **Modules (20):** [See modules folder](./products/university/modules/)

### Bootcamps — `bootcamp.aorthar.com`
Self-paced, pay-per-course learning with permanent access. Buy once, learn forever.

- [Overview](./products/bootcamps/00-overview.md)
- [Architecture](./products/bootcamps/01-architecture.md)
- [User Stories](./products/bootcamps/02-user-stories.md)
- **Modules:**
  - [01 — Catalog](./products/bootcamps/modules/module-01-catalog.md)
  - [02 — Detail](./products/bootcamps/modules/module-02-detail.md)
  - [03 — Lesson Player](./products/bootcamps/modules/module-03-player.md)
  - [04 — Purchase](./products/bootcamps/modules/module-04-purchase.md)
  - [05 — Progress & Certificate](./products/bootcamps/modules/module-05-progress.md)

---

## Shared (Cross-Product)

Documentation that applies to all products:

- [01 — Product Overview](./products/_shared/01-overview.md) — 3-product architecture, SSO, relationships
- [02 — Auth & SSO](./products/_shared/02-auth-sso.md) — Shared Supabase Auth
- [03 — Payments](./products/_shared/03-payments.md) — Paystack for all products
- [04 — Admin CMS](./products/_shared/04-admin-cms.md) — Shared admin management
- [05 — Landing Pages](./products/_shared/05-landing.md) — Public-facing pages

---

## Platform

Technical reference docs:

- [Database Schema](./platform/database-schema.md) — All tables, all products
- [API Reference](./platform/api-reference.md) — All routes grouped by product
- [RLS Policies](./platform/rls-policies.md) — Row Level Security inventory
- [Edge Functions](./platform/edge-functions.md) — Supabase Edge Function specs
- [Email Templates](./platform/email-templates.md) — All Resend templates
- [Environment Variables](./platform/environment-vars.md) — .env reference

---

## Analysis

Product strategy and planning:

- [Roadmap](./analysis/roadmap.md) — Q1 2026 through Q4 2027
- [Gap Analysis](./analysis/gap-analysis.md) — What's missing
- [Tech Debt](./analysis/tech-debt.md) — 30 items to fix
- [Scope Control](./analysis/scope-control.md) — In vs out of scope
- [Product Recommendations](./analysis/product-recommendations.md) — Prioritized improvements

---

## QA

- [Test Cases](./qa/test-cases.md) — 93 detailed test cases + 7 regression scenarios

---

## Root-Level Files (Legacy)

These files are kept at the project root for reference. Their content has been migrated to the new structure above:

| File | Migrated To |
|------|-------------|
| `Aorthar-Academy-PRD.md` | Split across product overviews + platform docs |
| `aorthar_academy_curriculum.md` | [products/university/curriculum/product-design.md](./products/university/curriculum/product-design.md) |
| `aorthar_academy_architecture_v_1.md` | [products/university/01-architecture.md](./products/university/01-architecture.md) |
| `aorthar_dashboard_product_spec.md` | University modules |
| `Aorthar-Student-Onboarding.md` | [products/university/](./products/university/) |
| `docs/admin-cms.md` | [products/_shared/04-admin-cms.md](./products/_shared/04-admin-cms.md) |
| `docs/user-stories-student.md` | Referenced from [products/university/02-user-stories.md](./products/university/02-user-stories.md) |
| `docs/user-stories-admin.md` | Referenced from [products/university/02-user-stories.md](./products/university/02-user-stories.md) |
| `docs/modules/` | Copied to [products/university/modules/](./products/university/modules/) |
| `docs/prd/` | Merged into product overviews |
| `docs/user_stories/` | Merged into product user stories |
| `docs/architecture/` | Merged into platform + product architecture |

---

## Terminology

| Term | Meaning |
|------|---------|
| **Course** (University) | A semester-based course within a department's curriculum |
| **Class** (University) | A single lesson within a University course |
| **Bootcamp** | A standalone, pay-per-course product (not University) |
| **Lesson** (Bootcamp) | A single learning unit within a bootcamp |
| **Department** | A University specialization (Product Design, Frontend, etc.) |
| **Cohort** | An Internship group (quarterly) |
| **CGPA** | Cumulative Grade Point Average (5.0 scale) |
