# GPA & Grades — PRD

## 1. Overview

The GPA & Grades module gives students a clear, detailed view of their academic standing. It combines two pages:

- **`/gpa`** — the student's cumulative GPA (with classification), semester-by-semester breakdown, full grade history per course, and a PDF transcript download (Premium).
- **`/progress`** — the progression view showing all 4 years, semester unlock status, and per-course completion state across the curriculum.

**Who uses it:** All enrolled students.
**Why it exists:** Students need to track academic performance over time, understand their standing, and have a portable record of their achievements. The progression view gives clarity on what's locked and what's next.

---

## 2. User Stories

- As a student, I want to see my cumulative GPA and academic classification at a glance (e.g., "First Class Honour").
- As a student, I want to see my GPA broken down by semester so I can identify where I performed well or poorly.
- As a student, I want to see every course grade — quiz score, exam score, final grade — in one table.
- As a Premium student, I want to download a PDF transcript of my academic record to share with employers or mentors.
- As a student, I want to see a visual map of my entire 4-year curriculum showing which years and semesters are locked, completed, or in progress.

---

## 3. Functional Requirements

### 3.1 GPA Page (`/gpa`)

**3.1.1 Cumulative GPA Card**

1. Displays the student's `cumulative_gpas.cumulative_gpa` formatted to 2 decimal places (e.g., 4.23 / 5.0).
2. Displays `total_credits_earned`.
3. Displays a **classification label** based on the GPA value:

| GPA Range | Classification |
|---|---|
| 4.50 – 5.00 | First Class Honour |
| 3.50 – 4.49 | Second Class Upper |
| 2.40 – 3.49 | Second Class Lower |
| 2.00 – 2.39 | Pass |
| < 2.00 | Fail / Unsatisfactory |

4. The classification label is colour-coded (gold for First Class, green for Second Upper, etc.).
5. If the student has no grades yet: GPA shows 0.00 with classification "Not Yet Calculated."

**3.1.2 Semester GPA Cards**

1. A grid of cards — one per semester the student has at least one graded course in.
2. Each card shows: year + semester label (e.g., "Year 100 · Semester 1"), semester GPA, total credits for that semester.
3. Ordered chronologically (earliest first).
4. Source: `semester_gpas` joined with `years` and `semesters`.

**3.1.3 Course Grade Table**

1. A full table of all graded courses.
2. Columns: Course Code, Course Name, Quiz Score (%), Exam Score (%), Final Grade (%), Letter Grade, Credits, Status (passed/failed).
3. Letter grade is derived from the final grade percentage:

| Final Grade | Letter |
|---|---|
| ≥ 70% | A+ |
| 60–69% | A |
| 55–59% | B+ |
| 50–54% | B |
| 45–49% | C+ |
| 40–44% | C |
| 35–39% | D |
| < 35% | F |

4. Source: `course_grades` joined with `courses` (name, code, credit_units).
5. Sorted by year level and semester order (ascending — oldest first).
6. Failed courses display the row in a subtle red-tinted background.

**3.1.4 Transcript Download (Premium)**

1. A "Download Transcript (PDF)" button is shown on the GPA page.
2. For non-premium students: button is visible but disabled with a tooltip — "PDF transcript is a Premium feature. Upgrade to download."
3. For premium students: clicking calls `GET /api/transcript/download` which returns a server-generated PDF.
4. PDF contents:
   - Aorthar Academy header (logo, academy name, tagline).
   - Student name, department, enrolment date.
   - Cumulative GPA + classification.
   - Semester-by-semester GPA table.
   - Full course grade table (same columns as in-app view).
   - Generated date + "This is an unofficial transcript."
5. PDF is generated server-side (e.g., using a library like `@react-pdf/renderer` or `puppeteer`) and streamed as a download.

### 3.2 Progress Page (`/progress`)

**3.2.1 Year Sections**

1. Page is divided into sections — one per academic year (100, 200, 300, 400).
2. Each year section shows: year label, total courses, passed courses, and a horizontal progress bar (passed/total).

**3.2.2 Semester Cards Within Each Year**

1. Each year contains 2 semester cards side-by-side (or stacked on mobile).
2. Semester card header: semester label + an icon:
   - Unlocked: green checkmark icon.
   - Locked: grey lock icon.
3. Locked semesters show the card at reduced opacity.

**3.2.3 Course List Within Each Semester Card**

1. Each semester card lists all courses in that semester.
2. Per course row: course name (truncated if long), status badge.
3. Status badge variants:

| Status | Badge colour |
|---|---|
| passed | Primary (green/brand) |
| failed | Destructive (red) |
| in_progress | Secondary (blue/muted) |
| not_started | Outline (grey) |

**3.2.4 Unlock Logic (displayed)**

