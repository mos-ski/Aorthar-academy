# Auth — PRD

## 1. Overview

The Auth module handles all identity flows for Aorthar Academy: sign-in, sign-up, email verification, and password reset. It is the entry point for every user — students, contributors, and admins. Authentication is powered by Supabase Auth (JWT-based), and a Postgres trigger auto-creates a `profiles` row on every new sign-up.

**Who uses it:** All users (unauthenticated).
**Why it exists:** No user can access the academy without a verified identity tied to a profile record.

---

## 2. User Stories

- As a new student, I want to create an account with my name, email, and password so I can start learning.
- As a returning student, I want to sign in quickly so I can resume where I left off.
- As a user, I want to sign in with Google so I don't have to remember a password.
- As a user who registered but hasn't verified yet, I want to see a clear banner with a resend link so I can complete verification without losing access for 7 days.
- As a user who forgot their password, I want to receive a reset email so I can regain access.
- As a logged-in user who visits `/login` or `/register`, I want to be redirected to `/dashboard` automatically.

---

## 3. Functional Requirements

### 3.1 Sign-Up (`/register`)

1. Form fields: Full Name, Email, Password, Department (**required** dropdown — 8 choices from `AORTHAR_DEPARTMENTS`).
2. Validation (Zod schema `registerSchema`):
   - Full name: required, min 2 chars.
   - Email: valid format, required.
   - Password: min 8 characters.
3. On submit: call `supabase.auth.signUp()`. Supabase sends a verification email automatically.
4. A Postgres trigger (`on_auth_user_created`) auto-inserts a `profiles` row with `user_id`, `full_name`, and `department` (if provided).
5. After sign-up: redirect to `/verify` with a "check your email" message.
6. If the email already exists: show inline error — "An account with this email already exists."

### 3.2 Sign-In (`/login`)

1. Form fields: Email, Password.
2. On submit: call `supabase.auth.signInWithPassword()`.
3. On success:
   - If profile has `department` + `onboarding_completed_at` → redirect to `/dashboard`.
   - If profile is missing either field → redirect to `/onboarding`.
   - If user is admin (`profile.role === 'admin'`) → redirect to `/admin`.
4. On failure: show inline error — "Invalid email or password."
5. "Forgot password?" link below the form → navigates to `/forgot-password`.

### 3.3 Google OAuth (not in scope for v1)

Google OAuth is deferred. No OAuth button is shown on any auth page. The Supabase provider can be enabled in a future iteration without code changes to the auth pages.

### 3.4 Email Verification (`/verify`)

1. User lands here after sign-up.
2. Page shows: "We've sent a verification link to [email]. Click it to activate your account."
3. A **"Resend verification email"** button calls `supabase.auth.resend({ type: 'signup', email })`.
4. Rate-limit resend: max 1 resend per 60 seconds (client-side throttle; Supabase enforces server-side).
5. ~~**7-day grace window**~~ **(deferred):** Email verification enforcement is not active in v1. Supabase manages verification state but the app does not block access after N days. This enforcement will be added in a future iteration.
6. Once the user clicks the email link: Supabase marks them verified, session is created, redirect to `/onboarding` (or `/dashboard` if onboarding was already done).

### 3.5 Forgot Password / Reset

1. `/forgot-password` page: single email field. On submit, call `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })`.
2. User receives an email with a magic link.
3. `/reset-password` page: reads the token from the URL hash, shows New Password + Confirm Password fields.
4. On submit: call `supabase.auth.updateUser({ password: newPassword })`.
5. On success: redirect to `/dashboard` (session remains active after `updateUser`).
6. Token expiry: Supabase default (1 hour). Expired token → show error — "This link has expired. Request a new one."

### 3.6 Sign-Out

1. Available from the user menu in the Navbar (post-auth).
2. Calls `supabase.auth.signOut()` → clears session → redirect to `/login`.

---

## 4. Non-Functional Requirements

