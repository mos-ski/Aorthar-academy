# Full Product Overview — Aorthar Academy

**Project:** Aorthar Academy  
**Repository:** github.com/mos-ski/Aorthar-academy  
**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase · Paystack · Gemini AI · Resend  
**Deployment:** Vercel (aorthar.com, courses.aorthar.com, university.aorthar.com)  
**Last Updated:** 2026-04-03  
**Version:** 1.0.0  

---

## What This Product Is

Aorthar Academy is a **three-subdomain education product** built on a single Next.js codebase, sharing Supabase Auth via `.aorthar.com` cookies:

### Platform 1: Academy (aorthar.com)
The main platform — marketing landing page, pricing, authentication, student dashboard, classroom, admin CMS, and the structured 4-year academic program. Students enroll in a department, progress through year/semester courses, take quizzes/exams, earn grades, track GPA, and submit a capstone project. **Freemium model** — Years 100–300 are free, Year 400 + capstone require a premium subscription.

### Platform 2: Standalone Courses (courses.aorthar.com)
A pay-per-course platform for self-paced learning. Individual courses with YouTube/Google Drive-powered lessons, lifetime access, one-time purchase via Paystack. Targets professionals who want specific skills without committing to the full university program.

### Platform 3: University (university.aorthar.com)
The university-branded subdomain that serves the **same core dashboard/classroom experience** as aorthar.com, but with a distinct URL for branding purposes. It shares all routes, database tables, and authentication with the main academy — it is not a separate product but a branded entry point.

### Platform 4: Internship (internship.aorthar.com) — PLANNED
A quarterly cohort program. Applicants buy a form (₦10k), take an online exam, top 10 get placed at startups for 3 months. **Database schema exists, only landing page is implemented.** Full application, exam, results, and placement flows are documented but not yet built.

---

## User Types

| Persona | Description |
|---------|-------------|
| **Visitor** | Unauthenticated user browsing landing pages, pricing, course catalogs |
| **Student (University)** | Enrolled in a department, progressing through the 4-year curriculum. Free tier + optional premium upgrade |
| **Student (Standalone)** | Purchased one or more individual courses on courses.aorthar.com. No department enrollment required |
| **Contributor** | A student who has had 3+ suggestions approved. Auto-promoted. Can create curriculum proposals |
| **Admin (Super Admin)** | Full access to all admin features, user management, pricing, audit logs, ops hub |
| **Admin (Content Admin)** | Can manage courses, lessons, questions, curriculum, suggestions, capstone reviews |
| **Admin (Finance Admin)** | Can view payments, transactions, audit logs, pricing configuration |
| **Suspended User** | A user whose account has been suspended by an admin. Redirected to /suspended on login |

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Vercel (CDN + SSR)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  aorthar.com     │  │ courses.         │  │ university.      │ │
│  │  (Academy)       │  │ aorthar.com      │  │ aorthar.com      │ │
│  │  Next.js 16      │  │ (Standalone)     │  │ (University)     │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           └─────────────────────┼──────────────────────┘            │
│                          ┌──────▼────────┐                          │
│                          │  Next.js App  │                          │
│                          │  Router       │                          │
│                          │  (shared)     │                          │
│                          └──────┬────────┘                          │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
        ┌──────▼──────┐    ┌────▼─────┐      ┌─────▼──────┐
        │  Supabase   │    │ Paystack │      │  Resend    │
        │  (Postgres) │    │ (NGN)    │      │  (Email)   │
        │  + Auth     │    │          │      │            │
        │  + Edge Fn  │    └──────────┘      └────────────┘
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Gemini AI  │
        │  2.0 Flash  │
        └─────────────┘
