# Admin CMS — PRD

## 1. Overview

The Admin CMS is the back-office control panel for Aorthar Academy staff. It covers all content management, user management, moderation, and financial oversight. Only users with `profiles.role = 'admin'` can access it.

**Who uses it:** Aorthar staff/admins.
**Why it exists:** Students consume content that admins create and maintain. Admins also moderate contributions, review capstone submissions, manage user accounts, and monitor payments.

**Access control:**
- Middleware (`src/middleware.ts`) enforces `role = 'admin'` on all `/admin/**` routes.
- **In development** (`NEXT_PUBLIC_APP_ENV=development`): admin guard is **disabled** — any logged-in user can access `/admin`.
- In staging and production: non-admins are redirected to `/unauthorized`.
- All admin API routes use `createAdminClient()` from `src/lib/supabase/admin.ts` (bypasses RLS with `SERVICE_ROLE_KEY`).

---

## 2. Pages

### 2.1 Admin Dashboard (`/admin`)

Overview stats at a glance:
- Total students enrolled
- Courses published / draft
- Pending suggestions count
- Pending capstone submissions count
- Recent transactions (last 5)

### 2.2 Curriculum Management (`/admin/curriculum`)

Full curriculum tree: Years → Semesters → Courses.

**Features:**
- View the full curriculum hierarchy in a tree layout
- Create/edit/delete **Years** (`GET|POST /api/admin/years`, `PATCH|DELETE /api/admin/years/[yearId]`)
- Create/edit/delete **Semesters** within years (`GET|POST /api/admin/semesters`, `PATCH|DELETE /api/admin/semesters/[semesterId]`)
- Navigate to individual course management from course nodes

### 2.3 Courses Management (`/admin/courses`)

**List view:**
- Table of all courses with: code, name, year, semester, status (published/draft), question count, lesson count
- "New Course" button → `NewCourseDialog` component — inline dialog form
- Filter/search by year, semester, status

**Course Detail (`/admin/courses/[courseId]`):**
- Edit course metadata: name, code, description, credit_units, pass_mark, is_premium, status
- **Lessons tab:** ordered list of all lessons; create/reorder/edit/delete lessons
- **Questions tab:** quiz and exam questions for the course; create/edit/delete with `is_exam_question` flag
- **API routes:**
  - `GET|PATCH|DELETE /api/admin/courses/[courseId]`
  - `GET|POST /api/admin/courses/[courseId]/lessons`
  - `GET|POST /api/admin/courses/[courseId]/questions`

### 2.4 Questions Bank (`/admin/questions`)

Global view across all questions (not scoped to a single course). Useful for bulk operations, audit, and finding unassigned questions.

- Filter by course, type (quiz / exam), lesson
- Edit question text and options inline
- `PATCH|DELETE /api/admin/questions/[questionId]`

### 2.5 Lesson & Resource Management (sub-routes, no dedicated page)

Managed from within the Course Detail page:
- **Lesson edit:** `GET|PATCH|DELETE /api/admin/lessons/[lessonId]`
- **Resources for a lesson:** `GET|POST /api/admin/lessons/[lessonId]/resources`
- **Resource edit/delete:** `PATCH|DELETE /api/admin/resources/[resourceId]`

Resource types: `youtube` (embed URL), `link` (external URL), `document` (Supabase Storage file).

### 2.6 Departments (`/admin/departments`)

View and configure department metadata:
- List all 8 departments from `AORTHAR_DEPARTMENTS`
- Edit display name, description, icon (Lucide icon name)
- Link departments to Semester 1 enrollment codes (managed in `src/lib/academics/plan.ts`)

### 2.7 Users (`/admin/users`)

**List view (`UsersTable` component):**
- Paginated table: name, email, department, role, subscription status, joined date
- Search by name/email
- Filter by role (student / contributor / admin)

**User actions:**
- Change role: student → contributor → admin (and reverse)
- Grant/revoke premium manually: `POST /api/admin/users/[userId]/premium`
- View user profile: `GET|PATCH /api/admin/users/[userId]`
- Reset exam attempts (planned)

### 2.8 Suggestions (`/admin/suggestions`)

Queue of all student-submitted suggestions. Covered by `SuggestionsView` component.

**Features:**
- Tabs: Pending | Approved | Rejected
- Each row: student name, type badge, title, description, related course, URL (if provided), submitted date
- Actions per suggestion: **Approve** / **Reject** (with optional admin note field)
- `PATCH /api/admin/suggestions/[id]` with `{ status, admin_note? }`
- Approving the 3rd suggestion for a student auto-promotes them to `contributor` via DB trigger

