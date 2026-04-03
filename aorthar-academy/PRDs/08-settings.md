# Settings — PRD

## 1. Overview

The Settings module lets students manage their personal profile, preferences, and account lifecycle. It is a trusted, low-frequency destination — students visit it to update their identity, set their theme, review their subscription, and, in extreme cases, delete their account.

**Who uses it:** All enrolled students.
**Why it exists:** Students need control over their identity and account. Clear, complete settings reduce support tickets and build trust in the platform.

---

## 2. User Stories

- As a student, I want to update my name and bio so my profile reflects who I am.
- As a student, I want to upload a profile photo so I have a personal presence in comments and the community.
- As a student, I want to set my preferred theme (light/dark/system) and have it persist across devices.
- As a student, I want to see my current subscription plan and easily navigate to upgrade if I'm on the free tier.
- As a student who accidentally signed up and wants to leave, I want to permanently delete my account and all associated data.

---

## 3. Functional Requirements

### 3.1 Page Structure

The Settings page is divided into labelled sections:

1. **Profile** — name, bio, avatar.
2. **Academic Profile** — department (with change option), contributor badge status.
3. **Appearance** — theme toggle.
4. **Subscription** — current plan, upgrade CTA or active status.
5. **Danger Zone** — account deletion.

### 3.2 Profile Section

**3.2.1 Editable Fields**

| Field | Type | Constraints |
|---|---|---|
| Full Name | Text input | Required, min 2 chars, max 100 chars |
| Bio | Textarea | Optional, max 200 chars, character counter shown |

**3.2.2 Avatar Upload**

1. Displays the current avatar (or an initials placeholder if none set).
2. "Change Photo" button opens a file picker — accepts `.jpg`, `.png`, `.webp` only.
3. Max file size: 2MB. If exceeded: inline error — "Image must be under 2MB."
4. On selection: image is previewed in a crop/resize modal (simple circular crop, no zoom required in v1).
5. On confirm: file is uploaded to Supabase Storage at `avatars/[user_id]/avatar.[ext]` with a public URL.
6. `profiles.avatar_url` is updated with the public URL.
7. Old avatar file is deleted from Storage on successful upload.
8. Loading state: avatar shows a spinner overlay during upload.

**3.2.3 Save**

A single "Save Changes" button at the bottom of the Profile section. Triggers `PATCH /api/profile` with `{ full_name, bio, avatar_url }`.
- On success: toast — "Profile updated."
- On error: inline error message.
- The save button is disabled if no fields have changed (dirty state tracking).

### 3.3 Academic Profile Section

1. Displays: Department name (read-only label).
2. "Change Department" button — opens the department-change modal (as defined in the Onboarding PRD: shows a warning about progress reset, requires confirmation).
3. Contributor status: if `profiles.role === 'contributor'`, show a "Contributor" badge with a brief explanation — "You've had 3+ suggestions approved. Thank you for contributing to the curriculum."
4. If not a contributor: no mention of contributor status (avoid friction for new students).

### 3.4 Appearance Section

1. Theme selector: three options — Light, Dark, System (follow device preference).
2. Selection is applied immediately (optimistic UI — the theme changes on click without needing to save).
3. The preference is stored in `profiles.theme_preference` via `PATCH /api/profile`.
4. On next login from any device: the stored theme is read and applied.
5. Default: "System" (inherits OS dark/light mode).

**Theme values in DB:** `'light'` | `'dark'` | `'system'`

### 3.5 Subscription Section

1. Shows current plan status:
   - **Free:** "You're on the Free plan. You have access to Year 100." + "Upgrade to Standard →" button (links to `/pricing`).
   - **Standard:** "Standard Plan — Active" + activation date + "You have access to Years 100–300."
   - **Mentorship:** "Mentorship Plan — Active" + "You have full access and a dedicated mentor."
2. No self-serve cancellation. If a paid student wants to cancel, they are directed to contact support (a link to a support email or form).
3. If subscription status is `expired` or `cancelled`: show in amber — "Your plan has expired. Renew to restore access." + "Renew →" button.

### 3.6 Danger Zone — Account Deletion

1. Clearly separated at the bottom of the page with a red border or "Danger Zone" label.
2. Description: "Deleting your account is permanent. All your progress, grades, GPA, and suggestions will be erased. This cannot be undone."
3. "Delete My Account" button (red, outlined).
4. Clicking opens a confirmation modal:
   - Warning paragraph (restates consequences).
   - Text input: "Type DELETE to confirm."
   - "Permanently Delete Account" button — enabled only when input exactly equals "DELETE".
   - "Cancel" button.
5. On confirm: call `DELETE /api/account`.
6. API:
   - Deletes all rows in `user_progress`, `course_grades`, `semester_gpas`, `cumulative_gpas`, `quiz_attempts`, `suggestions`, `subscriptions`, `transactions` where `user_id = user.id`.
   - Deletes the `profiles` row.
   - Calls `supabase.auth.admin.deleteUser(user.id)` (using `createAdminClient()`).
   - Clears the session cookie.
   - Returns `{ success: true }`.
