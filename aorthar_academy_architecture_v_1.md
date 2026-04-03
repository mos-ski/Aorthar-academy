# AORTHAR ACADEMY — SYSTEM ARCHITECTURE DOCUMENT

## 1. System Overview

Aorthar Academy is a modular, university-structured learning platform built on Next.js and Supabase. The system is designed using a layered architecture:

Presentation Layer (Frontend)
Application Layer (Business Logic)
Data Layer (Supabase Postgres + Storage)

The system must support:
- Academic hierarchy (Year → Semester → Course → Lesson)
- Assessment engine (Quiz + Exam)
- GPA computation engine
- Progression and unlock system
- Contribution and moderation workflow
- Capstone review system

The architecture must be scalable to 10,000+ concurrent users.

---

# 2. High-Level Architecture

## 2.1 Frontend (Client Layer)

Framework: Next.js (App Router)
Styling: TailwindCSS
State Management: Server Components + minimal client state
Auth: Supabase Auth (JWT session)
Hosting: Vercel

Frontend Responsibilities:
- Render academic structure
- Enforce UI-based locking
- Submit quiz attempts
- Display GPA + analytics
- Submit contributions
- Role-based UI rendering

Frontend must never calculate final grades permanently. All authoritative logic lives server-side.

---

# 3. Core Systems

## 3.1 Academic Structure System

Purpose:
Represent a 4-year university hierarchy.

Hierarchy:
Year (100, 200, 300, 400)
  → Semester (1, 2)
      → Course
          → Lesson
              → Resource

Rules:
- Courses belong to exactly one semester
- Lessons belong to exactly one course
- Resources belong to lessons
- Courses can optionally belong to a specialization track

Unlock Logic:
- Semester 2 locked until Semester 1 GPA >= 2.0
- Year 200 locked until Year 100 fully completed
- Course locked until prerequisites passed

---

## 3.2 Assessment Engine

This is a standalone logical system.

Components:
- Quiz Engine
- Exam Engine
- Attempt Tracking
- Grade Processor

Question Types (MVP):
- Multiple Choice (Single Correct)
- True/False

Assessment Flow:
1. Student starts quiz
2. Questions randomized
3. Timer begins
4. Submission stored
5. Score calculated server-side
6. Pass/fail computed
7. Progress updated

Retake Logic:
- Max 3 attempts
- 24-hour cooldown after failed attempt
- Highest score retained

Security:
- Questions fetched per attempt
- Answers not exposed in API response
- Grading handled via Supabase Edge Function

---

## 3.3 GPA Engine

Purpose:
Calculate semester and cumulative GPA.

Inputs:
- Course grade
- Credit unit

Formula:
Semester GPA = Σ(GradePoint × CreditUnit) / Σ(CreditUnit)

Triggered when:
- Course marked as Passed
- Exam submitted

Stored Fields:
- semester_gpa
- cumulative_gpa
- total_credits_earned

This must run server-side only.

---

## 3.4 Progression Engine

Purpose:
Control academic movement.

States per Course:
- Not Started
- In Progress
- Failed
- Passed

Level Unlock Rules:
- All courses in semester must be Passed
- GPA must meet threshold
- Capstone must be Approved (400 level)

Edge Case Handling:
- GPA below threshold → Repeat semester
- Failed 3 times → Course flagged for admin review

---

## 3.5 Contribution & Moderation System

Open-source layer.

Contribution Types:
- New Course
- New Lesson
- New Resource
- Resource Update

Workflow:
User submits contribution
Status = Pending
Admin reviews
If Approved → merged into production curriculum
If Rejected → reason stored

Audit Requirements:
- Immutable submission record
- Reviewer ID stored
- Timestamped decisions

---

## 3.6 Capstone System

Only available in 400 level.

Submission Requirements:
- GitHub repository
- Live URL
- Documentation
- Track selected

Review Workflow:
- Admin review
- Status: Approved / Revision Required / Rejected

Graduation Condition:
- All courses passed
- Capstone approved

---

# 4. Role-Based Access Control (RBAC)

Roles:

Student
- View curriculum
- Take quizzes
- Track GPA
- Submit capstone
- Suggest contributions

Contributor
- All student permissions
- Submit structured curriculum edits

Admin
- Full curriculum CRUD
- Approve/reject contributions
- Override grades
- Manage capstone decisions

Supabase RLS policies must enforce:
- Students cannot modify grades
- Only admin can publish curriculum changes

---

# 5. API & Business Logic Layer

