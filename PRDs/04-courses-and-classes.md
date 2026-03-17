# Courses & Classes — PRD

## 1. Overview

The Courses & Classes module is the core learning experience of Aorthar Academy. It covers two interconnected surfaces:

1. **Courses Catalog (`/courses`)** — a tabbed browser of all 4 years of the student's curriculum, showing locked/unlocked semesters and course completion status.
2. **Classroom Viewer (`/classroom/[courseId]`)** — the full-screen environment where a student watches lessons, reads content, downloads resources, and interacts with fellow students via comments.

**Who uses it:** All enrolled students.
**Why it exists:** This is where learning actually happens. Everything else in the academy (GPA, progression, capstone) flows from activity in this module.

---

## 2. User Stories

- As a student, I want to browse all courses across my 4-year curriculum so I can see what's ahead.
- As a student, I want locked semesters to be clearly marked so I know what I need to do to unlock them.
- As a student, I want to open a course and watch lessons in a focused, distraction-free classroom environment.
- As a student, I want to read lesson notes, open external links, and download reference material without leaving the classroom.
- As a student, I want to post a comment on a lesson and read what other students have written.
- As a student, I want my course progress to be saved so I can resume exactly where I left off.

---

## 3. Functional Requirements

### 3.1 Courses Catalog (`/courses`)

**3.1.1 Year Tabs**

