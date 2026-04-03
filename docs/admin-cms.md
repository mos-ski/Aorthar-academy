# Admin CMS — Implementation Reference

## What Was Built

### Phase 1 — Inline Editing (`/admin/courses/[courseId]`)

File: `src/app/(admin)/admin/courses/[courseId]/page.tsx`

The course detail page now has **4 tabs**: Lessons · Quiz · Exam · Settings

#### Lessons tab
- Each lesson row has a **pencil icon** that opens an inline edit form
- Edit fields: `title`, `duration_minutes`, `sort_order`, published checkbox, `content` (Markdown textarea)
- Save calls `PATCH /api/admin/lessons/[lessonId]`
- Each resource row also has a **pencil icon** to edit `type`, `title`, `url`
- Save calls `PATCH /api/admin/resources/[resourceId]`

#### Quiz / Exam tabs
- Each question row has a **pencil icon** that opens an inline edit form
- Edit fields: `question_text`, 4 options with correct-answer radio selector, `difficulty`
- Save calls `PATCH /api/admin/questions/[questionId]`

#### Settings tab (new)
- Full metadata form: `code`, `name`, `description`, `credit_units`, `pass_mark`
- Weights: `quiz_weight` (default 0.4), `exam_weight` (default 0.6)
- Limits: `quiz_attempt_limit`, `exam_attempt_limit`, `cooldown_hours`, `exam_duration_minutes`
- `sort_order`, `is_premium` checkbox
- Save calls `PATCH /api/admin/courses/[courseId]`

---

### Phase 2A — Course Creation

**New API route:** `src/app/api/admin/courses/route.ts`
- `POST /api/admin/courses` — inserts a new course as `status: 'draft'`
- Body: `{ semester_id, code, name, description, credit_units, pass_mark, sort_order, is_premium }`
- Uses `createAdminClient()` (bypasses RLS)

**Dialog component:** `src/app/(admin)/admin/courses/_components/NewCourseDialog.tsx`
- "+ New Course" button appears next to each "Semester N" label in `/admin/courses`
- After successful creation calls `router.refresh()` to reload the server component

**Modified:** `src/app/(admin)/admin/courses/page.tsx`
- Imports and renders `<NewCourseDialog semesterId={sem.id} nextSortOrder={...} />`

---

### Phase 2B — Curriculum Structure Page

**New page:** `src/app/(admin)/admin/curriculum/page.tsx`
- Shows the full Year → Semester hierarchy
- Add missing year levels (100 / 200 / 300 / 400) — only shows buttons for levels not yet in DB
- Add missing semesters (max 2 per year)
- Delete year or semester with a `confirm()` dialog (cascades in DB)

**New API routes:**
| Route | Method | Purpose |
|---|---|---|
| `src/app/api/admin/years/route.ts` | POST | Create a year (`level`, `name`) |
| `src/app/api/admin/years/[yearId]/route.ts` | DELETE | Delete year + cascade |
| `src/app/api/admin/semesters/route.ts` | POST | Create a semester (`year_id`, `number`) |
| `src/app/api/admin/semesters/[semesterId]/route.ts` | DELETE | Delete semester + cascade |
| `src/app/api/admin/curriculum/route.ts` | GET | Fetch all years + semesters |

All write routes use `createAdminClient()`.

**Sidebar:** `src/components/layout/Sidebar.tsx`
- Added `{ href: '/admin/curriculum', label: 'Curriculum', icon: Layers }` between Overview and Courses

---

### Phase 3 — User Search & Filtering

**New client component:** `src/app/(admin)/admin/users/_components/UsersTable.tsx`
- Accepts `users[]` as props from the server component
- Real-time search input filters by `full_name` or `email`
- Role dropdown filters by `student` / `contributor` / `admin`
- Shows `N of M users` count

**Modified:** `src/app/(admin)/admin/users/page.tsx`
- Data fetching stays server-side (unchanged)
- Replaced inline table with `<UsersTable users={rows} />`

---

## API Route Summary

| Route | Methods | File |
|---|---|---|
| `/api/admin/courses` | POST | `src/app/api/admin/courses/route.ts` |
| `/api/admin/courses/[courseId]` | GET, PATCH, DELETE | `src/app/api/admin/courses/[courseId]/route.ts` |
| `/api/admin/courses/[courseId]/lessons` | GET, POST | `src/app/api/admin/courses/[courseId]/lessons/route.ts` |
| `/api/admin/courses/[courseId]/questions` | GET, POST | `src/app/api/admin/courses/[courseId]/questions/route.ts` |
| `/api/admin/lessons/[lessonId]` | PATCH, DELETE | `src/app/api/admin/lessons/[lessonId]/route.ts` |
| `/api/admin/lessons/[lessonId]/resources` | POST | `src/app/api/admin/lessons/[lessonId]/resources/route.ts` |
| `/api/admin/resources/[resourceId]` | PATCH, DELETE | `src/app/api/admin/resources/[resourceId]/route.ts` |
| `/api/admin/questions/[questionId]` | PATCH, DELETE | `src/app/api/admin/questions/[questionId]/route.ts` |
| `/api/admin/years` | POST | `src/app/api/admin/years/route.ts` |
| `/api/admin/years/[yearId]` | DELETE | `src/app/api/admin/years/[yearId]/route.ts` |
| `/api/admin/semesters` | POST | `src/app/api/admin/semesters/route.ts` |
| `/api/admin/semesters/[semesterId]` | DELETE | `src/app/api/admin/semesters/[semesterId]/route.ts` |
| `/api/admin/curriculum` | GET | `src/app/api/admin/curriculum/route.ts` |
| `/api/admin/users/[userId]` | PATCH | `src/app/api/admin/users/[userId]/route.ts` |
| `/api/admin/users/[userId]/premium` | POST | `src/app/api/admin/users/[userId]/premium/route.ts` |

---

## Supabase Client Rules (Admin Routes)

- **Read operations** (GET) — use `createClient()` from `src/lib/supabase/server.ts`
- **Write operations** (POST, PATCH, DELETE) — use `createAdminClient()` from `src/lib/supabase/admin.ts`
  - Bypasses RLS; only safe server-side with cookie-authenticated session check first

---

## PATCH /api/admin/courses/[courseId] — Allowed Fields

```ts
['status', 'is_premium', 'pass_mark', 'name', 'code', 'description', 'credit_units',
 'quiz_weight', 'exam_weight', 'quiz_attempt_limit', 'exam_attempt_limit',
 'cooldown_hours', 'exam_duration_minutes', 'sort_order']
```

## PATCH /api/admin/lessons/[lessonId] — Allowed Fields

```ts
['title', 'content', 'sort_order', 'duration_minutes', 'is_published']
```

## PATCH /api/admin/resources/[resourceId] — Allowed Fields

```ts
['type', 'title', 'url', 'sort_order']
```

## PATCH /api/admin/questions/[questionId] — Allowed Fields

```ts
['question_text', 'options', 'points', 'shuffle_options', 'is_exam_question', 'difficulty']
```

---

## Workflow: Adding a Course End-to-End

1. Go to `/admin/curriculum` → add Year 100 → add Semester 1 and Semester 2
2. Go to `/admin/courses` → find Semester 1 → click "+ New Course" → fill form → Create
3. Course appears as `draft` in the table
4. Click the pencil icon → opens `/admin/courses/[courseId]`
5. Add lessons (Lessons tab) → add resources per lesson
6. Add quiz questions (Quiz tab) → add exam questions (Exam tab)
7. Adjust pass mark / weights / limits in Settings tab
8. Click "Publish" in the header to make the course live
