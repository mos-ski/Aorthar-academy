# Module 17: Admin Console

## Routes
- `/admin`
- `/admin/courses`
- `/admin/questions`
- `/admin/users`
- `/admin/suggestions`
- `/admin/capstone`
- `/admin/payments`

## Goal
- Operate curriculum, users, assessments, moderation, and billing from one console.

## Submodule Responsibilities
1. Admin Dashboard (`/admin`): KPIs and pending queues.
2. Courses (`/admin/courses`): create/edit/publish/archive courses and lessons.
3. Questions (`/admin/questions`): manage quiz/exam banks.
4. Users (`/admin/users`): role changes and account oversight.
5. Suggestions (`/admin/suggestions`): approve/reject student proposals.
6. Capstone (`/admin/capstone`): review and scoring outcomes.
7. Payments (`/admin/payments`): transaction and subscription oversight.

## Access Control
- Strictly `profiles.role = 'admin'` via middleware + RLS.

## Admin Data Managed
- Departments, years, semesters.
- Course map, lesson topics, resources.
- Assessment structures and publishing flags.
