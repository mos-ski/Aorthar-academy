# Email Templates Reference

**Last Updated:** 2026-04-03

---

## Overview

All transactional emails are sent via **Resend**. This document lists every email template with its copy and variables.

---

## Templates

### 1. Welcome Email

**Trigger:** New account creation (after email verification)
**Template:** `welcome`

**Subject:** Welcome to Aorthar Academy!

**Body:**
```
Hi {{full_name}},

Welcome to Aorthar Academy! We're excited to have you on board.

{{#if department}}
You're enrolled in the {{department}} department. Your Year 100 Semester 1 courses are ready to start.
{{else}}
Browse our bootcamps or apply for the next internship cohort to get started.
{{/if}}

Get started: {{dashboard_url}}

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | User's display name |
| `department` | Enrolled department (if any) |
| `dashboard_url` | Link to user's dashboard |

---

### 2. Password Reset

**Trigger:** User requests password reset
**Template:** `password-reset`

**Subject:** Reset Your Aorthar Password

**Body:**
```
Hi {{full_name}},

You requested a password reset for your Aorthar Academy account.

Click the link below to reset your password:
{{reset_url}}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | User's display name |
| `reset_url` | Password reset link (expires in 1 hour) |

---

### 3. Purchase Confirmation (University)

**Trigger:** Successful subscription payment
**Template:** `purchase-confirmation`

**Subject:** Your Aorthar Academy Subscription is Active!

**Body:**
```
Hi {{full_name}},

Your subscription to Aorthar Academy is now active.

Plan: {{plan_name}}
Amount: ₦{{amount}}
Reference: {{reference}}

You now have access to Year 400 courses and the capstone project.

Start learning: {{dashboard_url}}

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | User's display name |
| `plan_name` | Subscription plan name |
| `amount` | Amount paid |
| `reference` | Transaction reference |
| `dashboard_url` | Link to dashboard |

---

### 4. Purchase Confirmation (Bootcamp)

**Trigger:** Successful bootcamp purchase
**Template:** `purchase-confirmation-bootcamp`

**Subject:** You're In! Start Learning {{bootcamp_title}}

**Body:**
```
Hi {{full_name}},

You now have permanent access to {{bootcamp_title}}.

Start learning: {{player_url}}

Your access never expires. Enjoy!

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | User's display name |
| `bootcamp_title` | Purchased bootcamp title |
| `player_url` | Link to lesson player |

---

### 5. Internship Access Code

**Trigger:** Successful internship form payment
**Template:** `internship-access-code`

**Subject:** Your Aorthar Internship Application Access Code

**Body:**
```
Hi {{full_name}},

Thank you for purchasing your application form for the {{cohort_name}} cohort.

Your Access Code: {{access_code}}

To take the exam, visit: {{exam_url}}
Enter your name and the access code above.

Exam Window: {{exam_open_at}} — {{exam_close_at}}

Good luck!
The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Applicant name |
| `cohort_name` | Cohort name |
| `access_code` | Unique exam entry code |
| `exam_url` | Link to exam entry page |
| `exam_open_at` | Exam window start |
| `exam_close_at` | Exam window end |

---

### 6. Internship Results (Selected)

**Trigger:** Admin selects top 10
**Template:** `internship-results-selected`

**Subject:** 🎉 Congratulations! You've Been Selected for Aorthar Internship

**Body:**
```
Hi {{full_name}},

Congratulations! You've been selected for the Aorthar Internship {{cohort_name}} cohort.

Your placement:
  Startup: {{startup_name}}
  Role: {{role}}
  Start Date: {{start_date}}
  Duration: 3 months

Next Steps:
  1. Confirm your acceptance by replying to this email
  2. Attend the onboarding session on {{onboarding_date}}
  3. Prepare your portfolio/CV for your startup

We're excited to have you on board!

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Intern name |
| `cohort_name` | Cohort name |
| `startup_name` | Assigned startup |
| `role` | Intern role |
| `start_date` | Placement start date |
| `onboarding_date` | Onboarding session date |

---

### 7. Internship Results (Not Selected)

**Trigger:** Admin publishes results
**Template:** `internship-results-not-selected`

**Subject:** Aorthar Internship Results — {{cohort_name}}

**Body:**
```
Hi {{full_name}},

Thank you for taking the Aorthar Internship exam for the {{cohort_name}} cohort.

Your score: {{score}}/100

While you weren't selected for this cohort, we encourage you to apply for the next one. Keep building your skills and trying again.

Next cohort expected: {{next_cohort_date}}

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Applicant name |
| `cohort_name` | Cohort name |
| `score` | Exam score |
| `next_cohort_date` | Expected next cohort date |

---

### 8. Internship Certificate

**Trigger:** Admin marks placement as completed
**Template:** `internship-certificate`

**Subject:** Your Aorthar Internship Certificate

**Body:**
```
Hi {{full_name}},

Congratulations on completing your Aorthar Internship!

Your certificate is attached. You can also download it at any time from: {{certificate_url}}

We're proud of what you've accomplished. Keep building!

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Intern name |
| `certificate_url` | Certificate download link |

---

### 9. Capstone Review

**Trigger:** Admin reviews capstone submission
**Template:** `capstone-review`

**Subject:** Your Capstone Has Been {{status}}

**Body:**
```
Hi {{full_name}},

Your capstone project has been reviewed.

Status: {{status}}
{{#if feedback}}
Feedback: {{feedback}}
{{/if}}

{{#if status === 'passed'}}
Congratulations! You have graduated from Aorthar Academy.
{{else}}
You can resubmit your capstone with the feedback above.
{{/if}}

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Student name |
| `status` | `passed` or `failed` |
| `feedback` | Admin feedback (if any) |

---

### 10. Bootcamp Certificate

**Trigger:** User completes all bootcamp lessons
**Template:** `bootcamp-certificate`

**Subject:** Congratulations! You've Completed {{bootcamp_title}}

**Body:**
```
Hi {{full_name}},

Congratulations on completing {{bootcamp_title}}!

Your certificate is available for download: {{certificate_url}}

Keep learning and building!

The Aorthar Team
```

**Variables:**
| Variable | Description |
|----------|-------------|
| `full_name` | Learner name |
| `bootcamp_title` | Completed bootcamp title |
| `certificate_url` | Certificate download link |
