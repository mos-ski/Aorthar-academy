# Internship Product — User Stories

**Last Updated:** 2026-04-03

---

## Applicant Stories

| ID | Story | Priority |
|---|---|---|
| IN-A01 | As an applicant, I want to browse the internship landing page so that I can understand the program | High |
| IN-A02 | As an applicant, I want to buy an application form (₦10,000) so that I can register for the next cohort | High |
| IN-A03 | As an applicant, I want to receive my access code via email so that I can take the exam | High |
| IN-A04 | As an applicant, I want to enter the exam with my name and access code so that I can take the assessment | High |
| IN-A05 | As an applicant, I want to take the exam within the time limit so that I can demonstrate my skills | High |
| IN-A06 | As an applicant, I want to receive my results via email so that I know if I was selected | High |
| IN-A07 | As a selected intern, I want to know my placement details so that I can start my internship | High |
| IN-A08 | As a completed intern, I want to receive my certificate so that I can showcase it | Medium |

---

### IN-A01 — Browse Landing Page

| Field | Detail |
|-------|--------|
| **ID** | IN-A01 |
| **Role** | Visitor |
| **Story** | As a visitor, I want to browse the internship landing page so that I can understand the program, eligibility, and next cohort dates. |
| **Route** | `internship.aorthar.com/` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I visit the internship landing page | I scroll through the page | I see the program overview, how it works, eligibility, next cohort date, and testimonials |
| 2 | The next cohort registration is open | I see the page | I see an "Apply Now" button |
| 3 | The next cohort registration is closed | I see the page | I see "Registration Closed" with the next cohort's expected date |

---

### IN-A02 — Buy Application Form

| Field | Detail |
|-------|--------|
| **ID** | IN-A02 |
| **Role** | Applicant |
| **Story** | As an applicant, I want to buy an application form (₦10,000) so that I can register for the next cohort. |
| **Route** | `internship.aorthar.com/apply` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | Registration is open | I click "Buy Form" | I am redirected to Paystack checkout for ₦10,000 |
| 2 | My payment is successful | — | I receive an email with my access code and a link to take the exam |
| 3 | My payment fails | — | I see an error and can retry |
| 4 | Registration is closed | I visit the page | I see "Registration Closed" and cannot buy a form |

---

### IN-A03 — Receive Access Code

| Field | Detail |
|-------|--------|
| **ID** | IN-A03 |
| **Role** | Applicant |
| **Story** | As an applicant, I want to receive my access code via email so that I can take the exam. |
| **Route** | Email → `internship.aorthar.com/quiz/enter` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have paid for my form | — | I receive an email with my access code and exam instructions |
| 2 | I lose my access code | I contact support | I can recover my code via email lookup |

---

### IN-A04 — Enter Exam

| Field | Detail |
|-------|--------|
| **ID** | IN-A04 |
| **Role** | Applicant |
| **Story** | As an applicant, I want to enter the exam with my name and access code so that I can take the assessment. |
| **Route** | `internship.aorthar.com/quiz/enter` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I am on the exam entry page | I enter my name and access code and click "Start" | My code is validated and I am taken to the exam |
| 2 | My access code is invalid | I try to enter | I see an error message |
| 3 | My access code has already been used | I try to enter | I see a message that I've already taken the exam |
| 4 | The exam window is closed | I try to enter | I see a message that the exam window is closed |

---

### IN-A05 — Take Exam

| Field | Detail |
|-------|--------|
| **ID** | IN-A05 |
| **Role** | Applicant |
| **Story** | As an applicant, I want to take the exam within the time limit so that I can demonstrate my skills. |
| **Route** | `internship.aorthar.com/quiz/take` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have entered the exam | — | I see MCQ and essay questions with a 90-minute countdown timer |
| 2 | I answer all questions | I click "Submit" | My answers are recorded and my session is closed |
| 3 | The timer runs out | — | My exam is auto-submitted with whatever I've answered so far |
| 4 | I close my browser | I reopen the exam URL | I can resume (if within time window) or my session is lost (depending on implementation) |

---

### IN-A06 — Receive Results

