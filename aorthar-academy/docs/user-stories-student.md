# Student User Stories — Aorthar Academy

## Summary

| ID | Area | User Story | Priority |
|---|---|---|---|
| US-S01 | Auth | Register with name, email, and password | High |
| US-S02 | Onboarding | Select department and enrol in Semester 1 courses | High |
| US-S03 | Auth | Log in with email and password | High |
| US-S04 | Dashboard | View GPA, credits, and course status at a glance | High |
| US-S05 | Dashboard | See enrolled Semester 1 courses immediately after onboarding | High |
| US-S06 | Courses | Browse all courses organised by year and semester | High |
| US-S07 | Courses | Identify premium courses that require a subscription | Medium |
| US-S08 | Classroom | Watch lesson video and read lesson notes | High |
| US-S09 | Classroom | View supplementary materials attached to a lesson | Medium |
| US-S10 | Classroom | Discover related lessons in the classroom | Low |
| US-S11 | Quizzes | Take the quiz for a course and see results | High |
| US-S12 | Quizzes | See remaining attempts and cooldown time | Medium |
| US-S13 | Exams | Take the timed final exam for a course | High |
| US-S14 | Exams | Know whether I passed or failed after the exam | High |
| US-S15 | Progression | Semester 2 unlocks after passing all Semester 1 courses | High |
| US-S16 | Progression | Year 200–400 unlocks after completing the previous year | High |
| US-S17 | GPA | View semester GPA and cumulative GPA | High |
| US-S18 | GPA | See per-course grade breakdown | Medium |
| US-S19 | Progress | View an overall progress summary across all courses | Medium |
| US-S20 | Capstone | Submit a capstone project when eligible | High |
| US-S21 | Capstone | See capstone submission status (pending / passed / failed) | Medium |
| US-S22 | Suggestions | Suggest new lesson topics or resources | Low |
| US-S23 | Payments | Subscribe to premium via Paystack | High |
| US-S24 | Settings | Update profile name and avatar | Low |

---

## 1. Registration & Onboarding

| Field | Detail |
|---|---|
| **ID** | US-S01 |
| **Role** | Prospective student |
| **Story** | As a prospective student, I want to create an account with my name, email, and password so that I can access the Aorthar Academy platform. |
| **Route** | `/register` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on `/register` | I fill in my full name, email, and a valid password and submit | My account is created and I am redirected to the onboarding page |
| 2 | I submit with an email that is already registered | — | An error message is shown and no duplicate account is created |

---

| Field | Detail |
|---|---|
| **ID** | US-S02 |
| **Role** | New student |
| **Story** | As a new student, I want to select my department during onboarding so that I am enrolled in the courses relevant to my chosen discipline. |
| **Route** | `/onboarding` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on `/onboarding` | I select a department from the dropdown | The info panel updates to show the Semester 1 course codes for that department |
| 2 | I have selected a department | I click "Complete Onboarding" | My profile is updated and I am enrolled in the correct Semester 1 courses |
| 3 | I have already completed onboarding | I navigate to `/onboarding` | I am redirected to `/dashboard` |

---

| Field | Detail |
|---|---|
| **ID** | US-S03 |
| **Role** | Student |
| **Story** | As a student, I want to log in with my email and password so that I can access my personalised dashboard and course progress. |
| **Route** | `/login` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have a registered account | I enter my correct email and password and click "Sign In" | I am redirected to `/dashboard` |
| 2 | I enter an incorrect password | — | An error message is shown and I remain on the login page |

---

## 2. Dashboard

| Field | Detail |
|---|---|
| **ID** | US-S04 |
| **Role** | Student |
| **Story** | As a student, I want to see my current GPA, credit count, courses passed, and courses in progress on my dashboard so that I have an at-a-glance view of my academic standing. |
| **Route** | `/dashboard` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am logged in and have completed at least one quiz | I navigate to `/dashboard` | Stat cards show my GPA (out of 5.0), total credits, passed courses, and in-progress courses |

---

| Field | Detail |
|---|---|
| **ID** | US-S05 |
| **Role** | Student |
| **Story** | As a student, I want to see my enrolled Semester 1 courses on the dashboard so that I know where to start learning immediately after onboarding. |
| **Route** | `/dashboard` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have completed onboarding | I visit `/dashboard` | My enrolled Semester 1 courses are listed with status: not started / in progress / passed |

