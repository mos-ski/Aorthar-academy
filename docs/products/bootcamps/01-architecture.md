# Bootcamps Product — Architecture

**Last Updated:** 2026-04-03

---

## Route Structure

```
courses.aorthar.com/
├── /                              # Bootcamp catalog landing
├── /courses-app/                  # Catalog browse
├── /courses-app/[courseId]        # Bootcamp detail page
├── /courses-app/[courseId]/player # Lesson player
└── /courses-app/[courseId]/checkout # Purchase flow (redirects to Paystack)
```

---

## Data Model

### standalone_courses

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Bootcamp title (e.g. "Figma Masterclass") |
| `description` | TEXT | Long description (Markdown) |
| `thumbnail_url` | TEXT | Cover image URL |
| `price` | INTEGER | Price in kobo |
| `currency` | TEXT | `NGN` |
| `status` | TEXT | `draft` / `published` / `unpublished` |
| `sort_order` | INTEGER | Display order in catalog |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### standalone_lessons

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `course_id` | UUID | FK to standalone_courses |
| `title` | TEXT | Lesson title |
| `content` | TEXT | Lesson notes (Markdown) |
| `video_url` | TEXT | YouTube embed URL |
| `sort_order` | INTEGER | Display order |
| `duration_minutes` | INTEGER | Estimated duration |
| `is_published` | BOOLEAN | Visibility flag |
| `created_at` | TIMESTAMPTZ | Creation time |

### standalone_purchases

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `course_id` | UUID | FK to standalone_courses |
| `amount` | INTEGER | Amount paid in kobo |
| `paystack_reference` | TEXT | Paystack transaction reference |
| `purchased_at` | TIMESTAMPTZ | Purchase timestamp |

### standalone_lesson_progress

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `lesson_id` | UUID | FK to standalone_lessons |
| `completed` | BOOLEAN | Whether lesson is marked complete |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

**Unique constraint:** `(user_id, lesson_id)` — one progress row per user per lesson

---

## Auth Model

- **Public access**: Landing page, catalog, bootcamp detail pages
- **Auth required**: Purchase, lesson access, progress tracking
- Users can browse bootcamps without an account
- Account creation happens at checkout (or can be done beforehand)

---

## Payment Integration

- One-time purchase per bootcamp
- `POST /api/standalone/checkout` → Paystack →
- Two verification paths:
  1. Redirect → `GET /api/standalone/verify-payment`
  2. Webhook → `POST /api/webhooks/paystack`
- Both paths are idempotent via `paystack_reference`
- On successful payment: create `standalone_purchases` record

---

## Progress Tracking

- Each lesson has a "Mark as Complete" button
- Completion is tracked in `standalone_lesson_progress`
- Progress percentage = (completed lessons / total lessons) × 100
- When all lessons are complete → certificate becomes available

---

## RLS Policies

| Table | Policy |
|-------|--------|
| `standalone_courses` | Public read (published only) |
| `standalone_lessons` | Public read (published only) |
| `standalone_purchases` | User read own; admin read all |
| `standalone_lesson_progress` | User read/write own; admin read all |

---

## See Also

- [Bootcamps Overview](./00-overview.md)
- [Shared Payments](../_shared/03-payments.md)
