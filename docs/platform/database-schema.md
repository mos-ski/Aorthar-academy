# Database Schema Reference

**Last Updated:** 2026-04-03

---

## Overview

Complete reference for all database tables across all three products.

---

## Internship Tables

### internship_cohorts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Cohort identifier |
| `name` | TEXT | NOT NULL | e.g. "Q1 2026 Cohort" |
| `status` | TEXT | NOT NULL, default 'draft' | `draft` / `registration_open` / `registration_closed` / `exam_window` / `grading` / `results_published` / `placements_active` / `completed` |
| `application_open_at` | TIMESTAMPTZ | NULL | When applications open |
| `application_close_at` | TIMESTAMPTZ | NULL | When applications close |
| `exam_open_at` | TIMESTAMPTZ | NULL | When exam window opens |
| `exam_close_at` | TIMESTAMPTZ | NULL | When exam window closes |
| `max_interns` | INTEGER | NOT NULL, default 10 | Max interns per cohort |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |

### internship_applications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Application identifier |
| `user_id` | UUID | FK → profiles.user_id, NULL | Auth user (nullable) |
| `cohort_id` | UUID | FK → internship_cohorts.id, NOT NULL | Cohort |
| `full_name` | TEXT | NOT NULL | Applicant name |
| `email` | TEXT | NOT NULL | Applicant email |
| `access_code` | TEXT | UNIQUE, NOT NULL | Exam entry code |
| `payment_status` | TEXT | NOT NULL, default 'pending' | `pending` / `paid` / `failed` |
| `paystack_reference` | TEXT | UNIQUE, NULL | Paystack transaction ref |
| `exam_status` | TEXT | NOT NULL, default 'not_started' | `not_started` / `in_progress` / `submitted` / `graded` |
| `exam_score` | DECIMAL | NULL | Percentage score |
| `selected` | BOOLEAN | NOT NULL, default false | Top 10 flag |
| `applied_at` | TIMESTAMPTZ | NOT NULL, default now() | Application time |

### internship_exam_results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Result identifier |
| `application_id` | UUID | FK → internship_applications.id, NOT NULL | Application |
| `answers` | JSONB | NOT NULL | Exam answers |
| `score` | DECIMAL | NOT NULL | Calculated score |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | Submission time |
| `duration_minutes` | INTEGER | NOT NULL | Time taken |

### internship_placements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Placement identifier |
| `application_id` | UUID | FK → internship_applications.id, NOT NULL | Application |
| `startup_name` | TEXT | NOT NULL | Startup name |
| `role` | TEXT | NOT NULL | Intern role |
| `start_date` | DATE | NOT NULL | Placement start |
| `end_date` | DATE | NOT NULL | Placement end |
| `status` | TEXT | NOT NULL, default 'pending' | `pending` / `active` / `completed` / `terminated` |
| `certificate_issued` | BOOLEAN | NOT NULL, default false | Certificate flag |
| `certificate_url` | TEXT | NULL | Certificate storage URL |

---

## University Tables

### years

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Year identifier |
| `level` | INTEGER | UNIQUE, NOT NULL | 100, 200, 300, 400 |
| `name` | TEXT | NOT NULL | e.g. "First Year" |
| `display_order` | INTEGER | NOT NULL | Sort order |

### semesters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Semester identifier |
| `year_id` | UUID | FK → years.id, NOT NULL | Parent year |
| `number` | INTEGER | NOT NULL | 1 or 2 |
| `display_order` | INTEGER | NOT NULL | Sort order |

### courses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Course identifier |
| `semester_id` | UUID | FK → semesters.id, NOT NULL | Parent semester |
| `code` | TEXT | NOT NULL | e.g. "DES101" |
| `name` | TEXT | NOT NULL | Course title |
| `description` | TEXT | NULL | Long description |
| `credit_units` | INTEGER | NOT NULL, default 3 | Credit value |
| `pass_mark` | DECIMAL | NOT NULL, default 60 | Pass percentage |
| `quiz_weight` | DECIMAL | NOT NULL, default 0.4 | Quiz contribution |
| `exam_weight` | DECIMAL | NOT NULL, default 0.6 | Exam contribution |
| `quiz_attempt_limit` | INTEGER | NOT NULL, default 3 | Max quiz attempts |
| `exam_attempt_limit` | INTEGER | NOT NULL, default 3 | Max exam attempts |
| `cooldown_hours` | INTEGER | NOT NULL, default 24 | Cooldown after failure |
| `exam_duration_minutes` | INTEGER | NOT NULL, default 90 | Exam duration |
| `is_premium` | BOOLEAN | NOT NULL, default false | Premium flag |
| `status` | TEXT | NOT NULL, default 'draft' | `draft` / `published` / `unpublished` |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |

### lessons

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Lesson identifier |
| `course_id` | UUID | FK → courses.id, NOT NULL | Parent course |
| `title` | TEXT | NOT NULL | Lesson title |
| `content` | TEXT | NULL | Markdown notes |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |
| `duration_minutes` | INTEGER | NOT NULL, default 30 | Estimated duration |
| `is_published` | BOOLEAN | NOT NULL, default false | Visibility |

### resources

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Resource identifier |
| `lesson_id` | UUID | FK → lessons.id, NOT NULL | Parent lesson |
| `type` | TEXT | NOT NULL | `youtube` / `link` / `document` |
| `url` | TEXT | NOT NULL | Resource URL |
| `title` | TEXT | NOT NULL | Display title |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |

### questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Question identifier |
| `course_id` | UUID | FK → courses.id, NOT NULL | Parent course |
| `assessment_type` | TEXT | NOT NULL | `quiz` / `exam` |
| `type` | TEXT | NOT NULL | `multiple_choice` / `ordering` / `matching` |
| `question_text` | TEXT | NOT NULL | Question content |
| `options` | JSONB | NOT NULL | Answer options |
| `points` | INTEGER | NOT NULL, default 1 | Point value |
| `difficulty` | TEXT | NOT NULL, default 'medium' | `easy` / `medium` / `hard` |
| `shuffle_options` | BOOLEAN | NOT NULL, default true | Shuffle flag |

### quiz_attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Attempt identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `assessment_type` | TEXT | NOT NULL | `quiz` / `exam` |
| `attempt_number` | INTEGER | NOT NULL | Sequential attempt count |
| `started_at` | TIMESTAMPTZ | NOT NULL | Start time |
| `completed_at` | TIMESTAMPTZ | NULL | Completion time |
| `score` | DECIMAL | NULL | Server-calculated score |
| `passed` | BOOLEAN | NULL | Pass/fail result |
| `answers` | JSONB | NOT NULL | Submitted answers |
| `cooldown_until` | TIMESTAMPTZ | NULL | Cooldown end time |

### course_grades

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Grade identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `quiz_score` | DECIMAL | NULL | Best quiz score |
| `exam_score` | DECIMAL | NULL | Best exam score |
| `final_grade` | DECIMAL | NULL | Weighted final grade |
| `passed` | BOOLEAN | NOT NULL, default false | Pass/fail |
| `letter_grade` | TEXT | NULL | A+, A, B+, etc. |
| `grade_points` | DECIMAL | NULL | 5.0 scale points |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### semester_gpas

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | GPA identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `semester_id` | UUID | FK → semesters.id, NOT NULL | Semester |
| `gpa` | DECIMAL | NOT NULL | Semester GPA |
| `credits_earned` | INTEGER | NOT NULL | Credits this semester |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### cumulative_gpas

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | CGPA identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `year_id` | UUID | FK → years.id, NOT NULL | Year level |
| `cgpa` | DECIMAL | NOT NULL | Cumulative GPA |
| `total_credits` | INTEGER | NOT NULL | Total credits earned |
| `courses_completed` | INTEGER | NOT NULL | Courses passed count |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### profiles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK → auth.users.id | Auth user |
| `full_name` | TEXT | NOT NULL | Display name |
| `email` | TEXT | NOT NULL | Login email |
| `role` | TEXT | NOT NULL, default 'student' | `student` / `contributor` / `admin` |
| `department` | TEXT | NULL | Enrolled department |
| `onboarding_completed_at` | TIMESTAMPTZ | NULL | Onboarding timestamp |
| `avatar_url` | TEXT | NULL | Profile image URL |
| `is_suspended` | BOOLEAN | NOT NULL, default false | Suspension flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |

