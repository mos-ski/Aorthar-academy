# Bootcamps Product — Overview

**Last Updated:** 2026-04-03

---

## What It Is

Aorthar Bootcamps are **self-paced, pay-per-course learning experiences** with permanent access. Unlike the University's structured semester-based courses, bootcamps are standalone products that anyone can purchase and learn at their own speed.

---

## Goals

1. Offer focused, practical skill-building courses for working professionals
2. Provide permanent access — buy once, learn forever
3. Keep management simple — Aorthar admins create and manage all bootcamps
4. Generate revenue through one-time course purchases

---

## Terminology

| University Term | Bootcamp Term | Description |
|-----------------|---------------|-------------|
| Course | **Bootcamp** | A standalone learning product (e.g. "Figma Masterclass") |
| Class | **Lesson** | A single learning unit within a bootcamp (video + notes) |
| Semester | — | N/A — bootcamps are not semester-based |
| Quiz/Exam | — | N/A — bootcamps have no assessments |
| GPA | — | N/A — bootcamps issue completion certificates |

---

## User Personas

| Persona | Description |
|---------|-------------|
| **Learner** | Professional wanting a specific skill. Browses bootcamps, purchases one, learns at their own pace. |
| **Admin** | Creates bootcamps, adds lessons, sets pricing, manages content. |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Price model** | One-time purchase per bootcamp |
| **Access duration** | Permanent (forever) |
| **Assessment** | None — completion based on lesson progress |
| **Certificate** | Yes — issued when all lessons are completed |
| **Video source** | YouTube (embedded) |
| **Content creator** | Aorthar admins only |

---

## Purchase Flow

```
Visit courses.aorthar.com → Browse bootcamps →
Select a bootcamp → View details (lessons, price, description) →
Click "Buy Now" → Paystack checkout →
Payment successful → Permanent access granted →
Start learning → Mark lessons complete → Finish all lessons → Certificate
```

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Subdomain | `bootcamp.aorthar.com` |
| Frontend | Next.js App Router (same codebase) |
| Route Group | `(courses-app)` |
| Auth | Shared Supabase Auth (SSO) |
| Payments | Paystack (one-time purchase) |
| Content | YouTube embeds + Markdown notes |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `standalone_courses` | Bootcamp metadata (title, description, price, status) |
| `standalone_lessons` | Lessons within each bootcamp |
| `standalone_purchases` | Purchase records (user + bootcamp) |
| `standalone_lesson_progress` | Per-user per-lesson completion tracking |

---

## Bootcamp vs University Course

| Aspect | University Course | Bootcamp |
|--------|-------------------|----------|
| Structure | Year → Semester → Course → Class | Bootcamp → Lesson |
| Access model | Subscription (semester/monthly/yearly) | One-time purchase |
| Access duration | While subscribed | Permanent |
| Assessment | Quiz + Exam + GPA | None |
| Progression | Locked by prerequisites | Unlocked immediately after purchase |
| Certificate | End of year/program | End of bootcamp |
| Content creator | Aorthar (curriculum team) | Aorthar admins only |

---

## See Also

- [Bootcamps Architecture](./01-architecture.md)
- [Bootcamps User Stories](./02-user-stories.md)
- [Shared Auth](../_shared/02-auth-sso.md)
- [Shared Payments](../_shared/03-payments.md)
