# Module PRDs — Aorthar Academy

---

## Module 1: Authentication & Onboarding

### 1. Overview
Email/password authentication with email verification, password reset, and department-based onboarding for university students. Standalone course users skip department selection.

### 2. Goals
- Frictionless signup with email verification
- Automatic profile creation via database trigger
- Department routing for university students
- Cross-subdomain session sharing (.aorthar.com cookie domain)

### 3. User Personas
- **University Student**: Needs department selection + onboarding
- **Standalone Student**: Needs minimal signup (name + email + password)
- **Admin**: Needs secure access with role-based routing

### 4. User Stories
AS-001 through AS-006 (see user_stories.md)

### 5. User Flows

**University Signup:**
```
Visit aorthar.com/register → Fill name, email, password, department → 
Verify email → Onboarding (department confirmation + semester setup) → Dashboard
```

**Standalone Signup:**
```
Visit courses.aorthar.com → Click "Sign up & enroll" → Fill name, email, password → 
Verify email → Redirect to checkout → Paystack → Course access
```

**Login:**
```
Visit /login → Enter email + password → Redirect to ?next or default dashboard
```

### 6. Functional Requirements
- FR-001: Sign up with email, password (8+ chars, uppercase, number), full name
- FR-002: Email verification required before access
- FR-003: Password reset via email link
- FR-004: Auto-create profile row via `handle_new_user()` trigger
- FR-005: Department selection on university domain (8 options)
- FR-006: Minimal signup on courses domain (no department)
- FR-007: Session persistence across subdomains via `.aorthar.com` cookie
- FR-008: Suspended users redirected to /suspended

### 7. Non-Functional Requirements
- NFR-001: Signup must complete in < 3 seconds
- NFR-002: Password reset email delivered within 30 seconds
- NFR-003: Session cookie secure, httpOnly, sameSite=lax

### 8. Edge Cases
- User tries to register with existing email → Supabase error shown
- User clicks expired verification link → Resend option shown
- User logs in from different device → Session created independently
- User is suspended → Redirected to /suspended with no bypass

### 9. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/auth/callback` | ✅ Real | Supabase email verification |
| `POST /api/auth/forgot-password` | ✅ Real | Send reset email via Resend |
| `POST /api/auth/send-welcome` | ✅ Real | Send welcome email via Resend |
| Supabase Auth | ✅ Real | signInWithPassword, signUp, updateUser |

### 10. UI/UX Notes
- Split-panel layout on desktop (brand left, form right)
- Mobile: single column form
- Domain detection (`courses.` vs `aorthar.com`) changes form fields
- Zod validation with inline error messages

### 11. Metrics
- Signup completion rate
- Email verification rate
- Time to first login
- Password reset request rate

---

## Module 2: University Student App

### 1. Overview
The core university experience: 4-year curriculum, quiz/exam engine, GPA tracking, progression gates, and capstone submission.

### 2. Goals
- Structured learning path through department-specific curriculum
- Fair assessment with server-side grading and cooldowns
- Accurate GPA tracking on 5.0 scale
- Clear progression gates (semester/year unlocks)

### 3. User Personas
- **Year 100–300 Student**: Free access, progressing through curriculum
- **Year 400 Student**: Requires premium subscription + GPA ≥ 3.5
- **Contributor**: Auto-promoted after 3 approved suggestions

### 4. User Stories
US-001 through US-010 (see user_stories.md)

### 5. User Flows

**Course Progression:**
```
Dashboard → Select course → Enter classroom → Study lessons → 
Start quiz → Answer questions → Submit → Get score → 
Complete quiz requirements → Take exam → Get final grade → 
Semester unlocks when all courses pass
```

**GPA Calculation:**
```
Complete courses → Grades computed (quiz 40% + exam 60%) → 
Semester GPA calculated → Cumulative GPA updated → 
Visible on /gpa page
```

