# Module 01: Internship Landing

## Overview

The main landing page for the Aorthar Internship at `internship.aorthar.com`. Drives applicants to the application flow.

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Internship landing page |

## Content Sections

1. **Hero** — "The #1 Product Internship Program in Africa"
2. **How It Works** — 3 steps: Buy Form → Take Exam → Get Placed
3. **Eligibility** — Who can apply (students, fresh grads, career changers)
4. **Next Cohort** — Registration status + expected dates
5. **Past Cohorts** — Stats and testimonials
6. **FAQ** — Common questions about the program
7. **CTA** — "Apply Now" (links to /apply)

## Requirements

- Show cohort status dynamically (open/closed/coming soon)
- If registration is open → "Apply Now" CTA is active
- If registration is closed → Show "Next Cohort: Q2 2026" message
- Mobile responsive
- Fast loading (< 3 seconds)

## Data Requirements

- Fetch current active cohort status from `internship_cohorts` table
- Display `application_open_at` and `application_close_at` dates

## See Also

- [Application Module](./module-02-application.md)