All critical logic must be handled via:
- Next.js Route Handlers
OR
- Supabase Edge Functions

Protected Endpoints:
- /api/start-quiz
- /api/submit-quiz
- /api/calculate-gpa
- /api/unlock-next-level
- /api/review-contribution

No grade calculation should happen client-side.

---

# 6. Data Integrity & Security

- Row-Level Security enabled on all tables
- Immutable quiz_attempt records
- Cooldown enforced server-side
- Rate limiting per user
- Input validation using Zod
- Sanitization of external URLs

---

# 7. Performance & Scalability

- Indexed foreign keys
- Lazy load lessons
- Pagination on contribution lists
- Use server components for static curriculum
- CDN-cached public course pages

Target:
- 10k users
- 500 concurrent quiz sessions
- <2s page load

---

# 8. Deployment Architecture

Frontend: Vercel
Backend: Supabase
Database: Supabase Postgres
Edge Functions: Supabase Edge Runtime

Environment Separation:
- Development
- Staging
- Production

Migration Strategy:
- Use Supabase migrations
- Version curriculum schema

---

# 9. System Boundaries (MVP)

Not Included:
- AI tutor
- Certificate generation engine (automated issuance in MVP)
- Proctored exam monitoring
- Video hosting

---

# 10. System Definition of Complete

The architecture is considered complete when:

- Academic hierarchy fully implemented
- Assessment engine operational
- GPA engine auto-calculating
- Unlock logic enforced
- Contribution workflow functioning
- Capstone approval system live
- RLS policies validated
- 25+ courses populated
- 20 beta users tested end-to-end

---

This architecture positions Aorthar Academy as a structured academic system, not a content directory.

Next decision:
Do you want a detailed sequence diagram of quiz flow or the database ER diagram next?

---

# 11. Monetization & Payment Architecture (Paystack Integration)

Aorthar Academy operates in two access layers:

Layer A — Open Source University
- Free access to curriculum structure
- Free access to YouTube-based lessons
- Free quizzes (limited attempts per day for free users)

Layer B — Premium Access
- Unlimited quiz retakes
- GPA transcript export
- Certification eligibility
- 400-level specialization unlock
- Mentorship program eligibility

Payments are processed using Paystack.

---

## 11.1 Payment Models

Phase 1:
- One-time payment (Full Access Pass)
- Semester-based payment

Phase 2:
- Recurring subscription (monthly or yearly)
- Mentorship cohort payment

---

## 11.2 Payment Flow

1. User selects premium plan
2. Frontend calls /api/initiate-payment
3. Server creates Paystack transaction
4. Paystack returns authorization URL
5. User completes payment
6. Paystack sends webhook to /api/paystack-webhook
7. Server verifies signature
8. Transaction validated via Paystack API
9. User access level updated
10. Receipt stored

All access upgrades must happen ONLY after webhook verification.

---

## 11.3 Payment Security Requirements

- Verify Paystack webhook signature using secret key
- Validate transaction reference server-side
- Prevent duplicate transaction processing
- Idempotent webhook handler
- Store raw webhook payload for audit

---

## 11.4 Payment Database Tables

### plans
- id
- name
- price
- billing_type (one_time, subscription)
- access_scope
- created_at

### transactions
- id
- user_id
- paystack_reference
- amount
- currency
- status (pending, success, failed)
- raw_payload (jsonb)
- created_at

### subscriptions
- id
- user_id
- plan_id
- start_date
- end_date
- status (active, expired, cancelled)

---

## 11.5 Access Control Logic

User access level derived from:
- Active subscription OR
- Successful one-time purchase

Middleware must:
- Check subscription validity
- Check plan scope
- Restrict premium routes

Example Protected Routes:
- /400-level
- /transcript/export
- /mentorship/*

---

## 11.6 Revenue Logic

Free Users:
- Limited quiz attempts
- No GPA export
- No certification eligibility

Premium Users:
- Full progression
- Certification eligibility
- Advanced tracks unlocked

---

## 11.7 Failure & Edge Handling

- If webhook fails → retry logic
- If payment verified but DB update fails → retry transaction
- If duplicate webhook received → ignore
- If subscription expires → downgrade access automatically

---

## 11.8 Financial Reporting (Admin)

Admin dashboard must show:
- Total revenue
- Active subscriptions
- Payment history
- Failed transactions
- Conversion rate (free → paid)

---

This positions Aorthar Academy not only as an academic system but as a scalable revenue-backed education infrastructure.

