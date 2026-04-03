# Module 04: Results & Placement

## Overview

After all exams are submitted and graded, the admin selects the top 10 performers. Results are communicated via email, and selected interns are placed at startups for 3-month internships.

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /results` | GET | Results page (for applicants to check status) |
| `POST /api/internship/exam/grade` | POST | Admin action to grade all submissions |
| `POST /api/internship/select-top` | POST | Admin selects top 10 |
| `POST /api/internship/placements` | POST | Admin creates placement records |

## Results Page Flow

```
Applicant → /results → Enter email or access code →
System looks up application → Shows:
  - Exam submitted (pending results)
  - Results published (score + selected/not selected)
  - Placement active (startup details + start date)
  - Placement completed (certificate download)
```

## Admin Flow

```
Admin → /admin/internship/results → View all scores ranked →
Click "Select Top 10" → Top 10 marked as selected →
Notification emails queued for all applicants →
Admin → /admin/internship/placements → Assign startups to selected →
Placement emails sent →
After 3 months → Mark completed → Issue certificates
```

## Database

### internship_exam_results (updated)

| Column | Update |
|--------|--------|
| `score` | Set after admin grading |
| `submitted_at` | Already set on submission |

### internship_applications (updated)

| Column | Update |
|--------|--------|
| `exam_status` | `graded` |
| `exam_score` | Set from exam_results |
| `selected` | `true` for top 10 |

### internship_placements (created for top 10)

| Column | Value |
|--------|-------|
| `application_id` | FK to selected application |
| `startup_name` | Admin-entered |
| `role` | Admin-entered |
| `start_date` | Admin-entered |
| `end_date` | Auto-calculated (start + 3 months) |
| `status` | `pending` → `active` → `completed` |
| `certificate_issued` | `false` → `true` |
| `certificate_url` | Set on certificate generation |

## Email Templates

### Not Selected

**Subject:** Aorthar Internship Results — {cohort_name}

```
Hi {name},

Thank you for taking the Aorthar Internship exam for the {cohort_name} cohort.

Your score: {score}/100

While you weren't selected for this cohort, we encourage you to apply for the next one. Keep building your skills and trying again.

Next cohort expected: {next_cohort_date}

The Aorthar Team
```

### Selected

**Subject:** 🎉 Congratulations! You've Been Selected for Aorthar Internship

```
Hi {name},

Congratulations! You've been selected for the Aorthar Internship {cohort_name} cohort.

Your placement:
  Startup: {startup_name}
  Role: {role}
  Start Date: {start_date}
  Duration: 3 months

Next Steps:
  1. Confirm your acceptance by replying to this email
  2. Attend the onboarding session on {onboarding_date}
  3. Prepare your portfolio/CV for your startup

We're excited to have you on board!

The Aorthar Team
```

### Certificate

**Subject:** Your Aorthar Internship Certificate

```
Hi {name},

Congratulations on completing your Aorthar Internship!

Your certificate is attached. You can also download it at any time from: {certificate_url}

We're proud of what you've accomplished. Keep building!

The Aorthar Team
```

## Requirements

- Admin grades all essay questions before publishing results
- Top 10 are auto-selected by score (admin confirms)
- All applicants receive email notification
- Selected interns receive placement details
- Certificate auto-generated on placement completion
- Certificate downloadable as PDF

## Metrics

- Number of applications per cohort
- Number of exam submissions
- Average exam score
- Selection rate (selected / total applicants)
- Placement completion rate

## See Also

- [Internship Overview](../00-overview.md)
- [Shared Admin CMS](../../_shared/04-admin-cms.md)