### 6. Functional Requirements
- FR-001: Display courses by semester with status indicators
- FR-002: Classroom with lessons, materials, related content, quiz tabs
- FR-003: Timed quiz/exam with shuffled questions, no answer leakage
- FR-004: Server-side grading via Supabase Edge Function
- FR-005: Cooldown between attempts (default 24 hours)
- FR-006: Attempt limits (default 3 per quiz/exam)
- FR-007: Grade computation: quiz_weight × quiz_score + exam_weight × exam_score
- FR-008: GPA on 5.0 scale with 8 grade points
- FR-009: Semester unlock: all previous semester courses must pass
- FR-010: Year 400 requires premium subscription
- FR-011: Capstone requires 400-level + GPA ≥ 3.5 + premium

### 7. Non-Functional Requirements
- NFR-001: Quiz questions must never expose correct answers to client
- NFR-002: Grading must be server-side (Edge Function)
- NFR-003: Grade computation must be idempotent
- NFR-004: Classroom must load in < 2 seconds

### 8. Edge Cases
- Student tries to take quiz during cooldown → Blocked with timer
- Student exceeds attempt limit → Blocked permanently for that assessment
- Student upgrades to premium mid-semester → Immediate access to Year 400
- Student changes department → Progress recalculated for new curriculum

### 9. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/quiz/start` | ✅ Real | Create attempt, return shuffled questions |
| `POST /api/quiz/submit` | ✅ Real | Delegate to grade-quiz Edge Function |
| `GET /api/quiz/attempt/[id]` | ✅ Real | Fetch attempt state |
| `GET /api/quiz/attempt/[id]/solutions` | ✅ Real | Fetch graded solutions |
| `POST /api/quiz/generate` | ✅ Real | AI-generate questions (Gemini) |
| `GET /api/lessons/summary` | ✅ Real | AI lesson summary |
| `GET /api/lessons/related` | ✅ Real | AI related content |
| `GET /api/lessons/deep-dive` | ✅ Real | AI deep-dive links |
| `POST /api/lessons/reaction` | ✅ Real | Like/dislike lesson |
| `GET/POST /api/lessons/comments` | ✅ Real | Lesson comments |
| `POST /api/capstone/submit` | ✅ Real | Submit capstone |
| `POST /api/unlock-next-level` | ✅ Real | Trigger progression check |

### 10. UI/UX Notes
- Dashboard: `px-[15%]` horizontal padding from layout
- Classroom: full-screen dark theme, no sidebar
- QuizRunner: timer in header, question navigation, submit confirmation
- GPA page: semester breakdown + cumulative summary

### 11. Metrics
- Course completion rate
- Average quiz score
- Average exam score
- GPA distribution
- Capstone submission rate
- Premium conversion rate

---

## Module 3: Standalone Courses

### 1. Overview
Pay-per-course platform on courses.aorthar.com. One-time purchase via Paystack, lifetime access, YouTube/Drive-powered lessons.

### 2. Goals
- Simple purchase flow with minimal friction
- Free preview to drive conversions
- Reliable purchase recording (webhook + redirect fallback)
- Progress tracking across lessons

### 3. User Personas
- **Prospective Buyer**: Browsing, previewing, deciding to purchase
- **Course Owner**: Has purchased, watching lessons
- **Multi-course Learner**: Has purchased multiple courses

### 4. User Stories
SC-001 through SC-005 (see user_stories.md)

### 5. User Flows

**Purchase Flow:**
```
Browse courses → Select course → Watch 1-min preview → 
Click "Buy" → Paystack checkout → Payment success → 
Redirect to /courses-app/learn/[slug] → Record purchase → 
Access all lessons
```

**Learning Flow:**
```
Visit /courses-app/learn → See purchased courses → 
Select course → Watch lessons in order → Progress tracked
```

