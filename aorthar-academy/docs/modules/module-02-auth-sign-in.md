# Module 02: Auth - Sign In

## Route
- `/login`

## Goal
- Authenticate existing users and redirect based on onboarding status and role.

## Input Fields
- Email
- Password

## Outcomes
- Success -> `/dashboard` (or onboarding gate if incomplete profile).
- Failure -> inline error.

## Data Dependencies
- Supabase Auth session.
- `profiles` role/department fields via middleware.

## Admin Ownership
- No content management required.
- Monitor login failures from auth logs.
