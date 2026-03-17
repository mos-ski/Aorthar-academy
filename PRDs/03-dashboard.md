# Dashboard — PRD

## 1. Overview

The Dashboard is the student's home base — the first screen they land on after login. It gives a real-time snapshot of their academic standing and nudges them toward their next action. It is designed to answer three questions at a glance: "Where am I?", "What should I do next?", and "How am I doing?"

**Who uses it:** All enrolled students (post-onboarding).
**Why it exists:** Students need a centralised, motivating hub that reflects their progress and keeps them engaged.

---

## 2. User Stories

- As a student, I want to see my cumulative GPA and credits at a glance so I understand my academic standing.
- As a student, I want a "Continue Learning" button at the top so I can resume my last course in one click.
- As a student, I want to see which semester or year I'm close to unlocking so I know what to focus on.
- As a student, I want a streak tracker so I'm motivated to log in and study every day.
- As a student, I want to see recent platform announcements so I don't miss important news.
- As a student, I want to see my last 6 course interactions so I can quickly jump back into any active course.
- As an admin, I want to publish announcements that appear on every student's dashboard.

---

## 3. Functional Requirements

### 3.1 Continue Learning Hero CTA

1. Displayed prominently at the top of the dashboard content area, above the KPI cards.
2. Shows: "Continue: [Course Name]" — the most recently updated course in `user_progress` where `status = 'in_progress'` or `status = 'not_started'` (whichever was updated most recently).
3. Clicking it navigates directly to `/classroom/[courseId]`.
4. If the student has no in-progress courses: show "Start Learning →" linking to `/courses`.
5. If the student has passed all their current courses: show "You're up to date — explore new courses →" linking to `/courses`.

### 3.2 KPI Cards (4 cards)

Displayed in a responsive 2×2 or 1×4 grid.

| Card | Data source | Value |
|---|---|---|
| Cumulative GPA | `cumulative_gpas.cumulative_gpa` | Formatted to 2 decimal places (e.g. 4.23) |
| Credits Earned | `cumulative_gpas.total_credits_earned` | Integer |
| Courses Passed | `user_progress` — count where `status = 'passed'` | Integer |
| In Progress | `user_progress` — count where `status = 'in_progress'` | Integer |

Each card has a colour-coded background (violet, amber, green, blue respectively) for quick visual scanning.

### 3.3 Streak Tracker

1. Displayed as a card or compact banner below the KPI cards.
2. Tracks consecutive days the student has opened any classroom page or submitted a quiz.
3. **Storage:** A `learning_streaks` table (or a `last_active_date` + `streak_count` column in `profiles`) records the last active date and current streak count.
4. Logic: if `today - last_active_date === 1 day` → increment streak; if `today - last_active_date === 0` → streak unchanged; if `> 1 day` → reset streak to 1.
5. Show: flame icon + "[N] day streak" + "Last active: [relative date]."
6. If streak is 0 or today is the first day: show "Start your streak today."

### 3.4 Upcoming Unlock Banner

1. Shown as a progress prompt beneath the KPI section.
2. Logic: find the next locked semester or year for the student.
   - Count courses the student still needs to pass in the current semester.
   - Show: "[N] course(s) left to unlock [Semester 2 / Year 200]."
3. Clicking the prompt navigates to `/progress`.
4. If the student is fully unlocked up to their current level: do not show this element.
5. ~~Year 400 premium upsell~~ **(deferred):** "Upgrade to Premium" nudge for Year 400 is not shown in v1.

### 3.5 Announcement Banner **(deferred — not implemented in v1)**

The `announcements` table, admin creation UI, and dismissal logic are not implemented in v1. The section is hidden entirely. Will be revisited when admin CMS reaches content management phase.

### 3.6 Recent Activity

1. Shows the **6 most recently updated** courses from `user_progress` (ordered by `updated_at DESC`, limit 6).
2. Each card shows: course name, course code, year level, status badge.
3. Clicking a card navigates to `/classroom/[courseId]`.
4. If the student has no activity yet: show an empty-state card — "No activity yet. Open the curriculum to start your first course." with a link to `/courses`.

### 3.7 Learning Tips

1. A static card at the bottom of the page with 3 short study tips.
2. Content is hardcoded (not admin-managed).
3. May be replaced by the Announcement Banner in future — for now they coexist.

