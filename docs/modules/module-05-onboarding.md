# Module 05: Student Onboarding

## Route
- `/onboarding`

## Goal
- Capture student discipline/department before they can use the academy.

## Department Options
- UI/UX Design
- Product Management
- Product Design
- Design Engineering (FE)
- Backend Engineering
- Scrum & Agile
- Operations
- Quality Assurance (QA)

## Data Written
- `profiles.department`
- `profiles.onboarding_completed_at`

## APIs
- `POST /api/onboarding/complete`

## Middleware Rules
- Student without completed onboarding is forced to `/onboarding`.

## Admin Ownership
- Update department taxonomy and onboarding fields.