1. The page renders a tab per academic year (Year 100, 200, 300, 400) using the student's actual `years` data.
2. The default active tab is always Year 100 (the student's starting year).
3. Each tab label shows the year name and an icon (BookOpen, BookMarked, Layers, GraduationCap).

**3.1.2 Semester & Course Grid**

1. Within each tab, semesters are listed vertically (Semester 1 above Semester 2).
2. Locked semesters display a "Locked" badge and the course grid is dimmed + pointer-events disabled.
3. Unlocked semesters show courses in a responsive grid (1–3 columns depending on viewport).
4. Course cards show: course code, course name, premium badge (if `is_premium`), passed indicator.

**3.1.3 Unlock Logic**

- Semester 1 of Year 100 is always unlocked.
- Semester 2 unlocks when all Semester 1 courses in the same year are passed.
- Year N+1 unlocks when all courses in Year N are passed.
- Year 400 additionally requires an active premium subscription.
- Unlock state is read from `semester_progress.is_unlocked`.

**3.1.4 Premium Gate**

1. Year 400 courses display a "Premium" badge.
2. If the student is not premium and tries to open a Year 400 course → redirect to `/pricing` with a toast: "Year 400 requires a Premium subscription."
3. Non-Year-400 premium-flagged courses follow the same gate.

**3.1.5 Demo Mode**

When demo mode is active or `years` table is empty: the catalog renders from `getDemoStudentSnapshot().years` with an amber "Demo Mode" badge.

### 3.2 Classroom Viewer (`/classroom/[courseId]`)

**3.2.1 Layout**

Full-screen, dark-themed viewer. No sidebar from the main app. Layout:
- **Left panel (desktop):** Lesson list — all lessons in the course, with completion indicators.
- **Main panel:** Active lesson content area.
- **Tab bar:** Four tabs — "Class Info", "Materials", "Related", "Classroom" (comments).

**3.2.2 Lesson List (Left Panel)**

1. Ordered list of all lessons in the course.
2. Each lesson shows: number, title, duration/type indicator, completion status (not started / in progress / complete).
3. Clicking a lesson loads it into the main panel.
4. Completed lessons show a green checkmark. Current lesson is highlighted.
5. Lessons are unlocked sequentially — a lesson is only accessible after the previous lesson's quiz has been passed (see Quiz PRD).

**3.2.3 Lesson Content Types**

Each lesson can contain one or more of:

| Type | Rendering |
|---|---|
| YouTube video | Embedded `<iframe>` player, responsive, 16:9 aspect ratio |
| Written content / notes | Markdown rendered as styled HTML |
| External link | Linked resource card with title, description, and external link icon |
| Downloadable document | File card with download button; stored in Supabase Storage |

Multiple content types can coexist in one lesson (e.g. a video + written notes + a PDF download).

**3.2.4 Class Info Tab**

Shows:
- Course name, code, credit units, pass mark.
- Department tags.
- Instructor/author name (if applicable).
- Brief course description.
- Total lesson count and estimated duration.

**3.2.5 Materials Tab**

Aggregated list of all resources across all lessons in the course:
- External links (with open-in-new-tab behaviour).
- Downloadable documents (with file size and type).
- Grouped by lesson.

**3.2.6 Related Tab**

Shows up to 6 course suggestions:
- Same-year courses the student hasn't started.
- Courses from adjacent semesters.
- Powered by `GET /api/lessons/related` which returns course IDs based on year/semester proximity.

**3.2.7 Classroom Tab (Comments)**

1. Students can post text comments on any lesson.
2. Comments are stored in a `lesson_comments` table keyed to `lesson_id` and `user_id`.
3. All enrolled students can see all comments for that lesson.
4. Students can react to a comment (thumbs up) — stored in a `comment_reactions` table.
5. Comment display: avatar (initials), display name, relative timestamp, comment text, reaction count.
6. No threaded replies in v1 — all comments are flat.
7. Student cannot delete another student's comment; they can only delete their own.
8. Admin can delete any comment via the Admin Console.

**3.2.8 Progress Tracking**

1. When a student opens a lesson: `user_progress` for the course is set to `in_progress` (if not already `passed`).
2. When a student completes all lessons and passes the course exam: `user_progress` is set to `passed`.
3. Progress is updated via the quiz/exam flow (see Quiz & Assessment PRD).

**3.2.9 Deep Dive (AI Summary)**

The classroom viewer supports three AI lesson enhancement endpoints — all GET, all optional:
- `GET /api/lessons/summary` — AI-generated lesson summary (shown in Class Info tab).
- `GET /api/lessons/deep-dive` — extended AI deep-dive content for advanced exploration.
- `GET /api/lessons/related` — also used by the Related tab to suggest nearby courses.

These are enhancement features, present only if triggered or pre-generated. Not auto-generated on every lesson open.

---

## 4. Non-Functional Requirements

- **Performance:** Classroom viewer loads the active lesson's content within 2s. The lesson list is server-rendered; video embeds are lazy-loaded.
- **Full-screen experience:** No main app sidebar in the classroom. A "Back to Courses" breadcrumb is the only navigation.
- **Mobile:** Lesson list collapses into a drawer/sheet on mobile. Video is full-width. Tabs scroll horizontally.
- **Offline:** No offline support in v1. Students need an active connection to watch videos (YouTube embed).
- **Security:** Downloadable documents are served via signed Supabase Storage URLs with a short expiry (15 minutes). Documents are never directly publicly accessible.
- **Accessibility:** Video embeds respect YouTube's native accessibility controls. Written content meets WCAG AA contrast. Comment input has a proper label.

---

## 5. UI / UX

### Catalog Page

- Clean, tabbed layout. Year tabs are sticky on scroll.
- Locked semester sections are visually muted (opacity 50%, lock icon on the semester heading).
- Passed courses show a green checkmark overlay on the card.
- "Premium" courses have a gold badge. If student is not premium, clicking shows an upsell prompt.

### Classroom Page

- Dark background (`bg-background` in dark mode / near-black).
- Video fills the majority of the main panel on desktop.
- Written content uses a comfortable reading width (max ~680px) with proper line-height.
- Tab bar is below the main content area, above comments/related.

### States

| Element | Empty state | Loading |
|---|---|---|
| Lesson list | "No lessons added yet" | Skeleton list items |
| Video | Placeholder thumbnail with play icon | Native browser loading |
| Comments | "Be the first to comment on this lesson." | Skeleton comment cards |
| Materials | "No resources attached to this lesson." | — |
| Related | "No related courses yet." | Skeleton cards |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `years`, `semesters`, `courses` | SELECT | Catalog structure |
| `user_progress` | SELECT + UPDATE | Tracks per-course status |
| `semester_progress` | SELECT | Determines lock/unlock state |
| `lessons` | SELECT | Ordered lesson list per course |
| `resources` | SELECT | Attached to each lesson |
| `lesson_comments` | SELECT + INSERT + DELETE | Per-lesson comments |
| `comment_reactions` | SELECT + INSERT + DELETE | Thumbs-up on comments |
| `course_grades` | SELECT | To show passed indicator on catalog card |
| `subscriptions` | SELECT | Premium gate check |

### API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/lessons/related` | Suggest related courses |
| GET | `/api/lessons/summary` | AI-generated lesson summary |
| GET | `/api/lessons/deep-dive` | AI extended deep-dive content |
| GET\|POST | `/api/lessons/comments` | Fetch or post a comment on a lesson |
| POST | `/api/lessons/comments/reaction` | React to a comment |
| POST | `/api/lessons/reaction` | React to a lesson itself |

### Key Utilities

- `loadCourseViewerData(courseId, userId)` — `src/lib/courses/loadCourseViewerData.ts`
- `CourseViewer` component — `src/components/courses/CourseViewer.tsx`
- `requireAuth()` — `src/lib/auth.ts`
- `checkPremiumAccess()` — `src/lib/auth.ts`

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student opens a locked semester course via direct URL | Middleware redirects to `/courses` with a toast: "This semester is locked." |
| Course has no lessons yet (admin hasn't added any) | Classroom shows "No lessons have been added to this course yet. Check back soon." |
| YouTube video is unavailable / deleted | Embed shows YouTube's native "Video unavailable" message; student can still access written content and materials |
| Student tries to skip a locked lesson | Lesson list item is non-interactive; clicking shows a tooltip: "Complete the previous lesson's quiz first." |
| Premium course opened by free student | Redirect to `/pricing` with toast "This course requires a Premium subscription." |
| Comment contains offensive content | No automated moderation in v1; rely on admin manual review via Admin Console |
| Signed document URL expires mid-download | Supabase regenerates on next page load; show "Refresh the page to re-download" toast if the link is stale |

---

## 8. Success Metrics

- Lesson completion rate per course: > 60% of enrolled students finish all lessons in courses they've started.
- Classroom session duration: average > 15 minutes per session (meaningful engagement vs. accidental opens).
- Comment volume: > 20% of students who complete a lesson post at least one comment within 30 days.
- Catalog → classroom conversion: > 70% of catalog visits result in a classroom session.
- Zero premium gate bypasses (direct URL access to locked courses).
