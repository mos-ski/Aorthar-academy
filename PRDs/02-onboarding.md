# Onboarding — PRD

## 1. Overview

The Onboarding module is the mandatory matriculation step every new student completes before accessing the academy. It is a formal, multi-step academic wizard that:

1. Orients the student to Aorthar Academy's mission, grading rules, and academic expectations.
2. Lets the student choose their department (track/discipline).
3. Shows a preview of their Semester 1 courses before they confirm enrollment.
4. Initialises their profile and triggers course enrollment on the backend.

**Who uses it:** All new students — triggered after first sign-up or if `profiles.onboarding_completed_at` is null.
**Why it exists:** Without a department, the academic hierarchy (courses, progression, GPA) cannot be scoped to the student. Onboarding is also the first brand impression after registration.

---

## 2. User Stories

- As a new student, I want a clear orientation step that tells me how Aorthar Academy works before I choose my department.
- As a new student, I want to browse the departments and see what Semester 1 looks like for each one before I commit.
- As a new student, I want to confirm my department selection and land on the Dashboard ready to start learning.
- As a returning student who skipped onboarding, I want to be gated from the dashboard and redirected to complete onboarding first.
- As a student who made the wrong choice, I want to change my department via Settings — with a clear warning that my progress will reset.

---

## 3. Functional Requirements

### 3.1 Onboarding Gate

1. Middleware checks `profiles.department` and `profiles.onboarding_completed_at` on every dashboard-bound request.
2. If either is null → redirect to `/onboarding`.
3. If both are set → pass through to the requested page.
4. Authenticated users who visit `/onboarding` when already onboarded → redirect to `/dashboard`.

### 3.2 Wizard Steps

The onboarding wizard has **3 steps** with a visible step indicator at the top:

**Step 1 — Welcome & Academic Rules**

1. Heading: "Welcome to Aorthar Academy, [First Name]."
2. Content block: Aorthar mission statement (1–2 paragraphs).
3. Academic rules summary — presented as a structured list:
   - GPA scale: 5.0 (A+ = 5.0, D = 2.0, F = 0.0).
   - Pass mark: 60% per course.
   - Course grade = Quiz (40%) + Exam (60%).
   - Semester 2 unlocks when all Semester 1 courses are passed.
   - Year 400 requires an active Premium subscription.
   - Max 3 quiz attempts per course; 24-hour cooldown on fail.
4. Acknowledgement checkbox: "I have read and understood the Aorthar Academic Rules."
5. "Continue" button is disabled until checkbox is checked.

**Step 2 — Choose Your Department**

1. Display all 8 departments as selectable cards (icon + name + 1-line description each).
2. Departments: UI/UX Design, Product Management, Design Engineering (Frontend), Backend Engineering, Scrum & Agile, Operations Management, Quality Assurance, Creative Technology.
3. Selecting a card highlights it; only one can be selected at a time.
4. ~~"What's the difference?" accordion~~ **(deferred)** — not implemented in v1.
5. "Continue" button enabled only when a department is selected.

**Step 3 — Semester 1 Preview & Confirm**

1. Show the selected department name as a heading.
2. List all Semester 1 courses for that department (code, name, credit units) — sourced from `getSemester1EnrollmentCodes(department)` → courses table.
3. "Confirm Enrollment" button.
4. "Back" button returns to Step 2 (department stays selected).
5. On confirm: call `POST /api/onboarding/complete` with `{ department }`.

### 3.3 Onboarding Complete API (`POST /api/onboarding/complete`)

1. Requires authenticated session.
2. Validates `department` is one of the 8 valid values.
3. Updates `profiles` row: sets `department`, `onboarding_completed_at = now()`.
4. Upserts `user_progress` rows for all published Semester 1 courses of the chosen department (status: `not_started`).
5. Upserts a `semester_progress` row for Year 100, Semester 1 (`is_unlocked = true`).
6. Returns `{ success: true }`.
6. On success: client redirects to `/dashboard`.

### 3.4 Department Change (via Settings)

1. Available in the Settings page under "Academic Profile."
2. Clicking "Change Department" shows a modal with:
   - Warning: "Changing your department will reset all your course progress, grades, and GPA. This cannot be undone."
   - Confirm button: "Yes, Reset & Change Department."
   - Cancel button.
