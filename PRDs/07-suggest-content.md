# Suggest Content — PRD

## 1. Overview

The Suggest Content module lets students contribute to the growth of Aorthar Academy by proposing new courses, lessons, resources, or general curriculum improvements. It fosters community ownership of the curriculum and rewards engaged students with a Contributor badge and role.

**Who uses it:** All enrolled students (any tier).
**Why it exists:** Students are often the best source of curriculum gaps. This module creates a structured, manageable feedback channel that empowers students while giving admins a reviewable queue.

---

## 2. User Stories

- As a student, I want to suggest a new course topic so the academy can add it to the curriculum.
- As a student, I want to flag an error or improvement for an existing lesson so the quality stays high.
- As a student, I want to submit a useful link or resource I found so other students benefit.
- As a student, I want to see the status of my past suggestions so I know if they were reviewed.
- As a student who has 3+ approved suggestions, I want to receive a Contributor badge on my profile as recognition.
- As an admin, I want to review all pending suggestions in one queue and approve or reject them with a note.

---

## 3. Functional Requirements

### 3.1 Suggestion Types

Students can submit 4 types:

| Type | Label | Description |
|---|---|---|
| `new_course` | New Course | Propose an entirely new course or subject area |
| `new_lesson` | New Lesson | Suggest a specific lesson to add to an existing course |
| `resource` | External Resource | Submit a link, article, video, or tool for an existing lesson |
| `feedback` | Curriculum Feedback | Report an error, flag outdated content, or suggest an improvement |

### 3.2 Submission Form

1. Available on `/suggest` under the "New Suggestion" tab.
2. Form fields:
   - **Type** (required) — dropdown: New Course / New Lesson / Resource / Feedback.
   - **Title** (required, max 120 chars) — short name for the suggestion.
   - **Description** (required, max 1000 chars) — detailed explanation of what's being suggested and why.
   - **Related Course** (optional) — dropdown of existing courses (relevant for lesson/resource/feedback types).
   - **URL / Link** (optional, URL format) — for the `resource` type.
3. Validation: Title and Description are required. URL must be a valid URL if provided.
4. On submit: `POST /api/suggestions` with `{ type, title, description, course_id?, url? }`.
5. On success: form clears, success toast — "Suggestion submitted! Thank you for contributing.", suggestion appears in the "My Suggestions" tab immediately.
6. On error: inline error message below the form.

### 3.3 My Suggestions Tab

1. Second tab on the `/suggest` page.
2. Lists all suggestions submitted by the current user, ordered by `created_at DESC`.
3. Each entry shows: type badge, title, submission date, status badge (`pending` / `approved` / `rejected`).
4. If an admin left a note on a rejection: the rejection note is displayed below the entry.
5. Empty state: "You haven't made any suggestions yet. Use the form above to get started."

### 3.4 Suggestion Status

| Status | Meaning |
|---|---|
| `pending` | Submitted, awaiting admin review |
| `approved` | Admin has approved; suggestion is queued for implementation |
| `rejected` | Admin has reviewed and declined; may include a rejection note |

Status flow: `pending` → `approved` or `rejected` (no revert; no intermediate steps).

### 3.5 Contributor Role & Badge

1. When a student's approved suggestion count reaches **3**, a database trigger automatically sets `profiles.role = 'contributor'`.
2. The Contributor badge appears:
   - On the student's Settings page next to their name.
   - (Future) On their public profile or course comment display name.
3. The Contributor role is additive — contributors retain full student access and gain the ability to be credited in course content.
4. Future perks (to be defined, not implemented in v1):
   - Early access to new courses before public release.
   - Discount code or credit toward the Mentorship plan.
   - Special "Contributor" label in course comments and suggestion history.

### 3.6 API

**`POST /api/suggestions`**
- Requires authenticated session.
- Validates type, title (required), description (required), optional course_id and url.
- Inserts a row into `suggestions` with `proposer_id = user.id`, `status = 'pending'`.
- Returns `{ success: true, suggestion: { id, status } }`.

**`GET /api/suggestions` (optional)** — or data is fetched server-side on page load.

---

## 4. Non-Functional Requirements

