# Landing Pages — Shared Spec

**Last Updated:** 2026-04-03

---

## Overview

Each product has its own landing/entry experience. This document covers the public-facing pages that drive conversion for all products.

---

## Main Site Landing (aorthar.com)

### Purpose

Drive traffic to all three products from the main Aorthar brand.

### Sections

| Section | Content | CTA |
|---------|---------|-----|
| Hero | Brand value proposition | "Get Started" → /register |
| Products | Internship, University, Bootcamps overview | Links to product pages |
| Partners | Startup logos (DeeXoptions, Nazza, Syarpa, Celler, Digital Abundance) | Trust signal |
| Community | WhatsApp community link | "Join the Community" |
| Features | What you can learn | Browse products |
| Hire Talent | For employers | "Post a Role" → Motivv |
| Footer | Legal, social, product links | — |

### Routes

| Route | Description |
|-------|-------------|
| `/` | Main landing page |
| `/about` | About Aorthar |
| `/pricing` | University pricing plans |
| `/internship` | Internship application landing |
| `/partnership` | Partnership inquiries |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

---

## Internship Landing (internship.aorthar.com)

### Purpose

Convert visitors to internship applicants.

### Sections

| Section | Content | CTA |
|---------|---------|-----|
| Hero | Internship value proposition | "Apply Now" |
| How It Works | Steps: Buy form → Take exam → Get placed | — |
| Eligibility | Who can apply | — |
| Cohort Info | Next open date | — |
| Testimonials | Past intern stories | — |
| FAQ | Common questions | — |

### Routes

| Route | Description |
|-------|-------------|
| `/` | Internship landing |
| `/apply` | Application portal |
| `/quiz` | Exam portal (name + code → exam) |
| `/results` | Results page (for applicants) |

---

## Bootcamps Landing (courses.aorthar.com)

### Purpose

Drive bootcamp purchases.

### Sections

| Section | Content | CTA |
|---------|---------|-----|
| Hero | Bootcamp value proposition | "Browse Bootcamps" |
| Bootcamp Catalog | Available bootcamps with prices | "Buy Now" per bootcamp |
| How It Works | Buy → Learn at your pace → Certificate | — |
| Benefits | Permanent access, self-paced | — |

### Routes

| Route | Description |
|-------|-------------|
| `/` | Bootcamp catalog landing |
| `/courses-app/[courseId]` | Bootcamp detail page |
| `/courses-app/[courseId]/player` | Lesson player |

---

## University Landing (aorthar.com)

### Purpose

Convert visitors to university students.

### Sections

| Section | Content | CTA |
|---------|---------|-----|
| Hero | University value proposition | "Start Learning" |
| Departments | Available departments | "Choose Department" |
| Curriculum Preview | Sample courses by year | "View Full Curriculum" |
| Pricing | Subscription plans | "Subscribe Now" |
| Student Stories | Success stories | — |
| FAQ | Common questions | — |

### Routes

| Route | Description |
|-------|-------------|
| `/` (main) | Main landing (includes university) |
| `/register` | Registration |
| `/onboarding` | Department selection |
| `/dashboard` | Student dashboard |
| `/courses` | Course catalog |

---

## Shared Components

### Navigation

| Component | Location |
|-----------|----------|
| Navbar | All pages (brand logo + product links) |
| Footer | All pages (legal, social, product links) |

### Auth Pages

| Route | Description |
|-------|-------------|
| `/login` | Shared login for all products |
| `/register` | Shared registration |
| `/verify` | Email verification |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset confirmation |

---

## See Also

- [University Home Module](../university/modules/module-01-home-landing.md)
- [Internship Landing Module](../internship/modules/module-01-landing.md)
- [Bootcamps Catalog Module](../bootcamps/modules/module-01-catalog.md)
