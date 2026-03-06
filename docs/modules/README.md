# Aorthar Academy Module Documentation Index

This folder contains module-by-module documentation for the full student, classroom, admin, and platform system.

## Student-Facing Modules
- `module-01-home-landing.md`
- `module-02-auth-sign-in.md`
- `module-03-auth-sign-up.md`
- `module-04-auth-verify.md`
- `module-05-onboarding.md`
- `module-06-dashboard.md`
- `module-07-courses-catalog.md`
- `module-08-classroom-course-player.md`
- `module-09-quiz-and-assessment.md`
- `module-10-progress.md`
- `module-11-gpa-and-grades.md`
- `module-12-capstone.md`
- `module-13-suggest-content.md`
- `module-14-settings.md`
- `module-15-pricing-and-subscription.md`
- `module-16-unauthorized.md`

## Admin + Management Modules
- `module-17-admin-console.md`
- `module-18-content-governance-and-publishing.md`

## Platform/API Modules
- `module-19-api-services-map.md`
- `module-20-data-model-map.md`

## Current Route Coverage

### Core routes
- `/`
- `/login`
- `/register`
- `/verify`
- `/onboarding`
- `/pricing`
- `/unauthorized`

### Dashboard routes
- `/dashboard`
- `/courses`
- `/courses/[courseId]`
- `/courses/[courseId]/quiz/[attemptId]`
- `/progress`
- `/gpa`
- `/capstone`
- `/suggest`
- `/settings`

### Classroom routes
- `/classroom/[courseId]`
- `/classroom/[courseId]/quiz/[attemptId]`

### Admin routes
- `/admin`
- `/admin/courses`
- `/admin/questions`
- `/admin/users`
- `/admin/suggestions`
- `/admin/capstone`
- `/admin/payments`

### API routes
- `/api/onboarding/complete`
- `/api/suggestions`
- `/api/capstone/submit`
- `/api/payments/checkout`
- `/api/webhooks/paystack`
- `/api/unlock-next-level`
- `/api/quiz/start`
- `/api/quiz/generate`
- `/api/quiz/submit`
- `/api/quiz/attempt/[attemptId]`
- `/api/quiz/attempt/[attemptId]/solutions`
- `/api/lessons/reaction`
- `/api/lessons/summary`
- `/api/lessons/related`
- `/api/lessons/deep-dive`
- `/api/lessons/comments`
- `/api/lessons/comments/reaction`
- `/api/cron/repair-links`
