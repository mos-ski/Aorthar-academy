# Module 20: Data Model Map (Admin Context)

## Core Academic Tables
- `years`
- `semesters`
- `courses`
- `lessons`
- `resources`
- `course_prerequisites`
- `specialization_tracks`
- `course_tracks`

## Identity + Roles
- `profiles`
- `auth.users` (Supabase auth)

## Assessment + GPA
- `questions`
- `quiz_attempts`
- `course_grades`
- `semester_gpas`
- `cumulative_gpas`

## Learning State
- `enrollments`
- `user_progress`
- `semester_progress`
- `lesson_reactions`
- `lesson_summaries`

## Community
- `suggestions`
- `suggestion_votes`
- `lesson_comments`
- `lesson_comment_reactions`

## Capstone + Billing
- `capstone_submissions`
- `plans`
- `subscriptions`
- `transactions`
- `webhook_events`

## Admin Update Principles
1. Never hard-delete graded records.
2. Use draft -> publish lifecycle for course changes.
3. Keep stable course codes (e.g., `DES101`) as external references.
4. Version assessment content when changing answer keys.
5. Track update owner and timestamp for every admin change.
