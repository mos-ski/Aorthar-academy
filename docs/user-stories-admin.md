# Admin User Stories — Aorthar Academy

## Summary

| ID | Area | User Story | Priority |
|---|---|---|---|
| US-A01 | Curriculum | Create year levels (100–400) | High |
| US-A02 | Curriculum | Add semesters to a year | High |
| US-A03 | Curriculum | Delete a year or semester | Medium |
| US-A04 | Courses | Create a new course in a semester | High |
| US-A05 | Courses | Edit course metadata & grading settings | High |
| US-A06 | Courses | Publish / unpublish a course | High |
| US-A07 | Lessons | Add lessons to a course | High |
| US-A08 | Lessons | Edit an existing lesson | High |
| US-A09 | Lessons | Write Markdown lesson notes | Medium |
| US-A10 | Resources | Add resources to a lesson | High |
| US-A11 | Resources | Edit an existing resource | Medium |
| US-A12 | Questions | Add quiz / exam questions | High |
| US-A13 | Questions | Edit an existing question | High |
| US-A14 | Users | Search and filter the user list | Medium |
| US-A15 | Users | Change a user's role | Medium |
| US-A16 | Users | Grant / revoke premium access | Medium |
| US-A17 | Suggestions | Review and approve / reject suggestions | Medium |
| US-A18 | Capstone | Review capstone submissions | High |
| US-A19 | Payments | View all payment transactions | Low |

---

## 1. Curriculum Structure

| Field | Detail |
|---|---|
| **ID** | US-A01 |
| **Role** | Admin |
| **Story** | As an admin, I want to create year levels (100–400) in the curriculum so that I can build out the full academic structure before adding any courses. |
| **Route** | `/admin/curriculum` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on `/admin/curriculum` | I click "+ Year 100" (or any missing level) | A new year row is created and appears in the hierarchy immediately |
| 2 | Year 100 already exists | I view the curriculum page | The "+ Year 100" button is hidden — no duplicates allowed |

---

| Field | Detail |
|---|---|
| **ID** | US-A02 |
| **Role** | Admin |
| **Story** | As an admin, I want to add semesters (1 and 2) to each year so that I can organise courses into the correct academic term. |
| **Route** | `/admin/curriculum` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | Year 100 exists with no semesters | I click "+ Semester 1" | Semester 1 is created under Year 100 |
| 2 | Semester 1 and 2 both exist for a year | I view that year's card | No "Add Semester" button is shown (max 2 enforced) |

---

| Field | Detail |
|---|---|
| **ID** | US-A03 |
| **Role** | Admin |
| **Story** | As an admin, I want to delete a year or semester so that I can remove incorrectly created structures before courses are added. |
| **Route** | `/admin/curriculum` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I click the delete icon on a year | The confirmation dialog appears and I confirm | The year and all its semesters and courses are removed |
| 2 | I click the delete icon | I cancel the confirmation | Nothing is deleted |

---

## 2. Course Management

| Field | Detail |
|---|---|
| **ID** | US-A04 |
| **Role** | Admin |
| **Story** | As an admin, I want to create a new course inside a specific semester so that I can populate the curriculum with content incrementally. |
| **Route** | `/admin/courses` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A semester row is visible on `/admin/courses` | I click "+ New Course" and fill in code, name, and credit units | The course is created in draft status and appears in the table |
| 2 | The form has an empty code or name field | I click "Create Course" | An error toast is shown and the course is not created |

---