- **Performance:** Auth pages must load in under 1s (no server data fetches required — all client-side).
- **Security:**
  - Passwords never stored or logged client-side.
  - CSRF protection via Supabase session cookies (`httpOnly`, `sameSite: lax`).
  - Rate-limiting on sign-in attempts is handled by Supabase (configurable in dashboard).
  - The `SERVICE_ROLE_KEY` is never used on auth pages.
- **Accessibility:** All form inputs have associated `<label>` elements. Error messages are linked via `aria-describedby`. Forms are keyboard-navigable.
- **Mobile:** Forms are single-column, full-width on small screens. Min tap target 44px.
- **Loading states:** Submit buttons show a spinner and are disabled during in-flight requests to prevent double-submit.

---

## 5. UI / UX

### Layout

All auth pages share a split-panel layout (no shared layout file — each page implements it inline):
- **Left panel (desktop):** Aorthar Academy branding, tagline, decorative/illustration.
- **Right panel:** The form, centered vertically, max-width `420px`.
- **Mobile:** Single column — branding collapses to a small logo + name above the form.

### Screens

| Screen | Key elements |
|---|---|
| `/register` | Logo, "Create your account" heading, name/email/password/dept (required) fields, "Already have an account? Sign in" link |
| `/login` | Logo, "Welcome back" heading, email/password fields, "Forgot password?" link, "Don't have an account? Register" link |
| `/verify` | Envelope icon, confirmation message with masked email, "Resend" button, countdown timer after resend |
| `/forgot-password` | Email field, "Send reset link" button, back-to-login link |
| `/reset-password` | New password + confirm fields, submit button |

### States

- **Idle:** Clean form, no errors.
- **Loading:** Button disabled, spinner icon, fields remain interactive.
- **Error:** Red inline message below the relevant field (field-level) or above the form (auth-level, e.g. invalid credentials).
- **Success:** Toast notification + programmatic redirect (no success screen that the user needs to dismiss).

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `auth.users` | INSERT (Supabase manages) | Created on `signUp()` or OAuth |
| `profiles` | INSERT (auto via trigger) | `user_id`, `full_name`, `department`, `role = 'student'` |

### Supabase Auth Methods

| Method | Trigger |
|---|---|
| `signInWithPassword({ email, password })` | Login form submit |
| `signUp({ email, password, options: { data: { full_name, department } } })` | Register form submit |
| ~~`signInWithOAuth({ provider: 'google' })`~~ | *(not in scope for v1)* |
| `resend({ type: 'signup', email })` | Resend verification button |
| `resetPasswordForEmail(email, { redirectTo })` | Forgot password form |
| `updateUser({ password })` | Reset password form |
| `signOut()` | Sign-out menu item |

### Middleware

The middleware (`src/middleware.ts`) enforces:
- Logged-in users on `/login` or `/register` → redirect to `/dashboard`.
- Unverified users (after 7-day grace) → redirect to `/verify`.
- All dashboard routes require a valid session.

### Validators (`src/utils/validators.ts`)

- `loginSchema` — email + password fields.
- `registerSchema` — full name + email + password + **required** department.
- `resetPasswordSchema` — new password + confirm (match check).

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| User registers with an existing email | Inline error: "An account with this email already exists." |
| User submits login with wrong password 5+ times | Supabase rate-limits; show "Too many attempts. Try again later." |
| Verification link clicked after 7 days (unverified block active) | Block is lifted immediately upon verification; no re-confirmation needed |
| OAuth user tries to sign in with email/password (no password set) | Show: "This account uses Google sign-in. Use the Google button." |
| Network error during form submit | Show generic error: "Something went wrong. Please try again." |
| User navigates to `/verify` when already verified | Redirect to `/dashboard` |
| Reset password token is expired | Show: "This link has expired. [Request a new one]" with link to `/forgot-password` |
| User completes OAuth sign-in for the first time (no department set) | Redirect to `/onboarding` |

---

## 8. Success Metrics

- Sign-up → email verified within 24 hours: > 70% of new registrations.
- Login success rate (correct credentials): > 99%.
- Password reset completion (reset email sent → password changed): > 60%.
- Drop-off on `/register` form: < 30% (measured via funnel analytics).
- Zero reports of locked-out users unable to re-verify within the 7-day window.