### 2.9 Capstone Review (`/admin/capstone`)

Review student capstone project submissions. Covered by `CapstoneView` component.

**Features:**
- Tabs: Pending | Approved | Rejected
- Each row: student name, department, submission content/URL, submitted date, GPA at time of submission
- Actions: **Approve** / **Reject** with a required reviewer note
- `PATCH /api/admin/capstone/[id]` with `{ status, reviewer_note }`
- Approval triggers graduation eligibility check

**Eligibility reminder** (displayed in UI):
- All Year 400 courses passed
- Cumulative GPA ≥ 3.5
- Active premium subscription

### 2.10 Payments (`/admin/payments`)

Read-only financial overview.

- Table of all transactions: date, student name, plan, amount, Paystack reference, status
- Filter by status (success / pending / failed)
- No refund or manual payment creation in v1

---

## 3. Layout

Shared admin layout (`src/app/(admin)/admin/layout.tsx`):
- Left sidebar with navigation links to all admin pages
- Header with "Admin" label and user menu
- All pages use `createAdminClient()` for data fetches — never the anon client
- No `px-[15%]` constraint — admin pages use their own layout padding

---

## 4. Data & API Routes

### Admin API Routes

| Method | Route | Purpose |
|---|---|---|
| GET\|POST | `/api/admin/courses` | List all courses / create new course |
| GET\|PATCH\|DELETE | `/api/admin/courses/[courseId]` | Read/update/delete a course |
| GET\|POST | `/api/admin/courses/[courseId]/lessons` | List/create lessons for a course |
| GET\|POST | `/api/admin/courses/[courseId]/questions` | List/create questions for a course |
| GET\|PATCH\|DELETE | `/api/admin/lessons/[lessonId]` | Read/update/delete a lesson |
| GET\|POST | `/api/admin/lessons/[lessonId]/resources` | List/create resources for a lesson |
| PATCH\|DELETE | `/api/admin/resources/[resourceId]` | Update/delete a resource |
| PATCH\|DELETE | `/api/admin/questions/[questionId]` | Update/delete a question |
| GET | `/api/admin/curriculum` | Full curriculum tree (years → semesters → courses) |
| GET\|POST | `/api/admin/years` | List/create academic years |
| PATCH\|DELETE | `/api/admin/years/[yearId]` | Update/delete a year |
| GET\|POST | `/api/admin/semesters` | List/create semesters |
| PATCH\|DELETE | `/api/admin/semesters/[semesterId]` | Update/delete a semester |
| GET\|PATCH | `/api/admin/users/[userId]` | Read/update user profile |
| POST | `/api/admin/users/[userId]/premium` | Grant/revoke premium for a user |
| PATCH | `/api/admin/suggestions/[id]` | Approve/reject suggestion with optional note |
| PATCH | `/api/admin/capstone/[id]` | Approve/reject capstone with reviewer note |

### Key Libraries

- `createAdminClient()` — `src/lib/supabase/admin.ts` — used on all admin API routes
- `requireAuth()` + `requireRole('admin', profile)` — `src/lib/auth.ts` — enforced on every admin route handler
- `AORTHAR_DEPARTMENTS` — `src/lib/academics/departments.ts`
- `getSemester1EnrollmentCodes(department)` — `src/lib/academics/plan.ts`

---

## 5. Non-Functional Requirements

- **Security:** All admin routes call `requireRole('admin', profile)` server-side. RLS is bypassed via admin client; no student-facing RLS applies.
- **Audit trail (future):** Admin actions are not yet logged in v1. A future `admin_audit_log` table is planned.
- **Bulk operations (future):** Bulk question import (CSV), bulk user export — deferred to v2.
- **Mobile:** Admin CMS is desktop-first. Minimum usable breakpoint: 1024px. Not optimised for mobile in v1.

---

## 6. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Admin deletes a course with active user_progress rows | Cascade delete is handled by FK `ON DELETE CASCADE` in the schema |
| Admin approves a capstone for a student who no longer meets eligibility | System approves — eligibility is checked at submission time, not re-verified at approval |
| Admin demotes themselves from admin role | Allowed in UI; they lose admin access immediately on next request |
| Non-admin visits `/admin` in production | Middleware redirects to `/unauthorized` |
| Non-admin visits `/admin` in development | Allowed (guard is disabled for dev convenience) |
| `plans` table manipulation | Not in admin CMS scope in v1 — plans are managed via migrations (`007_update_plans_seed.sql`) |