---

## 3. Course Browsing

| Field | Detail |
|---|---|
| **ID** | US-S06 |
| **Role** | Student |
| **Story** | As a student, I want to browse all courses organised by year (100–400) and semester so that I can understand the full programme structure. |
| **Route** | `/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/courses` | I view the tabs for Year 100, 200, 300, 400 | Each tab shows the semesters and courses for that year |
| 2 | A course is locked (prerequisite not met) | — | It is shown with a locked indicator and I cannot enter it |

---

| Field | Detail |
|---|---|
| **ID** | US-S07 |
| **Role** | Student |
| **Story** | As a student, I want to see which courses are premium so that I know I need a subscription before I can access Year 400 content. |
| **Route** | `/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I view the Year 400 tab | I am not a premium subscriber | Courses show a "Premium" badge and I am redirected to `/pricing` if I try to access them |

---

## 4. Classroom (Course Viewer)

| Field | Detail |
|---|---|
| **ID** | US-S08 |
| **Role** | Student |
| **Story** | As a student, I want to watch the lesson video and read the lesson notes inside the classroom so that I can learn the course material. |
| **Route** | `/classroom/[courseId]` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I enter a course I am enrolled in | I select a lesson | The YouTube video (or resource link) is displayed alongside any written Markdown notes |

---

| Field | Detail |
|---|---|
| **ID** | US-S09 |
| **Role** | Student |
| **Story** | As a student, I want to view additional materials (links, documents) attached to a lesson so that I can explore supplementary resources. |
| **Route** | `/classroom/[courseId]` → Materials tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A lesson has resources attached | I click the "Materials" tab | All resources are listed with their type badge and a clickable link |

---

| Field | Detail |
|---|---|
| **ID** | US-S10 |
| **Role** | Student |
| **Story** | As a student, I want to see related lessons or courses suggested in the classroom so that I can discover content that builds on what I am studying. |
| **Route** | `/classroom/[courseId]` → Related tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am in the classroom viewer | I click the "Related" tab | A list of related lessons or courses is shown |

---

## 5. Quizzes

| Field | Detail |
|---|---|
| **ID** | US-S11 |
| **Role** | Student |
| **Story** | As a student, I want to take the quiz for a course so that I can test my understanding and earn a quiz score. |
| **Route** | `/classroom/[courseId]/quiz/[attemptId]` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am enrolled in a course and navigate to its quiz | I click "Start Quiz" | A shuffled set of questions is presented without revealing correct answers |
| 2 | I have answered all questions | I submit | I see my score and which answers were correct or incorrect |

---

| Field | Detail |
|---|---|
| **ID** | US-S12 |
| **Role** | Student |
| **Story** | As a student, I want to know how many quiz attempts I have remaining so that I can decide when to attempt the quiz. |
| **Route** | Quiz start page |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have used 2 of my 3 allowed attempts | I view the quiz start page | I see "1 attempt remaining" |
| 2 | I have exhausted all attempts and am in a cooldown | — | I see the cooldown end time and cannot start a new attempt |

---

## 6. Exams

| Field | Detail |
|---|---|
| **ID** | US-S13 |
| **Role** | Student |
| **Story** | As a student, I want to take the final exam for a course so that I can earn an exam score and have my overall course grade calculated. |
| **Route** | `/classroom/[courseId]` → Exam |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have completed the quiz for a course | I start the exam | A timed exam with the correct number of questions is presented |
| 2 | I submit (or time runs out) | — | My exam score is recorded and my grade is computed: `(quiz_weight × quiz_score) + (exam_weight × exam_score)` |

---

| Field | Detail |
|---|---|
| **ID** | US-S14 |
| **Role** | Student |
| **Story** | As a student, I want to know if I passed or failed a course after the exam so that I understand whether I can progress to the next semester. |
| **Route** | `/progress` / `/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | My calculated grade meets or exceeds the pass mark (default 60%) | — | The course is marked "Passed" in my progress |
| 2 | My grade is below the pass mark | — | The course is marked "Failed" and I may reattempt if attempts remain |

---

## 7. Progression