### 6. Functional Requirements
- FR-001: Display published standalone courses with pricing
- FR-002: Free 1-minute preview of first lesson
- FR-003: Paystack checkout with course metadata
- FR-004: Idempotent purchase recording (upsert on paystack_reference)
- FR-005: Purchase verification on redirect AND via webhook
- FR-006: YouTube and Google Drive video embedding
- FR-007: Lesson progress tracking
- FR-008: "My Courses" page showing all purchased courses

### 7. Non-Functional Requirements
- NFR-001: Purchase must be recorded even if user closes browser (webhook)
- NFR-002: Video player must handle YouTube and Drive sources
- NFR-003: Preview timer must be client-side enforced (server validates access)

### 8. Edge Cases
- User pays but doesn't return to site → Webhook records purchase
- User tries to access unpurchased lesson → Redirected to course page
- Duplicate payment (same reference) → Upsert prevents duplicate
- Course status changes to draft after purchase → Buyer retains access

### 9. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/standalone/checkout` | ✅ Real | Create Paystack session |
| `GET /api/standalone/verify-payment` | ✅ Real | Verify payment on redirect |
| `GET/POST /api/standalone/progress` | ✅ Real | Track lesson progress |
| `POST /api/standalone/logout` | ✅ Real | Logout from standalone |
| `POST /api/webhooks/paystack` | ✅ Real | Webhook handler (records purchases) |