7. On success: redirect to `/` (landing page) with a toast — "Your account has been deleted."
8. On error: modal remains open; show error — "Deletion failed. Please try again or contact support."

---

## 4. Non-Functional Requirements

- **Security:**
  - Avatar uploads are validated server-side (file type + size). Malformed files are rejected.
  - Account deletion uses `createAdminClient()` to call Supabase Auth Admin API — never the anon key.
  - The "DELETE" confirmation text is case-sensitive and validated server-side before deletion proceeds.
- **Performance:** Settings page is server-rendered with profile + subscription fetched in parallel. Target load < 1s.
- **Mobile:** All sections stack in a single column. Avatar uploader is touch-friendly. Theme options use large tap targets.
- **Accessibility:** Theme selector uses radio buttons (not just divs). Danger zone modal has proper focus trapping. Error messages are linked to their inputs via `aria-describedby`.

---

## 5. UI / UX

### Page Layout

Sectioned, single-column layout. Each section has a heading, separator line, and its own save state (Profile is the only section with an explicit Save button; other sections save immediately on change).

```
┌────────────────────────────────┐
│ Settings                       │
├────────────────────────────────┤
│ Profile                        │
│   [Avatar]  [Change Photo]     │
│   Full Name: ___________       │
│   Bio: _________________       │
│                  [Save Changes]│
├────────────────────────────────┤
│ Academic Profile               │
│   Department: UI/UX Design     │
│   [Change Department]          │
│   [Contributor Badge]          │
├────────────────────────────────┤
│ Appearance                     │
│   Theme: ( ) Light (•) Dark ( ) System │
├────────────────────────────────┤
│ Subscription                   │
│   Free Plan                    │
│   [Upgrade to Standard →]      │
├────────────────────────────────┤
│ Danger Zone                    │
│   [Delete My Account]          │
└────────────────────────────────┘
```

### States

| Element | Loading | Error | Success |
|---|---|---|---|
| Avatar upload | Spinner overlay on avatar | "Image must be under 2MB" / "Invalid file type" | New avatar shown immediately |
| Save Changes | Button spinner, fields disabled | Inline error below form | "Profile updated" toast |
| Theme select | Immediate (optimistic) | — | Theme changes instantly, saved silently |
| Delete account modal | "Permanently Delete Account" button shows spinner | Error shown in modal | Redirect to `/` |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `profiles` | SELECT — on page load | Fetch full_name, bio, avatar_url, department, role, theme_preference |
| `subscriptions` | SELECT — on page load | Fetch active plan + status |
| `profiles` | UPDATE via PATCH `/api/profile` | full_name, bio, avatar_url, theme_preference |
| All user tables | DELETE via DELETE `/api/account` | Cascade all user data |

### Supabase Storage

| Bucket | Path | Notes |
|---|---|---|
| `avatars` | `avatars/[user_id]/avatar.[ext]` | Public bucket, one file per user |

### API Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| PATCH | `/api/profile` | Required | Update name, bio, avatar_url, theme_preference |
| DELETE | `/api/account` | Required | Full account deletion |

### Key Utilities

- `requireAuth()` — `src/lib/auth.ts`
- `createAdminClient()` — `src/lib/supabase/admin.ts` (account deletion only)
- `formatDate()` — `src/utils/formatters.ts` (subscription activation date display)
- `AORTHAR_DEPARTMENTS` — `src/lib/academics/departments.ts` (department display name)

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student uploads a non-image file (e.g. PDF) | Client rejects before upload; error: "Only JPG, PNG, and WebP files are accepted." |
| Avatar upload fails mid-way | Previous avatar remains unchanged; error toast shown; no partial file left in storage |
| Student changes department: mid-process closes the modal | No changes made. Progress is intact. |
| Student types "delete" (lowercase) in the Danger Zone modal | Button stays disabled — comparison is case-sensitive ("DELETE" only). |
| Subscription is active but shows as expired (sync issue) | Subscription section shows "expired" state until next page load. A manual "Refresh" link is shown. |
| Account deletion API fails after partially deleting rows | Partial deletion is a known edge case. In v1: log the failure server-side, show error to the user, and flag for manual cleanup. Full transactional deletion is a future improvement. |
| Student visits Settings with demo mode active | Profile and subscription data show demo snapshot. Save/edit actions are disabled with a banner: "Switch to Live mode to edit your profile." |

---

## 8. Success Metrics

- Profile completion rate (avatar + bio set): > 40% of enrolled students within 30 days.
- Theme preference adoption: > 50% of students set a non-default theme (signals engagement with the settings page).
- Account deletion rate: < 2% of enrolled students per month (low churn signal).
- Subscription upgrade CTA conversion from Settings: > 5% of students who view their Free plan status in Settings click "Upgrade to Standard" (tracks in-app upgrade intent separately from the Pricing page).
- Zero support tickets for data not being deleted after account deletion request.