### enrollments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Enrollment identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `enrolled_at` | TIMESTAMPTZ | NOT NULL, default now() | Enrollment time |

### user_progress

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Progress identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `status` | TEXT | NOT NULL, default 'not_started' | `not_started` / `in_progress` / `passed` / `failed` |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### semester_progress

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Progress identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `semester_id` | UUID | FK → semesters.id, NOT NULL | Semester |
| `is_completed` | BOOLEAN | NOT NULL, default false | Completion flag |
| `completed_at` | TIMESTAMPTZ | NULL | Completion time |

### capstone_submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Submission identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `title` | TEXT | NOT NULL | Project title |
| `description` | TEXT | NOT NULL | Project description |
| `repository_url` | TEXT | NULL | Code repository URL |
| `demo_url` | TEXT | NULL | Live demo URL |
| `status` | TEXT | NOT NULL, default 'pending' | `pending` / `passed` / `failed` |
| `feedback` | TEXT | NULL | Admin feedback |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | Submission time |
| `reviewed_at` | TIMESTAMPTZ | NULL | Review time |

---

## Bootcamp Tables

### standalone_courses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Bootcamp identifier |
| `title` | TEXT | NOT NULL | Bootcamp title |
| `description` | TEXT | NULL | Long description |
| `thumbnail_url` | TEXT | NULL | Cover image |
| `price` | INTEGER | NOT NULL | Price in kobo |
| `currency` | TEXT | NOT NULL, default 'NGN' | Currency |
| `status` | TEXT | NOT NULL, default 'draft' | `draft` / `published` / `unpublished` |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### standalone_lessons

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Lesson identifier |
| `course_id` | UUID | FK → standalone_courses.id, NOT NULL | Parent bootcamp |
| `title` | TEXT | NOT NULL | Lesson title |
| `content` | TEXT | NULL | Markdown notes |
| `video_url` | TEXT | NULL | YouTube URL |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |
| `duration_minutes` | INTEGER | NOT NULL, default 30 | Estimated duration |
| `is_published` | BOOLEAN | NOT NULL, default false | Visibility |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |

### standalone_purchases

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Purchase identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Buyer |
| `course_id` | UUID | FK → standalone_courses.id, NOT NULL | Bootcamp |
| `amount` | INTEGER | NOT NULL | Amount paid in kobo |
| `paystack_reference` | TEXT | UNIQUE, NOT NULL | Paystack ref |
| `purchased_at` | TIMESTAMPTZ | NOT NULL, default now() | Purchase time |

### standalone_lesson_progress

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Progress identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Student |
| `lesson_id` | UUID | FK → standalone_lessons.id, NOT NULL | Lesson |
| `completed` | BOOLEAN | NOT NULL, default false | Completion flag |
| `completed_at` | TIMESTAMPTZ | NULL | Completion time |

**Unique constraint:** `(user_id, lesson_id)`

---

## Shared Tables

### subscriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Subscription identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Subscriber |
| `plan_id` | UUID | FK → plans.id, NOT NULL | Plan |
| `status` | TEXT | NOT NULL, default 'active' | `active` / `cancelled` / `expired` |
| `current_period_end` | TIMESTAMPTZ | NULL | Expiry date |
| `paystack_reference` | TEXT | UNIQUE, NULL | Paystack ref |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |

### plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Plan identifier |
| `name` | TEXT | NOT NULL | Display name |
| `amount` | INTEGER | NOT NULL | Amount in kobo |
| `interval` | TEXT | NOT NULL | `semester` / `monthly` / `yearly` / `lifetime` |
| `currency` | TEXT | NOT NULL, default 'NGN' | Currency |
| `is_active` | BOOLEAN | NOT NULL, default true | Visibility |

### transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Transaction identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | User |
| `product` | TEXT | NOT NULL | `internship` / `university` / `bootcamp` |
| `amount` | INTEGER | NOT NULL | Amount in kobo |
| `currency` | TEXT | NOT NULL, default 'NGN' | Currency |
| `status` | TEXT | NOT NULL | `success` / `failed` / `pending` |
| `paystack_reference` | TEXT | UNIQUE, NULL | Paystack ref |
| `reference` | TEXT | UNIQUE, NULL | Internal reference |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Transaction time |

### suggestions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Suggestion identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Submitter |
| `title` | TEXT | NOT NULL | Suggestion title |
| `description` | TEXT | NOT NULL | Suggestion details |
| `status` | TEXT | NOT NULL, default 'pending' | `pending` / `approved` / `rejected` |
| `vote_count` | INTEGER | NOT NULL, default 0 | Upvote count |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Submission time |

### suggestion_votes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Vote identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Voter |
| `suggestion_id` | UUID | FK → suggestions.id, NOT NULL | Suggestion |
| `voted_at` | TIMESTAMPTZ | NOT NULL, default now() | Vote time |

### lesson_reactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Reaction identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | User |
| `lesson_id` | UUID | FK → lessons.id, NOT NULL | Lesson |
| `reaction` | TEXT | NOT NULL | `like` / `dislike` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Reaction time |

### lesson_comments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Comment identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Author |
| `lesson_id` | UUID | FK → lessons.id, NOT NULL | Lesson |
| `content` | TEXT | NOT NULL | Comment text |
| `parent_id` | UUID | FK → lesson_comments.id, NULL | Reply parent |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Comment time |

### lesson_comment_reactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Reaction identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | User |
| `comment_id` | UUID | FK → lesson_comments.id, NOT NULL | Comment |
| `reaction` | TEXT | NOT NULL | `like` / `dislike` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Reaction time |

### lesson_summaries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Summary identifier |
| `lesson_id` | UUID | FK → lessons.id, NOT NULL, UNIQUE | Lesson |
| `summary` | TEXT | NOT NULL | AI-generated summary |
| `generated_at` | TIMESTAMPTZ | NOT NULL, default now() | Generation time |

### lesson_deep_dive_links

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Link identifier |
| `lesson_id` | UUID | FK → lessons.id, NOT NULL | Lesson |
| `title` | TEXT | NOT NULL | Link title |
| `url` | TEXT | NOT NULL | Link URL |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |

### audit_log

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Log identifier |
| `admin_id` | UUID | FK → profiles.user_id, NOT NULL | Admin |
| `action` | TEXT | NOT NULL | e.g. `course.update` |
| `target_type` | TEXT | NOT NULL | e.g. `course`, `user` |
| `target_id` | UUID | NOT NULL | Affected record ID |
| `changes` | JSONB | NULL | Before/after snapshot |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Action time |

### webhook_events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Event identifier |
| `event_type` | TEXT | NOT NULL | e.g. `charge.success` |
| `payload` | JSONB | NOT NULL | Full webhook payload |
| `processed` | BOOLEAN | NOT NULL, default false | Processing flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Event time |

### notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Notification identifier |
| `user_id` | UUID | FK → profiles.user_id, NOT NULL | Recipient |
| `type` | TEXT | NOT NULL | Notification type |
| `title` | TEXT | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification body |
| `read` | BOOLEAN | NOT NULL, default false | Read flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation time |

### partnership_inquiries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Inquiry identifier |
| `name` | TEXT | NOT NULL | Contact name |
| `email` | TEXT | NOT NULL | Contact email |
| `company` | TEXT | NOT NULL | Company name |
| `message` | TEXT | NOT NULL | Inquiry details |
| `status` | TEXT | NOT NULL, default 'pending' | `pending` / `contacted` / `closed` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Submission time |

### course_prerequisites

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Prerequisite identifier |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `prerequisite_course_id` | UUID | FK → courses.id, NOT NULL | Required course |

### specialization_tracks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Track identifier |
| `name` | TEXT | NOT NULL | Track name |
| `department` | TEXT | NOT NULL | Department |
| `description` | TEXT | NULL | Track description |

### course_tracks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Mapping identifier |
| `course_id` | UUID | FK → courses.id, NOT NULL | Course |
| `track_id` | UUID | FK → specialization_tracks.id, NOT NULL | Track |
