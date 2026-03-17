# Quiz & Assessment — PRD

## 1. Overview

Aorthar Academy uses a two-tier assessment model that distinguishes between in-lesson practice and course-level graded exams:

- **Quiz** — a short, mandatory check after each lesson. Must be passed to proceed to the next lesson. Retakeable, answers shown after submission. Does not directly contribute to GPA.
- **Exam** — a timed, graded assessment taken after completing all lessons in a course. Limited attempts. Contributes to the course grade (and thereby GPA).

**Who uses it:** All enrolled students.
**Why it exists:** Assessments enforce active learning (quizzes gate lesson progression) and provide an objective, measurable grade (exams feed GPA and academic standing).

---

## 2. User Stories

- As a student, I want to take a short quiz after each lesson to confirm I understood the material, with the ability to retake it if I fail.
- As a student, I want to see the correct answers after submitting a quiz so I can learn from my mistakes.
- As a student, I want to take a final exam after completing all lessons in a course, knowing it counts toward my GPA.
- As a student, I want the exam to feel appropriately challenging — timed, one-shot per attempt, no answer reveal.
- As a student, I want to know how many exam attempts I have left and when my cooldown ends after a failed attempt.
- As an admin, I want to create questions tagged as quiz-type or exam-type so they appear in the correct assessment.

---

## 3. Functional Requirements

### 3.1 Quiz (Per Lesson)

**3.1.1 Trigger**

