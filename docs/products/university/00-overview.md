# University Product — Overview

**Last Updated:** 2026-04-03

---

## What It Is

The Aorthar University is a **structured 4-year academic program** modeled after a real university. Students enroll in a department, progress through year-by-year curricula, take assessments, earn a CGPA, and submit a capstone project to graduate.

---

## Goals

1. Provide a structured, progression-based learning experience
2. Track academic performance via GPA on a 5.0 scale
3. Offer a free tier (Years 100-300) and premium tier (Year 400 + capstone)
4. Build a community of product professionals through open-source curriculum contributions

---

## User Personas

| Persona | Description |
|---------|-------------|
| **Student (Year 100-300)** | Free access, progressing through curriculum. Takes quizzes, exams, earns grades. |
| **Student (Year 400)** | Premium subscription required. Takes advanced courses + capstone. |
| **Contributor** | A student with 3+ approved suggestions. Auto-promoted. Can propose curriculum additions. |
| **Admin** | Manages curriculum, courses, assessments, users, payments. |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Departments** | 8 (Product Design, Frontend, Backend, PM, Operations, UI/UX, Scrum, QA) |
| **Years** | 4 (100, 200, 300, 400) |
| **Semesters per Year** | 2 |
| **Courses per Semester** | 3-5 |
| **Classes per Course** | 3-5 |
| **GPA Scale** | 5.0 (A+ = 5.0, F = 0.0) |
| **Pass Mark** | 60% default |
| **Quiz Attempts** | 3 max, 24-hour cooldown |
| **Exam Attempts** | 3 max, 24-hour cooldown |
| **Capstone Requirement** | Year 400 + premium + GPA ≥ 3.5 |

---

## Academic Hierarchy

```
Department
  └── Year (100, 200, 300, 400)
        └── Semester (1, 2)
              └── Course (e.g. DES101)
                    ├── Classes (lessons with YouTube videos + notes)
                    ├── Quiz (per course)
                    └── Exam (per course, end of semester)
```

---

## Progression Rules

| Rule | Condition |
|------|-----------|
| Unlock Semester 2 | All Semester 1 courses passed (≥60%) |
| Unlock Year 200 | All Year 100 courses passed |
| Unlock Year 300 | All Year 200 courses passed |
| Unlock Year 400 | All Year 300 courses passed + premium subscription |
| Capstone Eligible | Year 400 + premium + GPA ≥ 3.5 |
| Graduation | All Year 400 passed + capstone approved |

---

## Assessment Engine

### Quiz

- Taken per course (not per class)
- Question types: Multiple choice, ordering, matching
- Max 3 attempts, 24-hour cooldown after failure
- Server-side grading (anti-cheat)
- Randomized question + option order

### Exam

- Taken at end of semester (covers all courses)
- 90-minute timed exam
- 50 questions default
- Same attempt limits as quiz
- Final course grade = (quiz_weight × quiz_score) + (exam_weight × exam_score)

### GPA Calculation

| Grade | Points | Percentage |
|-------|--------|------------|
| A+ | 5.0 | 90-100% |
| A | 4.5 | 85-89% |
| B+ | 4.0 | 80-84% |
| B | 3.5 | 75-79% |
| C+ | 3.0 | 70-74% |
| C | 2.5 | 65-69% |
| D | 2.0 | 60-64% |
| F | 0.0 | Below 60% |

---

## Monetization

| Plan | Access |
|------|--------|
| **Free** | Years 100-300 (all departments) |
| **Semester** | Year 400 + capstone (one semester) |
| **Monthly** | Year 400 + capstone (monthly) |
| **Yearly** | Year 400 + capstone (one year) |
| **Lifetime** | Year 400 + capstone (forever) |

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Subdomain | `university.aorthar.com` (main) |
| Frontend | Next.js App Router |
| Route Groups | `(dashboard)`, `(classroom)`, `(admin)` |
| Auth | Supabase Auth (SSO) |
| Payments | Paystack (subscriptions) |
| AI | Gemini (lesson summaries, related content) |
| Email | Resend |

---

## Database Tables

### Academic Structure
- `years`, `semesters`, `courses`, `lessons`, `resources`
- `course_prerequisites`, `specialization_tracks`, `course_tracks`

### Identity
- `profiles`, `auth.users`

### Assessment
- `questions`, `quiz_attempts`, `course_grades`, `semester_gpas`, `cumulative_gpas`

### Progression
- `enrollments`, `user_progress`, `semester_progress`

### Capstone
- `capstone_submissions`

### Community
- `suggestions`, `suggestion_votes`, `lesson_reactions`, `lesson_comments`

### Billing
- `plans`, `subscriptions`, `transactions`

---

## Modules

The University product is documented in 20 modules in the `modules/` folder:

| Module | Description |
|--------|-------------|
| 01 | Home & Landing |
| 02-04 | Authentication (sign-in, sign-up, verify) |
| 05 | Onboarding (department selection) |
| 06 | Dashboard |
| 07 | Course Catalog |
| 08 | Classroom (Course Player) |
| 09 | Quiz & Assessment |
| 10 | Progress Tracking |
| 11 | GPA & Grades |
| 12 | Capstone |
| 13 | Suggest Content |
| 14 | Settings |
| 15 | Pricing & Subscription |
| 16 | Unauthorized Page |
| 17 | Admin Console |
| 18 | Content Governance |
| 19 | API Services Map |
| 20 | Data Model Map |

---

## Curriculum

Department-specific curriculum roadmaps are in the `curriculum/` folder:

- [Product Design](./curriculum/product-design.md) ✅
- [Frontend Engineering](./curriculum/frontend.md) 🚧
- [Backend Engineering](./curriculum/backend.md) 🚧
- [Product Management](./curriculum/product-management.md) 🚧
- [Operations](./curriculum/operations.md) 🚧
- And more...

---

## See Also

- [University Architecture](./01-architecture.md)
- [University User Stories](./02-user-stories.md)
- [Shared Auth](../_shared/02-auth-sso.md)
- [Shared Payments](../_shared/03-payments.md)