| Field | Detail |
|---|---|
| **ID** | US-A05 |
| **Role** | Admin |
| **Story** | As an admin, I want to edit a course's metadata (name, code, pass mark, weights, attempt limits) so that I can correct mistakes or update grading rules without recreating the course. |
| **Route** | `/admin/courses/[courseId]` → Settings tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on the course detail page | I click the "Settings" tab, change pass mark to 70, and click "Save Settings" | The value is updated in the database and a success toast appears |
| 2 | I set quiz_weight + exam_weight ≠ 1.0 | I save | The values are saved as-is (admin's responsibility to keep them valid) |

---

| Field | Detail |
|---|---|
| **ID** | US-A06 |
| **Role** | Admin |
| **Story** | As an admin, I want to publish or unpublish a course so that I can control which courses are visible to students. |
| **Route** | `/admin/courses/[courseId]` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A course is in draft status | I click "Publish" | Status changes to "published" and button label changes to "Unpublish" |
| 2 | A course is published | I click "Unpublish" | Status returns to "draft" and students can no longer see it |

---

## 3. Lesson Management

| Field | Detail |
|---|---|
| **ID** | US-A07 |
| **Role** | Admin |
| **Story** | As an admin, I want to add lessons to a course so that I can structure the learning content into individual sessions. |
| **Route** | `/admin/courses/[courseId]` → Lessons tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on the Lessons tab | I enter a title and duration and click "Add" | The lesson appears in the list with the correct sort order |
| 2 | The title field is empty | I click "Add" | An error toast is shown and no lesson is created |

---

| Field | Detail |
|---|---|
| **ID** | US-A08 |
| **Role** | Admin |
| **Story** | As an admin, I want to edit an existing lesson's title, duration, order, and published state so that I can correct errors without deleting and recreating the lesson. |
| **Route** | `/admin/courses/[courseId]` → Lessons tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A lesson exists in the list | I click the pencil icon | An inline edit form opens pre-populated with current values |
| 2 | The edit form is open | I update the title and click "Save" | The lesson list refreshes with the new title and a success toast appears |
| 3 | The edit form is open | I click "Cancel" | The form closes with no changes made |

---

| Field | Detail |
|---|---|
| **ID** | US-A09 |
| **Role** | Admin |
| **Story** | As an admin, I want to write Markdown lesson notes inside the lesson edit form so that students have written reference material alongside video resources. |
| **Route** | `/admin/courses/[courseId]` → Lessons tab → Edit |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am editing a lesson | I type Markdown into the content textarea and save | The content is stored and visible to students in the classroom viewer |

---

## 4. Resource Management

| Field | Detail |
|---|---|
| **ID** | US-A10 |
| **Role** | Admin |
| **Story** | As an admin, I want to add resources (YouTube videos, links, documents) to a lesson so that students have multiple learning materials per topic. |
| **Route** | `/admin/courses/[courseId]` → Lessons tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on the Lessons tab | I select a resource type, enter a title and URL, and click the add button | The resource appears under the correct lesson immediately |
| 2 | Title or URL is empty | I click the add button | An error toast is shown and no resource is created |

---

| Field | Detail |
|---|---|
| **ID** | US-A11 |
| **Role** | Admin |
| **Story** | As an admin, I want to edit an existing resource's type, title, and URL so that I can fix broken links or update outdated content. |
| **Route** | `/admin/courses/[courseId]` → Lessons tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A resource is listed under a lesson | I click its pencil icon | An inline edit row opens with current type, title, and URL pre-filled |
| 2 | The edit row is open | I update the URL and click the checkmark | The resource is updated and the edit row closes |

---

## 5. Quiz & Exam Questions

| Field | Detail |
|---|---|
| **ID** | US-A12 |
| **Role** | Admin |
| **Story** | As an admin, I want to add multiple-choice questions to the quiz or exam bank so that students are assessed on the lesson content. |
| **Route** | `/admin/courses/[courseId]` → Quiz / Exam tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on the Quiz (or Exam) tab | I enter question text, fill all 4 options, select the correct one, and click "Add Question" | The question appears in the list with the correct answer highlighted in green |
| 2 | Any option text is empty | I click "Add Question" | An error toast is shown and the question is not saved |

---

| Field | Detail |
|---|---|
| **ID** | US-A13 |
| **Role** | Admin |
| **Story** | As an admin, I want to edit an existing question's text, options, correct answer, and difficulty so that I can fix errors without deleting the question. |
| **Route** | `/admin/courses/[courseId]` → Quiz / Exam tab |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A question is in the quiz list | I click the pencil icon | An inline edit form opens pre-populated with current question data |
| 2 | The edit form is open | I change the correct answer radio and click "Save" | The question is updated and the old answer is no longer highlighted green |

---

## 6. User Management

| Field | Detail |
|---|---|
| **ID** | US-A14 |
| **Role** | Admin |
| **Story** | As an admin, I want to search and filter the user list by name, email, or role so that I can quickly locate a specific user without scrolling through all records. |
| **Route** | `/admin/users` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I am on `/admin/users` | I type a name or email into the search box | Table rows filter in real time to show only matching users |
| 2 | I am on `/admin/users` | I select "Contributor" in the role dropdown | Only contributor accounts are shown |
| 3 | Both a search term and role filter are active | — | Only users matching both criteria are shown |

---

| Field | Detail |
|---|---|
| **ID** | US-A15 |
| **Role** | Admin |
| **Story** | As an admin, I want to change a user's role (student → contributor → admin) so that I can grant or revoke elevated access. |
| **Route** | `/admin/users` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I find a student user in the users table | I use the role action to promote them to contributor | Their badge updates to "Contributor" on next page load |

---

| Field | Detail |
|---|---|
| **ID** | US-A16 |
| **Role** | Admin |
| **Story** | As an admin, I want to grant or revoke a user's premium access so that I can handle manual overrides for payment issues or comp accounts. |
| **Route** | `/admin/users` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A user does not have an active subscription | I click "Grant Premium" in their action menu | An active subscription record is created for that user |

---

## 7. Content Suggestions

| Field | Detail |
|---|---|
| **ID** | US-A17 |
| **Role** | Admin |
| **Story** | As an admin, I want to review student content suggestions (approve or reject) so that valuable ideas are acted on and contributors are recognised. |
| **Route** | `/admin/suggestions` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A suggestion is pending review | I click "Approve" | Suggestion status changes to "approved" and the student's contribution count increments |
| 2 | A suggestion is pending review | I click "Reject" | Suggestion status changes to "rejected" |

---

## 8. Capstone Review

| Field | Detail |
|---|---|
| **ID** | US-A18 |
| **Role** | Admin |
| **Story** | As an admin, I want to review capstone submissions and mark them passed or failed so that eligible students can graduate from the programme. |
| **Route** | `/admin/capstone` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | A capstone submission is pending | I click "Pass" | Submission status updates to "passed" and the student's graduation eligibility is updated |
| 2 | A capstone submission is pending | I click "Fail" | Submission status updates to "failed" and the student may resubmit |

---

## 9. Payments Overview

| Field | Detail |
|---|---|
| **ID** | US-A19 |
| **Role** | Admin |
| **Story** | As an admin, I want to view all payment transactions so that I can audit revenue and investigate failed or disputed payments. |
| **Route** | `/admin/payments` |

| # | Given | When | Then |
|---|---|---|---|
| 1 | I navigate to `/admin/payments` | — | I see a table of all transactions with amount, status, user, and date |
