# Aorthar Academy: Student Onboarding & Academic Journey

This document outlines the user journey for a new student entering the Faculty of Product Development at Aorthar Academy.

## Phase 1: Admission & Matriculation (Onboarding)

### 1. The Campus Gate (Landing Page)
*   **Concept**: The student arrives at the university gate.
*   **Action**: Student clicks "Get Started" or "Apply Now".
*   **System**: User creates an account (Email/Password or OAuth).

### 2. Faculty Orientation (Department Selection)
*   **Concept**: The student enters the **Faculty of Product Development**. They must now declare their major.
*   **Action**: The student selects their **Department** from the available list.
    *   *Available Departments*: UI/UX Design, Product Management, Product Design, Design Engineering (FE), Backend, Scrum, Operations, QA.
    *   *Note*: Currently, the Design Department is the primary active track.
*   **System**: The system tags the user profile with the selected `department_id`. This filters the curriculum they will see (e.g., a UI/UX student won't see Backend Engineering courses in their core schedule).

---

## Phase 2: The Semester Begins (Learning)

### 3. Course Registration (Dashboard)
*   **Concept**: The student receives their timetable for **Year 100, Semester 1**.
*   **Action**: The student lands on the Dashboard.
*   **System**:
    *   The system automatically unlocks entry-level courses (e.g., **DST 101: Design Thinking**).
    *   The student sees a load of **5–8 courses** for the semester.

### 4. Attending Classes (The Curriculum)
*   **Concept**: Attending weekly lectures.
*   **Structure**:
    *   **Course**: DST 101 (Design Thinking).
    *   **Duration**: 12 Weeks (3 Months).
    *   **Curriculum**: 12 Classes (Lessons).
*   **Action**:
    *   Student clicks on **DST 101**.
    *   Student sees the syllabus list (Class 1 to Class 12).
    *   Student clicks **Class 1**.
    *   **Lecture**: The student watches the lecture (YouTube Embed).
    *   **Attendance**: Student marks the class as "Completed" to unlock the next one.

---

## Phase 3: Assessment & Records (Exams & GPA)

### 5. Examination
*   **Concept**: End-of-semester exams.
*   **Prerequisite**: All 12 classes in the course must be marked as complete.
*   **Action**:
    *   Student clicks "Take Final Exam" or "Take Quiz".
    *   Student answers questions (Multiple Choice/Theory) within a time limit.
*   **System**: The Assessment Engine grades the attempt instantly (or queues for review).

### 6. Academic Record (GPA)
*   **Concept**: Receiving grades.
*   **Action**: Student checks the "GPA & Grades" section of their profile.
*   **System**:
    *   The score (e.g., 85%) is converted to a Grade Point (e.g., 4.5/5.0).
    *   This contributes to the **Cumulative GPA (CGPA)**.

### 7. Progression
*   **Concept**: Moving to the next level.
*   **Rule**: Once all Semester 1 courses are passed, **Semester 2** unlocks. Once Year 100 is done, **Year 200** unlocks.

---

## Implementation Mapping (Current Project)

### Signup + Onboarding
1. `GET /register`
   - Collects `full_name`, `email`, `password`, `department`.
2. `POST auth.signUp`
   - Saves `full_name` and `department` in user metadata.
3. `GET /onboarding`
   - Required for all new students before dashboard access.
   - Confirms/sets department and starts entry semester.
4. `POST /api/onboarding/complete`
   - Updates `profiles.department` and `profiles.onboarding_completed_at`.
   - Enrolls student into up to 8 Year 100 Semester 1 published courses.
   - Prioritizes foundation course `DST101` / `DES101`.

### Middleware Gate
- If user role is `student` and onboarding is incomplete:
  - Redirect all protected pages to `/onboarding`.
- If onboarding is complete:
  - Visiting `/onboarding` redirects to `/dashboard`.

### Data Model Extensions
- `profiles.department`
- `profiles.onboarding_completed_at`

### Academic Start Logic
- Entry unlock remains `Year 100 / Semester 1`.
- Student is auto-enrolled into first-semester course load and begins class journey from foundation course.

---