### 3.8 Demo Mode

When demo mode is active (cookie `aorthar_demo=1`) or the student's database is empty:
- All data is sourced from `getDemoStudentSnapshot()`.
- A dismissible amber badge is shown: "Demo Mode: showing sample data."
- The "Continue Learning" CTA links to a demo course.

---

## 4. Non-Functional Requirements

- **Performance:** Dashboard must load within 1.5s. All data is fetched server-side in parallel (`Promise.all`). No client-side waterfall fetches.
- **Mobile:** KPI cards collapse to a 2×2 grid on small screens. Recent activity cards stack in a single column. CTA is full-width.
- **Accessibility:** KPI card values use `<p>` with visually hidden labels for screen readers. Streak icon has `aria-hidden` with adjacent text.
- **Loading:** Because the dashboard is a server component, Next.js `loading.tsx` shows a skeleton while the page data loads. Skeleton mirrors the card grid layout.
- **Empty states:** Every section has a defined empty state (no null/undefined renders).

---

## 5. UI / UX

### Layout (top to bottom)

1. **Announcement Banner** (if active) — amber/info stripe at the very top, dismissible.
2. **Greeting** — "Welcome back, [First Name]!" with subtitle.
3. **Continue Learning CTA** — large highlighted card/button with course name and an arrow.
4. **KPI Cards** — 4-card grid.
5. **Streak Tracker** — compact card, flame icon.
6. **Upcoming Unlock Prompt** — progress nudge with a progress indicator.
7. **Recent Activity** — 6-card grid (2 columns on desktop, 1 on mobile).
8. **Learning Tips** — static card at the bottom.

### Key Visual States

| Element | Empty state | Loading state |
|---|---|---|
| Continue CTA | "Start Learning →" | Skeleton shimmer |
| KPI cards | Show 0 values | Skeleton shimmer |
| Streak | "Start your streak today" | Skeleton |
| Upcoming unlock | Hidden | Hidden |
| Announcements | Hidden | Hidden |
| Recent activity | Empty-state card with link to `/courses` | Skeleton shimmer |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `user_progress` | SELECT — status counts + recent 6 by `updated_at` | Filtered by `user_id` |
| `cumulative_gpas` | SELECT — single row | Filtered by `user_id` |
| `years` + `semesters` + `courses` | SELECT — used for unlock calculation | Joined query |
| `semester_progress` | SELECT — `is_unlocked` per semester | Filtered by `user_id` |
| ~~`announcements`~~ | *(deferred — table not yet created)* | — |
| `profiles` | SELECT — streak data (`last_active_date`, `streak_count`) | Filtered by `user_id` |

### API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/streak/ping` | Update `last_active_date` and recalculate streak on each classroom visit |

### Key Utilities

- `getDemoStudentSnapshot()` — `src/lib/demo/studentSnapshot.ts`
- `isDemoMode()` / `isExplicitLiveMode()` — `src/lib/demo/mode.ts`
- `requireAuth()` — `src/lib/auth.ts`
- `formatYearLabel()` / `formatGPA()` — `src/utils/formatters.ts`

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student has no progress at all (just enrolled) | CTA says "Start Learning →"; KPIs show 0; recent activity shows empty-state |
| Student has passed all Sem 1 courses but Sem 2 hasn't been auto-unlocked | Upcoming unlock says "0 left to unlock Semester 2 — check your Progress page" (edge case in unlock logic) |
| Announcement expiry date passes | Banner disappears automatically (server filters by `expires_at > now()`) |
| Streak break — user misses a day | Streak resets to 1 on next login; no penalty beyond visual reset |
| Network error loading dashboard | Next.js error boundary shows a generic "Something went wrong" with a retry button |
| First-time login after onboarding (no activity yet) | Bootstrap logic runs: Semester 1 courses are upserted into `user_progress`; dashboard reflects them immediately |

---

## 8. Success Metrics

- Daily Active Users (DAU) returning to the dashboard: > 40% of enrolled students per week.
- "Continue Learning" CTA click-through rate: > 50% of dashboard visits.
- Average session length on dashboard: < 30 seconds (students should quickly navigate onward).
- Streak adoption: > 30% of students maintain a 3-day or longer streak within first 2 weeks.
- Announcement open/read rate: > 60% per announcement (measured by link clicks if announcement has a CTA link).
