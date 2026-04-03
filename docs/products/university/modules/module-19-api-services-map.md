# Module 19: API Services Map

## Learning + Classroom APIs
- `/api/lessons/reaction` (GET/POST): lesson like/dislike + counts.
- `/api/lessons/summary` (POST): AI lesson summary generation.
- `/api/lessons/related` (GET): related videos/content feed.
- `/api/lessons/deep-dive` (GET/POST): supplemental discovery links.
- `/api/lessons/comments` (GET/POST): threaded comments.
- `/api/lessons/comments/reaction` (POST): comment like/dislike.

## Assessment APIs
- `/api/quiz/start` (POST): start assessment attempt.
- `/api/quiz/generate` (POST): generate fallback question set.
- `/api/quiz/submit` (POST): submit answers and grade.
- `/api/quiz/attempt/[attemptId]` (GET): attempt payload/state.
- `/api/quiz/attempt/[attemptId]/solutions` (GET): reviewed solutions.

## Student Lifecycle APIs
- `/api/onboarding/complete` (POST)
- `/api/suggestions` (GET/POST)
- `/api/capstone/submit` (POST)
- `/api/unlock-next-level` (POST)

## Billing + Ops APIs
- `/api/payments/checkout` (POST)
- `/api/webhooks/paystack` (POST)
- `/api/cron/repair-links` (POST): scheduled link maintenance.
