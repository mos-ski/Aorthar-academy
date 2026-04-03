# Module 03: Auth - Sign Up

## Route
- `/register`

## Goal
- Create a new student account and initialize profile metadata.

## Input Fields
- Full name
- Email
- Password
- Optional department (if preselected)

## Outcomes
- Account created -> verify flow.
- New profile row created through DB trigger.

## Data Dependencies
- `auth.users`
- `profiles` (auto-created)

## Admin Ownership
- Department option list must match profile constraint values.