### 10. UI/UX Notes
- Dark theme (#0f1011 background)
- Green accent (#a7d252)
- Sticky video player on desktop
- Mobile: stacked layout with video on top
- Auto-start checkout on first visit (sessionStorage flag)

### 11. Metrics
- Course page views → purchase conversion rate
- Average revenue per buyer
- Preview completion rate
- Lesson completion rate
- Refund/chargeback rate

---

## Module 4: Admin Dashboard

### 1. Overview
Multi-level admin CMS for managing courses, users, payments, pricing, curriculum, and platform operations.

### 2. Goals
- Complete content management for university and standalone courses
- User management with suspension and premium controls
- Financial visibility (transactions, revenue, conversion rates)
- Audit trail for all admin actions
- Role-based access control (super, content, finance)

### 3. User Personas
- **Super Admin**: Full access, user management, pricing, ops
- **Content Admin**: Course/lesson/question management, curriculum
- **Finance Admin**: Payment monitoring, audit logs, pricing view

### 4. User Stories
AD-001 through AD-014 (see user_stories.md)

### 5. User Flows

**Course Creation:**
```
Admin → /admin/courses → Create course → Set code, name, year, semester → 
Add lessons → Add resources (YouTube/link/document) → Add questions → 
Publish course
```

**User Management:**
```
Admin → /admin/users → Search/filter users → View user details → 
Suspend/unsuspend → Grant premium → Grant standalone access
```

**Payment Monitoring:**
```
Admin → /admin/payments → View unified transaction table → 
See subscriptions + standalone purchases → Filter by type → 
Monitor revenue and conversion rates
```

### 6. Functional Requirements
- FR-001: CRUD for courses, lessons, resources, questions
- FR-002: User listing with search, role filter, premium/purchase status
- FR-003: Transaction listing (subscriptions + standalone purchases)
- FR-004: Suggestion review with approve/reject
- FR-005: Capstone review with approve/reject/request revision
- FR-006: Standalone course management (create, edit, publish, add lessons)
- FR-007: Pricing plan configuration
- FR-008: Audit log viewer (immutable)
- FR-009: User suspension/unsuspension
- FR-010: Premium grant/revoke
- FR-011: Standalone course access grant
- FR-012: Student invite and bulk import
- FR-013: Admin access management (invite, grant, update level)

### 7. Non-Functional Requirements
- NFR-001: Admin routes protected by role check (disabled in dev)
- NFR-002: All admin actions logged to audit_log table
- NFR-003: Audit log is append-only (no deletes/updates)

### 8. Edge Cases
- Non-admin tries to access /admin → Redirected to /unauthorized
- Admin deletes a course with existing enrollments → RESTRICT or cascade
- Two admins edit same course simultaneously → Last write wins (no locking)
- Finance admin tries to edit courses → Blocked by permissions

### 9. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `GET/POST /api/admin/courses` | ✅ Real | List/create courses |
| `GET/PUT/DELETE /api/admin/courses/[id]` | ✅ Real | Manage course |
| `GET/POST /api/admin/courses/[id]/lessons` | ✅ Real | Manage lessons |
| `GET/POST /api/admin/courses/[id]/questions` | ✅ Real | Manage questions |
| `GET/PUT/DELETE /api/admin/lessons/[id]` | ✅ Real | Manage lesson |
| `GET/PUT/DELETE /api/admin/questions/[id]` | ✅ Real | Manage question |
| `GET/PUT /api/admin/suggestions/[id]` | ✅ Real | Review suggestion |
| `GET/PUT /api/admin/capstone/[id]` | ✅ Real | Review capstone |
| `GET/PUT/DELETE /api/admin/users/[id]` | ✅ Real | Manage user |
| `POST /api/admin/users/[id]/premium` | ✅ Real | Grant/revoke premium |
| `POST /api/admin/students/[id]/suspension` | ✅ Real | Suspend/unsuspend |
| `POST /api/admin/students/[id]/standalone-access` | ✅ Real | Grant course access |
| `GET/PUT /api/admin/pricing/[id]` | ✅ Real | Manage pricing |
| `GET/POST /api/admin/standalone-courses` | ✅ Real | Manage standalone courses |
| `GET /api/admin/transactions/unified` | ✅ Real | Unified transaction view |
| `POST /api/admin/students/invite` | ✅ Real | Invite student |
| `POST /api/admin/students/import` | ✅ Real | Bulk import |
| `POST /api/admin/admin-access/invite` | ✅ Real | Invite admin |
| `PUT /api/admin/admin-access/[id]/level` | ✅ Real | Update admin level |

### 10. UI/UX Notes
- Admin guard disabled in development (NEXT_PUBLIC_APP_ENV=development)
- Sidebar navigation with module grouping
- Badge indicators for counts (pending suggestions, etc.)
- Environment badge (DEV/STAGING/PROD) in navbar

### 11. Metrics
- Admin action frequency
- Time to review suggestions
- Time to review capstones
- User suspension rate

---

## Module 5: Payments & Monetization

### 1. Overview
Paystack-powered payment processing for university subscriptions and standalone course purchases. Webhook-based verification with idempotent recording.

### 2. Goals
- Reliable payment processing with webhook fallback
- Idempotent transaction recording
- Clear financial reporting for admins
- Multiple plan types (semester, monthly, yearly, lifetime)

### 3. User Personas
- **Student (University)**: Purchasing premium subscription
- **Student (Standalone)**: Purchasing individual courses
- **Finance Admin**: Monitoring revenue and transactions

### 4. User Stories
US-010, SC-003, AD-006 (see user_stories.md)

### 5. User Flows

**University Subscription:**
```
Student → /pricing → Select plan → /pricing/checkout/[planId] → 
Paystack checkout → Payment success → Webhook fires → 
Edge Function verifies → Subscription created → Access granted
```

**Standalone Course:**
```
Student → /courses-app/[slug] → Click "Buy" → 
/api/standalone/checkout → Paystack → Payment success → 
Redirect to /courses-app/learn/[slug] → Verify payment → 
Record purchase → Access all lessons
```

### 6. Functional Requirements
- FR-001: Paystack checkout session creation
- FR-002: Webhook signature verification (HMAC-SHA512)
- FR-003: Idempotent upsert on paystack_reference
- FR-004: Subscription status tracking (active/expired/cancelled)
- FR-005: Purchase confirmation emails
- FR-006: Revenue calculation and display
- FR-007: Conversion rate calculation

### 7. Non-Functional Requirements
- NFR-001: Webhook must handle duplicate events gracefully
- NFR-002: Payment verification must complete in < 5 seconds
- NFR-003: Transaction records are immutable

### 8. Edge Cases
- Webhook fires before redirect verification → Upsert handles duplicate
- User pays but webhook fails → Manual reconciliation via admin panel
- Paystack returns success but amount is wrong → Log and alert
- Subscription expires → User loses premium access immediately

### 9. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/payments/checkout` | ✅ Real | Create Paystack session |
| `POST /api/webhooks/paystack` | ✅ Real | Webhook handler |
| `POST /api/standalone/checkout` | ✅ Real | Standalone checkout |
| `GET /api/standalone/verify-payment` | ✅ Real | Redirect verification |
| `GET /api/admin/transactions/unified` | ✅ Real | Unified transactions |

### 10. UI/UX Notes
- Pricing cards with clear plan comparison
- Paystack hosted checkout (redirect)
- Success state with course access redirect
- Admin payments page with revenue cards and transaction table

### 11. Metrics
- Total revenue (NGN)
- Subscription MRR
- Course purchase revenue
- Conversion rate (free → paid)
- Failed transaction rate

---

## Module 6: Settings & Account

### 1. Overview
User profile management, department changes, account deletion, and transcript downloads.

### 2. Goals
- Self-service profile management
- Safe account deletion with data cleanup
- Professional transcript generation

### 3. User Stories
ST-001 through ST-004 (see user_stories.md)

### 4. Functional Requirements
- FR-001: Edit full name, bio, GitHub URL, LinkedIn URL
- FR-002: Change department (recalculates progress)
- FR-003: Delete account (cascading delete)
- FR-004: Download transcript PDF

### 5. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `GET/PUT /api/profile` | ✅ Real | Read/update profile |
| `GET/DELETE /api/account` | ✅ Real | Read profile, delete account |
| `POST /api/onboarding/change-department` | ✅ Real | Change department |
| `GET /api/transcript/download` | ✅ Real | Generate transcript PDF |

### 6. Edge Cases
- User deletes account with active subscription → Subscription cancelled
- User changes department mid-semester → Progress recalculated
- User tries to delete account with pending capstone → Allowed (capstone deleted too)

---

## Module 7: Notifications & Email

### 1. Overview
Email delivery via Resend for welcome, password reset, and purchase confirmation. In-app notifications table exists but is not yet surfaced in the UI.

### 2. Goals
- Reliable email delivery
- Branded email templates
- Future in-app notification feed

### 3. User Stories
NT-001 through NT-003 (see user_stories.md)

### 4. API / Data Requirements

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `POST /api/auth/send-welcome` | ✅ Real | Welcome email |
| `POST /api/auth/forgot-password` | ✅ Real | Password reset email |
| Purchase confirmation (inline) | ✅ Real | Purchase email |

### 5. Status: **Partial**
- Email templates exist and work
- `notifications` table exists in schema but has no UI
- No push notifications or SMS

---

## Module 8: University Subdomain

### 1. Overview
The university product is served from the `university.aorthar.com` subdomain, not `/university/*` paths. This subdomain provides the university-branded experience with its own course catalog, student management, and transaction tracking. Distinct from the standalone courses platform (`courses.aorthar.com`) and the main academy product (`aorthar.com`).

### 2. Goals
- University-branded course discovery via dedicated subdomain
- Student enrollment for university program
- Transaction history for university payments

### 3. Subdomain Routing
- `university.aorthar.com` root → redirects to `/dashboard` (or `/login` if not authenticated)
- All other paths pass through unchanged on the university subdomain
- Auth routes and API routes pass through as-is

### 4. Status: **Resolved**
- `/university/*` route stubs have been removed (2026-04-03)
- All university links in the codebase now point to `https://university.aorthar.com`
- Typo route `/univeristy/*` and proxy redirect also removed
- Subdomain routing handled in `src/proxy.ts`