3. On confirm: call a new endpoint `POST /api/onboarding/change-department` with `{ department }`.
4. The API: deletes all `user_progress`, `course_grades`, `semester_gpas`, `cumulative_gpas` rows for the user, then re-runs the same logic as `complete` (step 3.3).
5. After success: redirect to `/dashboard` with a toast — "Department updated. Your progress has been reset."

---

## 4. Non-Functional Requirements

- **Performance:** Department cards and course previews should load in < 800ms. Course list is fetched server-side on the onboarding page.
- **No back-navigation bypass:** Browser back button during onboarding must not allow skipping to the dashboard. Middleware enforces the gate on every navigation.
- **Mobile:** Wizard steps are single-column. Department cards stack in a 2-column grid on mobile, 4-column on desktop.
- **Accessibility:** Step indicator uses `aria-current="step"`. Form controls are labelled. Acknowledgement checkbox is keyboard-accessible.
- **Loading states:** "Confirm Enrollment" button shows a spinner while the API call is in flight; the button is disabled to prevent re-submission.

---

## 5. UI / UX

### Layout

Full-screen wizard — no sidebar, no top nav. Clean, centred content with an Aorthar Academy logo at the top. Max content width: `640px`.

**Step indicator:** Horizontal row of 3 numbered circles with labels ("Welcome", "Your Track", "Confirm"). Active step is filled/highlighted; completed steps show a checkmark.

### Screens

| Step | Key elements |
|---|---|
| Step 1 — Welcome | Logo, "Welcome, [Name]" heading, mission block, academic rules list, acknowledgement checkbox, Continue button |
| Step 2 — Department | "Choose Your Track" heading, 8 department cards (2×4 grid on desktop), Continue button |
| Step 3 — Confirm | Selected department name, Semester 1 course list (table or card list), "Confirm Enrollment" CTA, Back button |

### Department Card Design

Each card shows:
- Department icon (Lucide icon, one per department)
- Department name (bold)
- One-line description (e.g., "Design systems, user research, and interaction design")
- Selected state: highlighted border + filled icon

---

## 6. Data & APIs

### Database

| Table | Operation | Trigger |
|---|---|---|
| `profiles` | UPDATE — set `department`, `onboarding_completed_at` | On `POST /api/onboarding/complete` |
| `user_progress` | INSERT (upsert) — one row per Sem 1 course | On `POST /api/onboarding/complete` |
| `user_progress`, `course_grades`, `semester_gpas`, `cumulative_gpas` | DELETE | On `POST /api/onboarding/change-department` |

### API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/onboarding/complete` | Required | Set department, initialise Sem 1 enrollment |
| POST | `/api/onboarding/change-department` | Required | Reset all progress, re-onboard to new department |

### Key Libraries

- `getSemester1EnrollmentCodes(department)` from `src/lib/academics/plan.ts` — returns the course codes for Step 3 preview.
- `AORTHAR_DEPARTMENTS` from `src/lib/academics/departments.ts` — the 8 valid department values.
- `requireAuth()` from `src/lib/auth.ts` — enforces session on the page and API routes.

### Middleware (`src/middleware.ts`)

Onboarding gate runs on every request to `/(dashboard)/*`:
- Reads `profile.department` and `profile.onboarding_completed_at`.
- Missing either → redirect to `/onboarding`.

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| User refreshes mid-wizard | Wizard resets to Step 1; no partial state is persisted server-side |
| API call to `complete` fails (network error) | Show toast error; button re-enables; user can retry |
| User is already onboarded and visits `/onboarding` | Middleware redirects to `/dashboard` |
| `getSemester1EnrollmentCodes` returns empty (no courses seeded yet) | Step 3 shows "No courses configured yet for this department. Enrollment will be set up shortly." Confirm button still works. |
| User picks a department on Step 2, then goes back and picks a different one | Step 3 always reflects the current selection |
| Change-department modal is dismissed mid-process | No changes are made; user stays on Settings |
| Admin user completes onboarding | Same flow as students; admin redirect happens after dashboard check in sign-in, not in onboarding |

---

## 8. Success Metrics

- Onboarding completion rate (step 1 → confirm enrolled): > 90% of users who reach `/onboarding`.
- Drop-off at Step 2 (department selection): < 15%.
- Median time to complete onboarding: < 3 minutes.
- Zero reports of users stuck in the onboarding loop after completion (middleware correctly detecting `onboarding_completed_at`).
- Department-change usage: track how many students change departments (expected < 5% of enrolled students).
