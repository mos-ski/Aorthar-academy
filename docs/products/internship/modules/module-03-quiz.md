# Module 03: Online Exam

## Overview

Applicants enter the exam using their name and access code (no Supabase auth required). They complete MCQ + essay questions within a 90-minute time limit.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /quiz/enter` | GET | Name + Code entry page |
| `POST /api/internship/exam/start` | POST | Validate code, start exam session |
| `GET /quiz/take` | GET | Active exam page |
| `POST /api/internship/exam/submit` | POST | Submit answers, calculate score |

## Flow

```
Applicant → /quiz/enter → Enter Name + Access Code →
POST /api/internship/exam/start →
  Validate: code exists, payment = paid, exam not already taken, exam window open →
  Create exam session →
GET /quiz/take → Display MCQ + essay questions with 90-min timer →
Applicant answers → Submit →
POST /api/internship/exam/submit →
  Calculate score → Store in internship_exam_results →
  Mark application exam_status = "submitted" →
  Show "Exam Submitted" confirmation page
```

## Exam Structure

| Component | Count | Points |
|-----------|-------|--------|
| Multiple Choice Questions | 30 | 2 points each (60 total) |
| Essay Questions | 3 | Variable (40 total) |
| **Total** | 33 | **100** |

## Anti-Cheat

| Measure | Implementation |
|---------|----------------|
| Time limit | Server-side timer, auto-submit at 90 minutes |
| One attempt per code | Block re-entry after submission |
| Question randomization | Shuffle question order per session |
| No back-button | Disable browser navigation during exam |

## Database

### Exam Session (temporary)

Stored server-side during the active exam session. Can use:
- Server session state (in-memory for single-server)
- Or a temporary `internship_exam_sessions` table for multi-server

### internship_exam_results (on submit)

| Column | Value |
|--------|-------|
| `application_id` | FK to the application |
| `answers` | JSONB — all submitted answers |
| `score` | Calculated percentage (MCQ auto-graded, essays pending review) |
| `submitted_at` | Current timestamp |
| `duration_minutes` | Time taken |

## Requirements

- No Supabase auth required (name + code only)
- Code must be valid, paid, and not already used
- Exam window must be open (check cohort `exam_open_at` and `exam_close_at`)
- 90-minute countdown timer (visible to applicant)
- Auto-submit when timer expires
- MCQ questions are auto-graded server-side
- Essay questions are stored for admin review
- Confirmation page shows "Exam submitted successfully"

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Invalid code | "Invalid access code" error |
| Code already used | "You have already taken this exam" message |
| Exam window closed | "The exam window is closed" message |
| Timer expires | Auto-submit with current answers |
| Browser closed | Session lost (no resume for simplicity) |

## See Also

- [Results Module](./module-04-results.md)
- [Application Module](./module-02-application.md)
