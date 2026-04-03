# Module 09: Quiz and Assessment

## Routes
- `/classroom/[courseId]/quiz/[attemptId]`
- `/courses/[courseId]/quiz/[attemptId]`

## Goal
- Deliver assessments and compute scores for progression/GPA.

## API Endpoints
- `POST /api/quiz/start`
- `POST /api/quiz/generate`
- `POST /api/quiz/submit`
- `GET /api/quiz/attempt/[attemptId]`
- `GET /api/quiz/attempt/[attemptId]/solutions`

## Data Sources
- `questions`
- `quiz_attempts`
- `course_grades`

## Admin Ownership
- Question quality and difficulty distribution.
- Course pass marks, attempt limits, durations.

## Publish Rules
- Keep question bank active before publishing course quiz.
- Generated questions should be reviewed if used in production mode.