- **Rate limiting:** A student cannot submit more than 5 suggestions in a 24-hour period (enforced server-side).
- **Content length:** Title max 120 chars, description max 1000 chars — enforced by Zod schema on client and API.
- **Mobile:** Form is single-column, full-width. Tabs are clearly labelled. Status badges are legible at small sizes.
- **Accessibility:** Form inputs all have associated labels. Status badges use both colour and text (not colour-only).
- **Performance:** The page fetches the user's suggestions server-side on load. No client-side waterfall.

---

## 5. UI / UX

### Page Layout

- Max width: `2xl` (centred, comfortable reading width — max ~672px).
- Tabs: "New Suggestion" (default) | "My Suggestions."

### New Suggestion Tab

- Clear heading and subheading describing the purpose.
- Type selector at the top (dropdown or segmented control).
- Context-sensitive help: if "New Lesson" is selected, a note appears — "Pick the related course so we know where to add it."
- URL field appears/hides based on type (always shown for `resource`, hidden otherwise).

### My Suggestions Tab

- Card-based list. Each card:
  ```
  ┌────────────────────────────────────────┐
  │  [New Course]  Design Systems Overview │
  │  Submitted: 3 days ago                 │
  │  Status: [Pending]                     │
  └────────────────────────────────────────┘
  ```
- Approved: green badge + "Approved" text.
- Rejected: red badge + rejection note displayed below if provided.
- Pending: amber badge.

### States

| State | Display |
|---|---|
| Empty (no suggestions yet) | Illustration + "No suggestions yet" + prompt to use the form |
| Submission loading | Submit button shows spinner, fields disabled |
| Submission success | Toast + form reset + new card appears at top of "My Suggestions" tab |
| Rate limit reached | Error below form: "You've reached the daily suggestion limit (5). Try again tomorrow." |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `suggestions` | INSERT | On submission via `POST /api/suggestions` |
| `suggestions` | SELECT | Fetch user's own suggestions for "My Suggestions" tab |
| `courses` | SELECT | Populate "Related Course" dropdown |
| `profiles` | UPDATE (via trigger) | `role = 'contributor'` when approved count reaches 3 |

### DB Trigger (existing)

`update_contributor_role` — fires after each UPDATE to `suggestions.status`:
- Counts `suggestions` where `proposer_id = user_id AND status = 'approved'`.
- If count ≥ 3 → `UPDATE profiles SET role = 'contributor' WHERE user_id = ...`.
- Defined in `supabase/migrations/003_functions.sql`.

### API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/suggestions` | Required | Submit a new suggestion |

### Admin Interface

Suggestions are reviewed via the Admin Console (`/admin/suggestions`), which is covered in the Admin PRD. From the student side, the only admin-facing surface is the rejection note displayed in "My Suggestions."

### Validators

- `suggestionSchema` in `src/utils/validators.ts` — validates `type`, `title`, `description`, optional `course_id`, optional `url`.

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student submits a duplicate suggestion (same title) | No deduplication in v1 — both are accepted. Admins are expected to spot duplicates during review. |
| Rate limit exceeded (> 5 in 24h) | API returns 429; client shows error below the form. |
| `course_id` provided for a `new_course` type | Ignored — new courses aren't linked to an existing course. |
| Admin approves the same student's 3rd suggestion simultaneously | Trigger fires once (idempotent — `role` is already `'contributor'` if it runs twice). |
| Contributor role is manually demoted by admin | The trigger won't re-fire until a new approval happens. Role stays as admin set it. |
| URL field has a non-URL value | Zod validation rejects it before submission; inline error shown. |
| Student submits while network is offline | Request fails; error toast: "Submission failed. Please check your connection." |

---

## 8. Success Metrics

- Weekly suggestion submission rate: > 10% of active students submit at least one suggestion per month.
- Admin review turnaround: > 80% of pending suggestions reviewed within 5 business days.
- Approval rate: track as a signal of suggestion quality (healthy target: 30–50% approval).
- Contributor badge holders: > 5% of enrolled students earn Contributor status within 6 months.
- Zero abusive/spam submissions reaching approval (rate limiting + admin review acts as the gate).
