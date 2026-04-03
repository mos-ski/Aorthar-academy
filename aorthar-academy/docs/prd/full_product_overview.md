# Full Product Overview — Aorthar Academy

**Project:** Aorthar Academy  
**Repository:** github.com/mos-ski/Aorthar-academy  
**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase · Paystack · Gemini AI · Resend  
**Deployment:** Vercel (aorthar.com, courses.aorthar.com)  
**Last Updated:** 2026-04-03  

---

## What This Product Is

Aorthar Academy is a **three-subdomain education product**:

### Platform 1: Academy (aorthar.com)
The main platform — landing page, pricing, authentication, student dashboard, classroom, admin CMS, and the structured 4-year academic program. Students enroll in a department, progress through year/semester courses, take quizzes/exams, earn grades, track GPA, and submit a capstone project. Freemium model — Years 100–300 are free, Year 400 + capstone require a premium subscription.

### Platform 2: Standalone Courses (courses.aorthar.com)
A pay-per-course platform for self-paced learning. Individual courses with YouTube/Drive-powered lessons, lifetime access, one-time purchase via Paystack. Targets professionals who want specific skills without committing to the full university program.

### Platform 3: University (university.aorthar.com)
A separate product arm targeting students who want to learn from open-source university-like courses. Distinct from the standalone recorded courses — this is the university-branded experience with its own course catalog, student management, and transaction tracking.

---

## User Types

| Persona | Description |
|---------|-------------|
| **Student (University)** | Enrolled in a department, progressing through the 4-year curriculum. Free tier + optional premium upgrade. |
| **Student (Standalone)** | Purchased one or more individual courses on courses.aorthar.com. No department enrollment required. |
| **Contributor** | A student who has had 3+ suggestions approved. Auto-promoted. Can create curriculum proposals. |
| **Admin (Super)** | Full access to all admin features, user management, pricing, audit logs, ops hub. |
| **Admin (Content)** | Can manage courses, lessons, questions, curriculum, suggestions, capstone reviews. |
| **Admin (Finance)** | Can view payments, transactions, audit logs, pricing configuration. |
| **Visitor** | Unauthenticated user browsing landing pages, pricing, course catalogs. |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (CDN + SSR)                    │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  aorthar.com     │  │ courses.aorthar.com│                │
│  │  (Academy)       │  │ (Standalone)      │                 │
│  │  Next.js 16      │  │ Next.js 16        │                 │
│  └────────┬─────────┘  └────────┬──────────┘                 │
│           │                     │                             │
│           └──────────┬──────────┘                             │
│                      │                                        │
│              ┌───────▼────────┐                               │
│              │  Next.js App   │                               │
│              │  Router        │                               │
│              │  (shared code) │                               │
│              └───────┬────────┘                               │
└──────────────────────┼────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──────┐ ┌──▼───────┐ ┌──▼──────┐
   │  Supabase   │ │ Paystack │ │ Resend  │
   │  (Postgres) │ │ (Payments)│ │ (Email) │
   │  + Auth     │ │          │ │         │
   └──────┬──────┘ └──────────┘ └─────────┘
          │
   ┌──────▼──────┐
   │ Gemini AI   │
   │ (Lesson     │
   │  content)   │
   └─────────────┘
```

**Subdomains:**
- **aorthar.com** — Main academy (landing, auth, dashboard, classroom, admin)
- **courses.aorthar.com** — Standalone pay-per-course platform
- **university.aorthar.com** — University subdomain for open-source university-like courses

### Route Groups

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(auth)` | `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password` | Public | Authentication |
| `(dashboard)` | `/dashboard`, `/courses`, `/progress`, `/gpa`, `/capstone`, `/settings` | Required + onboarding gate | Student university app |
| `(classroom)` | `/classroom/[courseId]` | Required | Full-screen course viewer |
| `(admin)` | `/admin/**` | Required (admin guard, disabled in dev) | Admin CMS |
| `(courses-app)` | `/courses-app/**` | Optional (required for purchase) | Standalone courses platform |
| `university` | `university.aorthar.com` | Public/Required | University subdomain pages |
| root | `/`, `/pricing`, `/onboarding`, `/about`, `/contact` | Public | Landing, pricing, onboarding |

---

## Core Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (email/password + verification) | ✅ Complete | Supabase Auth with email redirect |
| Student onboarding (department selection) | ✅ Complete | 8 departments |
| 4-year curriculum with progression gates | ✅ Complete | Years 100→400, semester unlocks |
| Quiz/exam engine with grading | ✅ Complete | Edge Function for server-side grading |
| GPA calculation (5.0 scale) | ✅ Complete | Semester + cumulative GPA |
| Capstone submission + review | ✅ Complete | Premium + 400-level + GPA ≥ 3.5 |
| Community suggestions system | ✅ Complete | Vote, review, auto-promote contributors |
| Premium subscriptions (Paystack) | ✅ Complete | Semester/monthly/yearly/lifetime plans |
| Standalone courses (pay-per-course) | ✅ Complete | YouTube/Drive lessons, lifetime access |
| Admin CMS (courses, users, payments) | ✅ Complete | Multi-level admin permissions |
| Audit logging | ✅ Complete | Immutable audit trail |
| AI lesson content (Gemini) | ✅ Complete | Summaries, related content, deep-dives |
| Email (Resend) | ✅ Complete | Welcome, password reset, purchase confirmation |
| Demo mode | ✅ Complete | Cookie-based toggle, hidden in production |
| Account suspension | ✅ Complete | Admin can suspend/unsuspend |
| Transcript PDF generation | ✅ Complete | Server-side PDF streaming |
| Partnership inquiries | ✅ Complete | Form + database storage |

---

## Database Tables (25+)

**Core:** profiles, years, semesters, courses, lessons, resources, questions  
**Assessment:** quiz_attempts, course_grades, semester_gpas, cumulative_gpas  
**Progression:** enrollments, user_progress, semester_progress, course_prerequisites  
**Capstone:** capstone_submissions, specialization_tracks, course_tracks  
**Community:** suggestions, suggestion_votes, lesson_reactions, lesson_comments, lesson_comment_reactions  
**Monetization:** plans, subscriptions, transactions, standalone_courses, standalone_lessons, standalone_purchases, standalone_lesson_progress  
**Admin:** audit_log, notifications, webhook_events, partnership_inquiries  
**AI Content:** lesson_summaries, lesson_deep_dive_links  

---

## Key Metrics

- **8 departments** in the university program
- **31+ courses** seeded in the curriculum
- **4 academic years** (100–400 level)
- **2 semesters** per year
- **5.0 GPA scale** with 8 grade points (A+ through F)
- **4 admin levels** (super, content, finance + student role)
- **3 plan types** (semester, monthly, yearly + lifetime)
- **2 video sources** (YouTube, Google Drive)