1. Below each locked semester heading: a hint — "Pass all [N] courses in Semester 1 to unlock."
2. Below Year 400 if student is not premium: "Premium subscription required to unlock Year 400."
3. This view is read-only — no actions from the Progress page. Students navigate to Courses to take action.

**3.2.5 Demo Mode**

Both pages use `getDemoStudentSnapshot()` when demo mode is active or DB is empty. An amber "Demo Mode" badge is shown.

---

## 4. Non-Functional Requirements

- **Performance:** Both pages use `Promise.all` server-side data fetching. Target load < 1.5s.
- **PDF Generation:** Transcript generation should complete in < 5 seconds. Large grade histories (> 30 courses) should still be performant.
- **PDF Gate:** The premium check for transcript download is enforced both client-side (UI) and server-side (API validates subscription status).
- **Mobile:** GPA card stacks vertically. Semester GPA grid wraps. Course grade table scrolls horizontally on small screens. Progress page semester cards stack in a single column.
- **Accessibility:** GPA classification colour has a text label — not colour-only signalling. Tables have proper `<thead>`, `scope` attributes, and column headers.

---

## 5. UI / UX

### GPA Page Layout (top to bottom)

1. **Demo badge** (if applicable).
2. **Cumulative GPA card** — hero card, large number, classification label, credits earned.
3. **Semester GPA grid** — compact cards in a 2–4 column responsive grid.
4. **Course Grade Table** — full-width scrollable table with alternating row colours.
5. **Download Transcript button** — above or below the grade table.

### Progress Page Layout

1. **Demo badge** (if applicable).
2. **Page heading** — "Academic Progress."
3. **Year sections** — each with a progress bar and contained semester cards.

### Classification Badge Colours

| Classification | Colour |
|---|---|
| First Class Honour | Gold / amber |
| Second Class Upper | Green |
| Second Class Lower | Blue |
| Pass | Grey / secondary |
| Fail | Red / destructive |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `cumulative_gpas` | SELECT — single row | Filtered by `user_id` |
| `semester_gpas` | SELECT — all rows | Joined with `years`, `semesters`; filtered by `user_id` |
| `course_grades` | SELECT — all rows | Joined with `courses` (name, code, credit_units); filtered by `user_id` |
| `years`, `semesters`, `courses` | SELECT | Progress page structure |
| `user_progress` | SELECT | Per-course status for progress page |
| `semester_progress` | SELECT — `is_unlocked`, `is_completed` | Progress page lock state |
| `subscriptions` | SELECT | Premium check for transcript download |

### API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/transcript/download` | Required + Premium | Generate and stream PDF transcript |

### Key Utilities

- `formatGPA(value)` — `src/utils/formatters.ts`
- `formatYearLabel(level)` / `formatSemesterLabel(number)` — `src/utils/formatters.ts`
- `getDemoStudentSnapshot()` — `src/lib/demo/studentSnapshot.ts`
- `isDemoMode()` / `isExplicitLiveMode()` — `src/lib/demo/mode.ts`
- `requireAuth()` + `checkPremiumAccess()` — `src/lib/auth.ts`

### GPA Computation (server-side, not client-side)

GPA values are pre-computed and stored — never calculated client-side:
- `compute_semester_gpa(user_id, semester_id)` — triggered after each exam pass.
- `compute_cumulative_gpa(user_id)` — triggered after each semester GPA update.
- Both are SQL functions in `supabase/migrations/003_functions.sql`.

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student has no grades yet | GPA page: shows 0.00 / "Not Yet Calculated" with an info note. Grade table is empty with "No grades yet." Progress page: all semesters except Sem 1 of Year 100 are locked. |
| Student passed some courses but GPA hasn't been computed yet | GPA card shows last computed value. A subtle "Recalculating..." indicator is shown if `cumulative_gpas.updated_at` is older than last `course_grades.created_at`. |
| Non-premium student clicks transcript download | Button is disabled with tooltip. Clicking triggers nothing (disabled state, not a redirect). |
| PDF generation fails server-side | API returns 500 with a user-facing message: "Transcript generation failed. Please try again." |
| Student has a failing course grade (< pass mark) | Row shown in red in the grade table. Status badge: "Failed". Does not appear as passed in the progress view. |
| Student has both passed and failed attempts for the same course | Only the most recent attempt's grade is shown (latest `course_grades` row). |

---

## 8. Success Metrics

- GPA page weekly visit rate: > 40% of active students view it at least once per week.
- Transcript download rate (premium): > 30% of premium students download at least once.
- Progress page usage: > 50% of students visit it weekly (particularly during exam season).
- GPA data accuracy: zero discrepancies between computed GPA values and manual re-calculation (regression tests on the DB functions).
- Premium upsell from transcript gate: > 5% of non-premium students who see the disabled transcript button upgrade to premium within 7 days.