```

### Subdomain Routing

| Subdomain | Purpose | Auth Required |
|-----------|---------|---------------|
| `aorthar.com` | Main academy — landing, pricing, auth, student dashboard, classroom, admin CMS | Public / Required |
| `courses.aorthar.com` | Standalone pay-per-course platform (YouTube/Drive lessons) | Optional |
| `university.aorthar.com` | University-branded entry point (same routes as aorthar.com) | Public / Required |
| `internship.aorthar.com` | **PLANNED** — Quarterly cohort program (landing page only) | Public |
| `admin.aorthar.com` | **PLANNED** — Dedicated admin subdomain (currently /admin on main domain) | Admin Required |

### Route Groups

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| `(auth)` | `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password` | Public | Authentication pages |
| `(dashboard)` | `/dashboard`, `/courses`, `/progress`, `/gpa`, `/capstone`, `/settings`, `/suggest` | Required + onboarding gate | Student university app |
| `(classroom)` | `/classroom/[courseId]` | Required | Full-screen course viewer |
| `(admin)` | `/admin/**` | Required (admin guard, disabled in dev) | Admin CMS |
| `(courses-app)` | `/courses-app/**` | Optional (required for purchase) | Standalone courses platform |
| `(internship)` | `/internship` | Public | Internship landing page |
| root | `/`, `/pricing`, `/about`, `/contact`, `/partnership`, `/terms`, `/privacy`, `/cookies` | Public | Marketing & legal pages |

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
| Transcript HTML download | ✅ Complete | Server-side HTML generation |
| Partnership inquiries | ✅ Complete | Form + database storage |
| Lesson interactions | ✅ Complete | Reactions, comments, comment reactions |
| Internship product | ⚠️ Planned | Database schema exists, landing page only |

---

## Database Tables (30+)

| Category | Tables |
|----------|--------|
| **Core** | `profiles`, `years`, `semesters`, `courses`, `lessons`, `resources`, `questions` |
| **Assessment** | `quiz_attempts`, `course_grades`, `semester_gpas`, `cumulative_gpas` |
| **Progression** | `enrollments`, `user_progress`, `semester_progress`, `course_prerequisites` |
| **Capstone** | `capstone_submissions`, `specialization_tracks`, `course_tracks` |
| **Community** | `suggestions`, `suggestion_votes`, `lesson_reactions`, `lesson_comments`, `lesson_comment_reactions` |
| **Monetization** | `plans`, `subscriptions`, `transactions`, `standalone_courses`, `standalone_lessons`, `standalone_purchases`, `standalone_lesson_progress` |
| **Admin** | `audit_log`, `notifications`, `webhook_events`, `partnership_inquiries` |
| **AI Content** | `lesson_summaries`, `lesson_deep_dive_links` |
| **Internship (Planned)** | `internship_cohorts`, `internship_applications`, `internship_exam_results`, `internship_placements` |

---

## Key Metrics

- **8 departments** in the university program
- **31+ courses** seeded in the curriculum
- **4 academic years** (100–400 level)
- **2 semesters** per year
- **5.0 GPA scale** with 8 grade points (A+ through F)
- **4 admin levels** (super_admin, content_admin, finance_admin + student role)
- **6 plan types** (free, semester, monthly, yearly, lifetime, standard, mentorship)
- **2 video sources** (YouTube, Google Drive)
- **3 live subdomains** (aorthar.com, courses.aorthar.com, university.aorthar.com)
- **2 planned subdomains** (internship.aorthar.com, admin.aorthar.com)

---

## Third-Party Services

| Service | Purpose | Integration Status |
|---------|---------|-------------------|
| **Supabase** | Auth, Database, RLS, Edge Functions | ✅ Full integration |
| **Paystack** | Payment processing (NGN) | ✅ Full integration |
| **Resend** | Transactional emails | ✅ Full integration (3 templates) |
| **Google Gemini 2.0 Flash** | AI lesson summaries, quiz generation | ✅ Full integration |
| **YouTube** | Video embedding, transcripts, link healing | ✅ Full integration |
| **Google Drive** | Video embedding for standalone courses | ✅ Full integration |

---

## Classification

**This is a full-stack production product** with:
- Real Supabase database with 30+ tables and RLS policies
- Real Paystack payment processing with webhook handling
- Real Supabase Edge Functions for quiz grading, payment verification, GPA calculation, and progression checking
- Real Resend email delivery
- Real Gemini AI integration
- Comprehensive admin CMS with role-based access
- Demo mode for development/testing with mock data snapshots

The only incomplete product is the **Internship** platform, which has database tables and documentation but only a landing page implemented.