1. A "Take Quiz" button appears at the bottom of every lesson after the student has scrolled through / engaged with the content.
2. The quiz is available regardless of whether the student has passed it before.
3. If the lesson quiz has already been passed: the button reads "Retake Quiz" (retakes don't affect lesson unlock status).

**3.1.2 Questions**

1. Quiz questions are drawn from the `questions` table where `is_exam_question = false` and `lesson_id = [current lesson]`.
2. Questions are randomised in order per attempt.
3. Answer options are shuffled per attempt (stored in JSONB format: `[{id, text, is_correct}]`).
4. Typical length: 3–10 questions (brief, as described — minutes not tens of minutes).

**3.1.3 Submission**

1. `POST /api/quiz/start` creates a `quiz_attempts` row and returns the shuffled questions (correct answers stripped client-side by the Edge Function).
2. Student selects one answer per question and submits.
3. `POST /api/quiz/submit` sends answers to the `grade-quiz` Edge Function, which scores server-side (never exposes `is_correct` to the client until after grading).

**3.1.4 Results**

1. After submission, results are shown immediately:
   - Score (e.g., "8 / 10 correct").
   - Each question with: the student's answer highlighted, the correct answer highlighted in green, a brief explanation if provided.
2. Pass threshold: 100% correct required to pass the quiz and unlock the next lesson.
   - If the student scores < 100%: show a "Try Again" button (no cooldown — retakeable immediately).
   - If the student scores 100%: show "Continue to Next Lesson →" and mark the lesson as complete.
3. Results are stored in `quiz_attempts` (score, answers, passed flag).

**3.1.5 Lesson Unlock**

1. Lessons are unlocked sequentially. Lesson N is accessible only after Lesson N-1's quiz is passed.
2. The first lesson of every course is always accessible.
3. Unlock state is computed from `quiz_attempts` (latest attempt for the lesson, `passed = true`).

### 3.2 Exam (Per Course)

**3.2.1 Trigger**

1. After a student passes all lessons in a course (all lesson quizzes passed), an "Attempt Final Exam" button appears on the course overview in the classroom.
2. If the student has not finished all lessons: the exam button is disabled with a tooltip: "Complete all lessons first."

**3.2.2 Questions**

1. Exam questions are drawn from the `questions` table where `is_exam_question = true` and `course_id = [current course]`.
2. All exam questions are included (no sub-sampling in v1).
3. Questions and answer options are randomised per attempt.
4. Typical length: up to ~15–20 questions. Target time: ≤ 10 minutes.

**3.2.3 Timer**

1. Each exam has a configured time limit (default: 10 minutes, set per course by admin).
2. A countdown timer is displayed prominently during the exam.
3. When the timer reaches 0: the exam is auto-submitted with whatever answers have been selected.

**3.2.4 Attempt Limits & Cooldown**

1. Maximum **3 attempts** per student per course.
2. On a failed attempt: a **24-hour cooldown** is enforced. The "Attempt Exam" button is replaced with "Next attempt available in [countdown]."
3. If 3 attempts are exhausted: the course is marked as `failed` in `user_progress`. The student cannot attempt again without admin intervention.
4. On a passed attempt: no further attempts are needed (or allowed).

**3.2.5 Submission & Grading**

1. `POST /api/quiz/start` with `type: 'exam'` creates the attempt.
2. `POST /api/quiz/submit` delegates to the `grade-quiz` Edge Function.
3. Pass threshold: course `pass_mark` (default 60%).
4. On pass:
   - `quiz_attempts.passed = true`.
   - `course_grades` is upserted: `exam_score = [score]`.
   - The course grade is computed: `quiz_weight (0.4) × avg_quiz_score + exam_weight (0.6) × exam_score`.
   - `user_progress.status = 'passed'`.
   - GPA recalculation is triggered via the `calculate-gpa` Edge Function.
5. On fail:
   - `quiz_attempts.passed = false`, `failed_at = now()`.
   - Cooldown enforced.

**3.2.6 Results Display**

1. Score shown as a percentage.
2. Pass/fail status with the course pass mark for reference.
3. **No answer reveal** — unlike quizzes, exam correct answers are not shown after submission. Students see: "You scored X%. You need Y% to pass."
4. If passed: celebratory message + "Continue to Courses" button.
5. If failed: score + next attempt countdown.

### 3.3 Quiz Score Contribution to Grade

1. The average score across all lesson quizzes in a course constitutes the **quiz component (40%)** of the final course grade.
2. The exam score constitutes the **exam component (60%)**.
3. Final grade formula: `0.4 × avg_lesson_quiz_score + 0.6 × exam_score`.
4. This grade is stored in `course_grades` and feeds into `semester_gpas` and `cumulative_gpas` via the GPA computation functions.

---

## 4. Non-Functional Requirements

- **Security:** Correct answers are never sent to the client. All grading happens server-side in the `grade-quiz` Supabase Edge Function. The `questions.options` JSONB array is stripped of `is_correct` before being returned from `POST /api/quiz/start`.
- **Integrity:** Attempt limits and cooldowns are enforced server-side. Client-side UI is informational only — the API will reject an attempt if the limit is reached or cooldown is active.
- **Performance:** Quiz start and submit calls should complete in < 500ms.
- **Mobile:** Quiz and exam UIs are fully functional on mobile. Answer options use large tap targets (min 44px height). The timer is always visible (sticky header on mobile).
- **Accessibility:** Each question is a fieldset with a legend. Answer options are radio buttons with visible labels. Selected/correct/incorrect states use both colour and icon to avoid colour-only signalling.

---

## 5. UI / UX

### Quiz Flow

1. Student clicks "Take Quiz" in the lesson view.
2. Quiz opens in a focused modal or full-width overlay within the classroom.
3. Questions displayed one at a time (or all at once for short quizzes — configurable).
4. Submit button at the bottom.
5. Results screen: question-by-question breakdown with colour-coded answers.

### Exam Flow

1. "Attempt Final Exam" button on the course overview card.
2. Confirmation modal: "You have X of 3 attempts remaining. The exam is timed (10 minutes). Ready?"
3. Exam starts: timer visible in top-right corner, questions in single-column layout.
4. Auto-submit on timer expiry with a brief notification.
5. Results: score + pass/fail + next action CTA.

### States

| State | Display |
|---|---|
| Lesson quiz not yet attempted | "Take Quiz" button |
| Lesson quiz passed | "Retake Quiz" (greyed) + green check |
| Lesson quiz failed | "Try Again" immediately |
| Exam locked (lessons incomplete) | Disabled "Final Exam" button + tooltip |
| Exam available | "Attempt Final Exam" with attempt counter |
| Exam in cooldown | "Next attempt: [countdown timer]" |
| Exam exhausted (3 fails) | "All attempts used. Contact support." |
| Exam passed | "Passed ✓" + GPA updated notice |

---

## 6. Data & APIs

### Database

| Table | Operation | Notes |
|---|---|---|
| `questions` | SELECT | Filtered by `is_exam_question` + `lesson_id` or `course_id` |
| `quiz_attempts` | INSERT + SELECT | One row per attempt; tracks score, passed, cooldown |
| `course_grades` | UPSERT | Set after exam pass; `exam_score` + computed final grade |
| `user_progress` | UPDATE | Set to `passed` on exam pass |

### API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/quiz/start` | Create attempt, return shuffled questions (no `is_correct`) |
| POST | `/api/quiz/submit` | Grade answers via Edge Function, return results |
| GET | `/api/quiz/attempt/[attemptId]` | Retrieve attempt state (for resume) |
| GET | `/api/quiz/attempt/[attemptId]/solutions` | Return solutions (quiz only, after passing) |
| POST | `/api/quiz/generate` | AI-generate questions for a lesson (admin use only) |

### Edge Functions

| Function | Purpose |
|---|---|
| `grade-quiz` | Server-side grading — strips correct answers, returns score, updates DB |
| `calculate-gpa` | Triggered after exam pass — recalculates semester + cumulative GPA |

### DB Functions (SQL)

- `compute_semester_gpa(user_id, semester_id)` — `supabase/migrations/003_functions.sql`
- `compute_cumulative_gpa(user_id)` — same file
- `check_quiz_cooldown(user_id, course_id)` — validates cooldown state

---

## 7. Edge Cases & Constraints

| Scenario | Behaviour |
|---|---|
| Student answers a quiz with all options unselected and submits | Client-side validation: "Please answer all questions before submitting." |
| Student closes the exam tab mid-way | The attempt is not submitted. Timer continues server-side via `quiz_attempts.started_at`. On return, the remaining time is shown and the exam resumes. |
| Exam timer auto-submits with unanswered questions | Unselected answers are treated as incorrect. Score reflects answered questions only. |
| Admin adds questions after a student has already started an attempt | The in-flight attempt uses the questions from `start` — new questions only appear in new attempts. |
| Student passes quiz on 5th retake | No issue — quiz pass count isn't limited. Only exam attempts are capped. |
| `grade-quiz` Edge Function is unreachable | API returns 502; client shows: "Grading failed. Your answers have been saved — try submitting again." |
| All 3 exam attempts fail | `user_progress.status` remains `failed`. Student is not blocked from other courses. Admin can reset attempts via the Admin Console. |

---

## 8. Success Metrics

- Lesson quiz first-attempt pass rate: > 60%.
- Average quiz retakes before passing: < 3.
- Exam first-attempt pass rate: > 50%.
- Exam second-attempt pass rate (cumulative): > 75%.
- Zero grading integrity incidents (correct answers exposed to client).
- < 1% of exam submissions lost due to network errors.