| Field | Detail |
|---|---|
| **ID** | US-S15 |
| **Role** | Student |
| **Story** | As a student, I want Semester 2 to unlock automatically after I pass all Semester 1 courses so that I can advance without manual intervention. |
| **Route** | `/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | All my Semester 1 courses are "Passed" | I view `/courses` | Semester 2 courses are unlocked and available |
| 2 | At least one Semester 1 course is not yet passed | I view `/courses` | Semester 2 remains locked |

---

| Field | Detail |
|---|---|
| **ID** | US-S16 |
| **Role** | Student |
| **Story** | As a student, I want Year 200, 300, and 400 to unlock when I complete all courses in the previous year so that I progress through the four-year curriculum in sequence. |
| **Route** | `/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | All Year 100 courses (Sem 1 and 2) are passed | I check `/courses` | Year 200 is unlocked |
| 2 | Year 400 is unlocked but I have no premium subscription | I try to access a Year 400 course | I am redirected to `/pricing` |

---

## 8. GPA & Grades

| Field | Detail |
|---|---|
| **ID** | US-S17 |
| **Role** | Student |
| **Story** | As a student, I want to view my semester GPA and cumulative GPA so that I can track my academic performance over time. |
| **Route** | `/gpa` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have completed at least one course with a grade | I navigate to `/gpa` | I see my GPA on a 5.0 scale broken down by semester and cumulated across all completed years |

---

| Field | Detail |
|---|---|
| **ID** | US-S18 |
| **Role** | Student |
| **Story** | As a student, I want to see a grade breakdown per course (quiz score, exam score, final grade) so that I understand exactly how my GPA was calculated. |
| **Route** | `/gpa` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on `/gpa` | I view the grades table | Each row shows course code, quiz score (%), exam score (%), final grade (%), and letter grade |

---

## 9. Progress Tracking

| Field | Detail |
|---|---|
| **ID** | US-S19 |
| **Role** | Student |
| **Story** | As a student, I want to see an overall progress summary showing how many courses I have passed, failed, and still need to complete so that I can plan the rest of my studies. |
| **Route** | `/progress` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/progress` | — | I see a visual summary of courses by status: not started / in progress / passed / failed |

---

## 10. Capstone

| Field | Detail |
|---|---|
| **ID** | US-S20 |
| **Role** | Student |
| **Story** | As a student, I want to submit a capstone project when I have completed all Year 400 courses and my GPA is ≥ 3.5 so that I can graduate from the programme. |
| **Route** | `/capstone` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have passed all 400-level courses, GPA ≥ 3.5, and hold an active premium subscription | I navigate to `/capstone` | The submission form is enabled and I can submit my project |
| 2 | Any one of the three conditions is not met | I navigate to `/capstone` | The form is locked with a message explaining what is missing |

---

| Field | Detail |
|---|---|
| **ID** | US-S21 |
| **Role** | Student |
| **Story** | As a student, I want to see the status of my capstone submission (pending / passed / failed) so that I know whether I need to resubmit. |
| **Route** | `/capstone` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I have submitted my capstone and it is under review | I visit `/capstone` | I see a "Pending Review" status indicator |
| 2 | The admin has marked my capstone as passed | I visit `/capstone` | I see a "Passed" status and my graduation eligibility is confirmed |

---

## 11. Content Suggestions

| Field | Detail |
|---|---|
| **ID** | US-S22 |
| **Role** | Student |
| **Story** | As a student, I want to suggest new lesson topics or resources so that I can contribute to improving course content for other students. |
| **Route** | `/suggest` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/suggest` | I fill in a title and description and submit | The suggestion is sent for admin review and I see a confirmation message |
| 2 | My suggestion is approved by an admin | — | My suggestion count increments; at 3 approvals my role is promoted to Contributor |

---

## 12. Premium Subscription

| Field | Detail |
|---|---|
| **ID** | US-S23 |
| **Role** | Student |
| **Story** | As a student, I want to subscribe to a premium plan via Paystack so that I can unlock Year 400 courses and the capstone submission. |
| **Route** | `/pricing` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/pricing` | I click "Subscribe" and complete the Paystack payment | My subscription status updates to "active" and Year 400 courses are immediately accessible |
| 2 | My payment fails or is cancelled | — | My subscription status is unchanged and I see an error message |

---

## 13. Settings

| Field | Detail |
|---|---|
| **ID** | US-S24 |
| **Role** | Student |
| **Story** | As a student, I want to update my profile (full name, avatar) so that my account information stays accurate. |
| **Route** | `/settings` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/settings` | I update my name and save | My new name is reflected in the sidebar and navbar |