| Field | Detail |
|-------|--------|
| **ID** | IN-A06 |
| **Role** | Applicant |
| **Story** | As an applicant, I want to receive my results via email so that I know if I was selected. |
| **Route** | Email notification |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I have taken the exam | Admin publishes results | I receive an email with my score and whether I was selected |
| 2 | I was selected (top 10) | — | I receive details about my placement and next steps |
| 3 | I was not selected | — | I receive an encouraging message and information about future cohorts |

---

### IN-A07 — Placement Details

| Field | Detail |
|-------|--------|
| **ID** | IN-A07 |
| **Role** | Selected Intern |
| **Story** | As a selected intern, I want to know my placement details so that I can start my internship. |
| **Route** | Email + placement dashboard |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I was selected | I receive my placement email | I see the startup name, role, start date, and onboarding instructions |
| 2 | I visit my placement dashboard | — | I see my placement status, progress, and certificate eligibility |

---

### IN-A08 — Certificate

| Field | Detail |
|-------|--------|
| **ID** | IN-A08 |
| **Role** | Completed Intern |
| **Story** | As a completed intern, I want to receive my certificate so that I can showcase it. |
| **Route** | Email + download |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | My 3-month placement is complete | Admin marks it as completed | I receive a certificate via email and can download it from my dashboard |

---

## Admin Stories

| ID | Story | Priority |
|---|---|---|
| IN-AD01 | As an admin, I want to open/close registration for a cohort so that I can control application windows | High |
| IN-AD02 | As an admin, I want to view all applications for a cohort so that I can review applicants | High |
| IN-AD03 | As an admin, I want to review exam scores so that I can select the top 10 | High |
| IN-AD04 | As an admin, I want to assign placements to selected interns so that they can start their internship | High |
| IN-AD05 | As an admin, I want to mark placements as completed and issue certificates so that interns receive recognition | Medium |

---

### IN-AD01 — Manage Cohort Registration

| Field | Detail |
|-------|--------|
| **ID** | IN-AD01 |
| **Role** | Admin |
| **Story** | As an admin, I want to open/close registration for a cohort so that I can control application windows. |
| **Route** | `/admin/internship/cohorts` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | A cohort is in draft status | I click "Open Registration" | The cohort status changes to `registration_open` and forms become purchasable |
| 2 | A cohort has registration open | I click "Close Registration" | The status changes to `registration_closed` and no new forms can be bought |

---

### IN-AD02 — View Applications

| Field | Detail |
|-------|--------|
| **ID** | IN-AD02 |
| **Role** | Admin |
| **Story** | As an admin, I want to view all applications for a cohort so that I can review applicants. |
| **Route** | `/admin/internship/applications` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | I view the applications page | — | I see a table of all applicants with name, email, payment status, exam status, and score |
| 2 | I filter by exam status | — | I see only applicants matching the selected status |

---

### IN-AD03 — Review Exam Scores

| Field | Detail |
|-------|--------|
| **ID** | IN-AD03 |
| **Role** | Admin |
| **Story** | As an admin, I want to review exam scores so that I can select the top 10. |
| **Route** | `/admin/internship/results` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | All exams are submitted | I view the results page | I see all applicants ranked by score |
| 2 | I select the top 10 | I click "Confirm Selection" | The top 10 are marked as `selected` and notification emails are queued |

---

### IN-AD04 — Assign Placements

| Field | Detail |
|-------|--------|
| **ID** | IN-AD04 |
| **Role** | Admin |
| **Story** | As an admin, I want to assign placements to selected interns so that they can start their internship. |
| **Route** | `/admin/internship/placements` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | An intern is selected | I assign a startup and start date | A placement record is created and the intern receives their details via email |

---

### IN-AD05 — Issue Certificates

| Field | Detail |
|-------|--------|
| **ID** | IN-AD05 |
| **Role** | Admin |
| **Story** | As an admin, I want to mark placements as completed and issue certificates so that interns receive recognition. |
| **Route** | `/admin/internship/placements` |

| # | Given | When | Then |
|---|-------|------|------|
| 1 | A placement is active and the end date has passed | I click "Mark Completed" | The placement status changes to `completed` and a certificate is generated |
| 2 | A certificate is generated | — | The intern receives it via email and can download it |

---

## See Also

- [Internship Overview](./00-overview.md)
- [Internship Architecture](./01-architecture.md)
