# University Product — Architecture

**Last Updated:** 2026-04-03

---

## Route Structure

```
university.aorthar.com/
├── /                              # Main landing (shared)
├── /register                      # Registration (shared)
├── /login                         # Login (shared)
├── /verify                        # Email verification (shared)
├── /onboarding                    # Department selection
├── /pricing                       # Subscription plans
├── /dashboard                     # Student dashboard
├── /courses                       # Course catalog by year/semester
├── /courses/[courseId]            # Course detail
├── /classroom/[courseId]          # Full-screen course viewer
├── /classroom/[courseId]/quiz/[attemptId] # Quiz page
├── /progress                      # Progress overview
├── /gpa                           # GPA & grades
├── /capstone                      # Capstone submission
├── /suggest                       # Content suggestions
├── /settings                      # Account settings
└── /admin/**                      # Admin CMS
```

---

## Route Groups

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(auth)` | `/login`, `/register`, `/verify` | Public | Authentication |
| `(dashboard)` | `/dashboard`, `/courses`, `/progress`, `/gpa`, `/capstone`, `/settings` | Required + onboarding gate | Student app |
| `(classroom)` | `/classroom/[courseId]` | Required | Full-screen viewer |
| `(admin)` | `admin.aorthar.com/**` | Required (admin guard, disabled in dev) | Admin CMS |
| root | `/`, `/pricing`, `/onboarding` | Public | Landing, pricing, onboarding |

---

## Data Model

### Academic Hierarchy

```
department
  └── year (100, 200, 300, 400)
        └── semester (1, 2)
              └── course (DES101, PM202, etc.)
                    ├── lesson (Class 1, Class 2, ...)
                    │     └── resource (YouTube, link, document)
                    └── question (quiz/exam bank)
```

### Key Tables

| Table | Columns |
|-------|---------|
| `years` | `id`, `level` (100-400), `name`, `display_order` |
| `semesters` | `id`, `year_id`, `number` (1-2), `display_order` |
| `courses` | `id`, `semester_id`, `code`, `name`, `description`, `credit_units`, `pass_mark`, `quiz_weight`, `exam_weight`, `is_premium`, `status` |
| `lessons` | `id`, `course_id`, `title`, `content` (Markdown), `sort_order`, `duration_minutes` |
| `resources` | `id`, `lesson_id`, `type` (youtube/link/document), `url`, `title`, `sort_order` |
| `questions` | `id`, `course_id`, `type` (quiz/exam), `question_text`, `options` (JSONB), `points`, `difficulty` |

### Student State

| Table | Purpose |
|-------|---------|
| `enrollments` | Which courses a student is enrolled in |
| `user_progress` | Per-course progress (not started / in progress / passed / failed) |
| `semester_progress` | Per-semester completion tracking |
| `quiz_attempts` | Quiz/exam attempt records with scores |
| `course_grades` | Final grade per course (quiz + exam weighted) |
| `semester_gpas` | GPA per semester |
| `cumulative_gpas` | Overall CGPA |

### Profile

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | FK to auth.users |
| `full_name` | TEXT | Display name |
| `email` | TEXT | Login email |
| `role` | TEXT | `student` / `contributor` / `admin` |
| `department` | TEXT | Enrolled department |
| `onboarding_completed_at` | TIMESTAMPTZ | NULL until onboarding done |

---

## Middleware Guards

| Route Group | Guard |
|-------------|-------|
| `(auth)` | Public |
| `(dashboard)` | Auth required + onboarding gate (redirect to `/onboarding` if `department IS NULL`) |
| `(classroom)` | Auth required |
| `(admin)` | Auth required + admin role (disabled when `NEXT_PUBLIC_APP_ENV=development`) |
| `/pricing` | Public |
| `/onboarding` | Auth required (redirect to `/dashboard` if already onboarded) |

---

## Progression Engine

### Unlock Logic

```
Semester 2 unlocked when:
  All courses in Semester 1 have course_grades.grade >= pass_mark

Year 200 unlocked when:
  All Year 100 semesters are complete

Year 300 unlocked when:
  All Year 200 semesters are complete

Year 400 unlocked when:
  All Year 300 semesters are complete
  AND subscription.status = 'active'
```

### Grade Calculation

```
final_grade = (quiz_weight × quiz_score) + (exam_weight × exam_score)
pass if: final_grade >= pass_mark (default 60%)
```

### GPA Calculation

```
course_points = grade_to_points(final_grade)  # 5.0 scale
semester_gpa = SUM(course_points × credit_units) / SUM(credit_units)
cumulative_gpa = SUM(all course_points × credit_units) / SUM(all credit_units)
```

---

## RLS Policies Summary

| Table | Read | Write |
|-------|------|-------|
| `years`, `semesters` | Public | Admin only |
| `courses` | Published = public | Admin only |
| `lessons`, `resources` | Published = enrolled users | Admin only |
| `questions` | No direct read (served via quiz API) | Admin only |
| `quiz_attempts` | User own only | Via quiz API only |
| `course_grades` | User own only | System (server-side) |
| `semester_gpas`, `cumulative_gpas` | User own only | System (server-side) |
| `profiles` | User own + admin all | User own + admin |
| `subscriptions` | User own + admin all | System (via webhook) |

---

## API Routes

### Learning
- `GET /api/lessons/summary` — AI lesson summary
- `GET /api/lessons/related` — Related content
- `GET /api/lessons/deep-dive` — Supplemental links
- `POST /api/lessons/reaction` — Like/dislike
- `POST /api/lessons/comments` — Comments
- `POST /api/lessons/comments/reaction` — Comment reactions

### Assessment
- `POST /api/quiz/start` — Start attempt
- `POST /api/quiz/generate` — Generate fallback questions
- `POST /api/quiz/submit` — Submit & grade
- `GET /api/quiz/attempt/[id]` — Attempt state
- `GET /api/quiz/attempt/[id]/solutions` — Review solutions

### Student Lifecycle
- `POST /api/onboarding/complete` — Complete onboarding
- `POST /api/suggestions` — Submit suggestion
- `POST /api/capstone/submit` — Submit capstone
- `POST /api/unlock-next-level` — Check & unlock next level

### Billing
- `POST /api/payments/checkout` — Initiate subscription
- `POST /api/webhooks/paystack` — Payment webhook

---

## See Also

- [University Overview](./00-overview.md)
- [Shared Auth](../_shared/02-auth-sso.md)
- [Shared Payments](../_shared/03-payments.md)
