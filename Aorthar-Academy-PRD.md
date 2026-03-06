# Aorthar Academy - Product Requirements Document

## 1. Project Overview

### 1.1 Vision
Aorthar Academy is a production-ready university-structured academic system that delivers a comprehensive, progression-based learning experience. Unlike typical LMS platforms, Aorthar Academy implements strict academic hierarchies, formal assessment engines with anti-cheat mechanisms, GPA calculation, and multi-tier monetization—all backed by enterprise-grade security and performance architecture.

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TailwindCSS |
| Backend | Supabase (PostgreSQL), Edge Functions |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Paystack |
| Security | RLS, RBAC, Server-side validation |

### 1.3 Target Audience

- Students seeking structured, accreditation-style learning
- Contributors proposing course content
- Administrators managing curriculum and assessments
- Mentors providing guidance to advanced students

---

## 2. Academic Hierarchy

### 2.1 Structure Model
The platform implements a four-year university structure with the following nesting:

```
Year (100, 200, 300, 400)
  └── Semester (1, 2)
        └── Course (e.g., DES101, DEV201)
              ├── Lessons
              │     └── Resources (YouTube embeds)
              ├── Quiz
              └── Final Exam
```

### 2.2 Entity Definitions

#### Year
- **Identifier**: Integer (100, 200, 300, 400)
- **Display Name**: "First Year", "Second Year", etc.
- **Prerequisites**: Year N+1 locked until Year N fully completed
- **400-Level Restriction**: Access requires all 300-level courses passed

#### Semester
- **Identifier**: Integer (1, 2)
- **Display Name**: "First Semester", "Second Semester"
- **Prerequisites**: Semester 2 locked until Semester 1 completed with passing grade

#### Course
- **Code**: String format [A-Z]{3}[1-3]{3} (e.g., DES101, DEV201)
- **Name**: Human-readable course title
- **Credit Units**: Integer (1-6)
- **Year Level**: Foreign key to Year
- **Semester**: Foreign key to Semester
- **Pass Mark**: Default 60%
- **Quiz Attempt Limit**: Default 3 attempts
- **Exam Attempt Limit**: Default 3 attempts
- **Cooldown Period**: 24 hours after failed attempt
- **Is Premium**: Boolean (requires premium subscription)

#### Lesson
- **Title**: Lesson name
- **Order**: Integer for sequencing
- **Course**: Foreign key to Course
- **Content**: Markdown or rich text

#### Resource
- **Type**: "youtube" | "link" | "document"
- **URL**: Resource location
- **Lesson**: Foreign key to Lesson
- **Order**: Integer for sequencing

### 2.3 Progression Rules

| Rule | Condition |
|------|-----------|
| Unlock Semester 2 | All courses in Semester 1 passed (≥60%) |
| Unlock Year 200 | All Year 100 courses passed |
| Unlock Year 300 | All Year 200 courses passed |
| Unlock Year 400 | All Year 300 courses passed |
| Access 400-Level | Premium subscription required |
| Graduation | All Year 400 courses passed + Capstone approved |

---

## 3. Assessment Engine

### 3.1 Quiz System

#### Question Types
- **Multiple Choice**: Single correct answer from 4 options
- **Ordering**: Arrange items in correct sequence
- **Matching**: Pair related items

#### Question Properties
```typescript
interface Question {
  id: UUID;
  course_id: UUID;
  type: 'multiple_choice' | 'ordering' | 'matching';
  question_text: string;
  options: JSONB; // Array of options with correct answer flag
  points: Integer;
  shuffle_options: Boolean;
}
```

#### Quiz Session Flow
1. Student initiates quiz attempt
2. System creates `quiz_attempts` record with:
   - Unique session ID
   - Start timestamp
   - Randomized question order (server-side)
   - Randomized option order (server-side)
3. Student completes quiz within time limit
4. Answers submitted to Edge Function for grading
5. Server validates answers and calculates score
6. Result stored server-side (immutable)
7. Cooldown timer activated if failed

### 3.2 Anti-Cheat Measures

| Measure | Implementation |
|---------|----------------|
| Question Randomization | Server shuffles question order per attempt |
| Option Randomization | Server shuffles answer options per attempt |
| Timer Enforcement | Server-side time tracking, not client |
| Grade Tamper Prevention | Grades computed server-side, stored encrypted |
| Attempt Validation | Verify session integrity via JWT |
| Rate Limiting | Max 1 attempt per 5 minutes per course |

### 3.3 Exam System

- **Final Exam**: Covers entire course content
- **Duration**: 90 minutes default (configurable per course)
- **Question Count**: 50 questions default
- **Pass Mark**: Course pass mark (default 60%)
- **Attempts**: Same limits as quiz

### 3.4 Attempt Management

```typescript
interface QuizAttempt {
  id: UUID;
  user_id: UUID;
  course_id: UUID;
  attempt_number: Integer;
  started_at: Timestamp;
  completed_at: Timestamp;
  score: Decimal; // Calculated server-side
  passed: Boolean;
  answers: JSONB; // Encrypted storage
  cooldown_until: Timestamp; // Null if passed or no cooldown
}
```

#### Cooldown Logic
```sql
-- After failed attempt, set cooldown
UPDATE quiz_attempts 
SET cooldown_until = NOW() + INTERVAL '24 hours'
WHERE passed = false 
  AND attempt_number < max_attempts;
```

---

## 4. GPA Engine

### 4.1 Scale Definition
Aorthar Academy uses a 5.0 grading scale:

| Grade | Points | Percentage Range |
|-------|--------|------------------|
| A+ | 5.0 | 90-100% |
| A | 4.5 | 85-89% |
| B+ | 4.0 | 80-84% |
| B | 3.5 | 75-79% |
| C+ | 3.0 | 70-74% |
| C | 2.5 | 65-69% |
| D | 2.0 | 60-64% |
| F | 0.0 | Below 60% |

### 4.2 GPA Calculations

#### Course Grade
```
course_grade = (quiz_weight * quiz_score) + (exam_weight * exam_score)
```

Default weights: Quiz 40%, Exam 60%

#### Semester GPA
```
semester_gpa = Σ(course_grade_points × credit_units) / Σ(credit_units)
```

#### Cumulative GPA
```
cumulative_gpa = Σ(all_course_grade_points × credit_units) / Σ(all_credit_units)
```

### 4.3 GPA Storage Rules

| Rule | Implementation |
|------|----------------|
| Storage | Server-side only via Edge Functions |
| Updates | Automatic on grade posting |
| Precision | 2 decimal places |
| History | Full audit trail maintained |

### 4.4 Premium GPA Features
- Export GPA transcript (PDF)
- View detailed grade breakdown
- Historical GPA tracking

---

## 5. Progression Engine

### 5.1 Lock State Management

```typescript
interface ProgressionState {
  user_id: UUID;
  current_year: Integer;
  current_semester: Integer;
  completed_courses: UUID[];
  locked_years: Integer[];
  locked_semesters: Integer[];
  capstone_status: 'locked' | 'available' | 'pending' | 'revision' | 'approved';
}
```

### 5.2 Progression Logic

#### Year Progression
```typescript
function checkYearUnlock(userId: UUID, targetYear: Integer): Boolean {
  const previousYear = targetYear - 100;
  const previousCourses = getCoursesByYear(previousYear);
  
  return previousCourses.every(course => 
    hasPassed(userId, course.id)
  );
}
```

#### Semester Progression
```typescript
function checkSemesterUnlock(userId: UUID, year: Integer, semester: Integer): Boolean {
  if (semester === 1) return true;
  
  const semester1Courses = getCoursesBySemester(year, 1);
  
  return semester1Courses.every(course => 
    hasPassed(userId, course.id)
  );
}
```

### 5.3 Capstone Requirements
- Must have completed all 400-level courses
- Must have minimum 3.5 cumulative GPA
- Must submit GitHub repository link
- Must submit live project URL
- Requires admin approval

---

## 6. Capstone System

### 6.1 Submission Requirements

```typescript
interface CapstoneSubmission {
  id: UUID;
  user_id: UUID;
  github_url: URL;
  live_url: URL;
  description: Text;
  tech_stack: String[];
  status: 'pending' | 'revision' | 'approved' | 'rejected';
  admin_notes: Text;
  submitted_at: Timestamp;
  reviewed_at: Timestamp;
  reviewed_by: UUID;
}
```

### 6.2 Workflow

```
Draft → Submit → Pending Review → [Revision | Approved | Rejected]
```

#### Status Transitions
| From | To | Trigger |
|------|-----|---------|
| Draft | Pending | User submits |
| Pending | Revision | Admin requests changes |
| Pending | Approved | Admin approves |
| Pending | Rejected | Admin rejects |
| Revision | Pending | User resubmits |

### 6.3 Graduation
- Capstone status must be "approved"
- All courses completed with passing grades
- Cumulative GPA ≥ 2.0
- Generates graduation certificate

---

## 7. Open-Source Contribution System

### 7.1 Suggestion Types

| Type | Description |
|------|-------------|
| Course Suggestion | Propose new course for curriculum |
| Lesson Suggestion | Add lesson to existing course |
| Resource Suggestion | Add resource to existing lesson |

### 7.2 Suggestion Schema

```typescript
interface CourseSuggestion {
  id: UUID;
  proposer_id: UUID;
  type: 'course' | 'lesson' | 'resource';
  status: 'pending' | 'approved' | 'rejected';
  
  // Course fields
  course_code?: String;
  course_name?: String;
  description?: Text;
  credit_units?: Integer;
  year_level?: Integer;
  semester?: Integer;
  
  // Lesson fields
  lesson_title?: String;
  course_id?: UUID;
  
  // Resource fields
  resource_type?: String;
  resource_url?: String;
  lesson_id?: UUID;
  
  admin_notes?: Text;
  created_at: Timestamp;
  reviewed_at: Timestamp;
  reviewed_by: UUID;
}
```

### 7.3 Audit Trail

All suggestion actions logged:
- Created by user
- Approved/rejected by admin
- Changes made
- Timestamps

### 7.4 Contributor Recognition
- Contributors with 3+ approved suggestions get "Contributor" role
- Contributors can suggest without approval for non-premium courses

---

## 8. Monetization (Paystack Integration)

### 8.1 Subscription Plans

| Feature | Free | Premium |
|---------|------|---------|
| Access 100-300 level | ✓ | ✓ |
| Access 400-level | ✗ | ✓ |
| Quiz attempts | 3 per course | Unlimited |
| GPA export | ✗ | ✓ |
| Capstone submission | ✗ | ✓ |
| Mentorship eligibility | ✗ | ✓ |
| Priority support | ✗ | ✓ |

### 8.2 Payment Types

#### One-Time Payment
- Purchase premium lifetime access
- Amount: Configurable (default $99)
- Creates permanent premium status

#### Subscription
- Monthly: $9.99/month
- Annual: $79.99/year
- Auto-renewal via Paystack

### 8.3 Payment Flow

```
User selects plan
  → Create Paystack checkout session
    → User completes payment
      → Paystack webhook received
        → Verify signature
          → Update user subscription status
            → Record transaction (idempotent)
```

### 8.4 Webhook Handling

```typescript
interface PaystackWebhookEvent {
  event: 'charge.success' | 'subscription.created' | 'subscription.disabled';
  data: {
    reference: string;
    amount: number;
    customer: { email: string };
    metadata: { user_id: string; plan_type: string };
  };
}
```

#### Webhook Verification
1. Verify Paystack signature header
2. Check transaction reference not previously processed
3. Update user status
4. Record transaction with idempotency key

### 8.5 Idempotency

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reject duplicate references
```

### 8.6 Access Control Middleware

```typescript
// middleware.ts
function checkPremiumAccess(user: User, resource: Resource): Boolean {
  if (!resource.is_premium) return true;
  if (user.subscription_status === 'active') return true;
  return false;
}
```

---

## 9. Security

### 9.1 Authentication

- Supabase Auth with email/password
- Magic link option
- JWT tokens with 1-hour expiry
- Refresh tokens for session persistence

### 9.2 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Student | Access courses, take quizzes, view grades |
| Contributor | Submit suggestions, create draft content |
| Admin | Full system access, content moderation, user management |

### 9.3 Supabase RLS Policies

#### Users Table
```sql
-- Users can read own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

#### Courses Table
```sql
-- All authenticated users can read published courses
CREATE POLICY "Published courses are viewable"
ON courses FOR SELECT
USING (status = 'published' AND is_premium = false);

-- Premium courses need subscription check
CREATE POLICY "Premium courses for subscribers"
ON courses FOR SELECT
USING (
  status = 'published' 
  AND (
    NOT is_premium 
    OR auth.uid() IN (SELECT user_id FROM subscriptions WHERE status = 'active')
  )
);
```

#### Quiz Attempts
```sql
-- Users can read own attempts
CREATE POLICY "Own quiz attempts"
ON quiz_attempts FOR ALL
USING (auth.uid() = user_id);

-- Grade updates only via Edge Functions
-- No direct table updates allowed
```

### 9.4 Server-Side Validation

| Validation | Location |
|------------|----------|
| Quiz answers | Edge Function |
| GPA calculations | Edge Function |
| Payment verification | Edge Function |
| Progression checks | Edge Function + RLS |

### 9.5 Webhook Security

```typescript
// Verify Paystack signature
function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string
): Boolean {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
```

---

## 10. Performance

### 10.1 Database Indexing

```sql
-- Course lookups
CREATE INDEX idx_courses_year_semester ON courses(year, semester);
CREATE INDEX idx_courses_code ON courses(code);

-- User progress
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_quiz_attempts_user_course ON quiz_attempts(user_id, course_id);

-- Progression queries
CREATE INDEX idx_progression_user_year ON user_progress(user_id, year);
CREATE INDEX idx_progression_user_semester ON user_progress(user_id, year, semester);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
```

### 10.2 Caching Strategy

| Data | Cache Strategy |
|------|----------------|
| Course curriculum | Static generation (SSG) |
| User progress | Client-side SWR/React Query |
| Grades | Server-side only, no cache |
| Payment status | Short cache (5 min) |

### 10.3 Query Optimization

- Use Supabase RPC for complex queries
- Batch load related data with join hints
- Paginate large result sets (20 items default)
- Debounce search queries

### 10.4 Scalability Targets

- Support 10,000 concurrent users
- Quiz submission < 2 second response
- Page load < 1.5 seconds
- Database connections pooled

---

## 11. Technical Architecture

### 11.1 Folder Structure

```
aorthar-academy/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── lessons/
│   │   │   │       │   └── [lessonId]/page.tsx
│   │   │   │       └── quiz/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   ├── gpa/page.tsx
│   │   │   ├── capstone/page.tsx
│   │   │   ├── suggest/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [type]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/layout.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── courses/new/page.tsx
│   │   │   ├── courses/[courseId]/edit/page.tsx
│   │   │   ├── questions/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── suggestions/page.tsx
│   │   │   ├── capstone/page.tsx
│   │   │   └── payments/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── courses/route.ts
│   │   │   ├── grades/route.ts
│   │   │   ├── gpa/route.ts
│   │   │   └── webhooks/
│   │   │       └── paystack/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseList.tsx
│   │   │   ├── LessonViewer.tsx
│   │   │   └── ResourceEmbed.tsx
│   │   ├── quiz/
│   │   │   ├── QuizTimer.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── QuizForm.tsx
│   │   │   └── ResultsDisplay.tsx
│   │   ├── gpa/
│   │   │   ├── GPACard.tsx
│   │   │   ├── GradeTable.tsx
│   │   │   └── TranscriptExport.tsx
│   │   ├── capstone/
│   │   │   ├── CapstoneForm.tsx
│   │   │   ├── CapstoneStatus.tsx
│   │   │   └── CapstoneReview.tsx
│   │   └── admin/
│   │       ├── CourseEditor.tsx
│   │       ├── QuestionEditor.tsx
│   │       ├── SuggestionReview.tsx
│   │       └── UserManagement.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── paystack.ts
│   │   ├── gpa.ts
│   │   ├── progression.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCourse.ts
│   │   ├── useQuiz.ts
│   │   ├── useGPA.ts
│   │   └── useProgression.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── cn.ts
│       ├── formatters.ts
│       └── validators.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── functions/
│       ├── grade-quiz/
│       │   └── index.ts
│       ├── calculate-gpa/
│       │   └── index.ts
│       ├── check-progression/
│       │   └── index.ts
│       ├── verify-payment/
│       │   └── index.ts
│       └── send-notification/
│           └── index.ts
├── public/
│   └── images/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 11.2 Database Schema Overview

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    profiles     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │────→│ user_id (FK)    │
│ email           │     │ full_name       │
│ created_at      │     │ avatar_url      │
│                 │     │ role            │
└─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐
│     years       │     │   semesters     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ level (100-400) │────→│ year_id (FK)    │
│ name            │     │ number (1-2)    │
└─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐
│     courses     │     │    lessons      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ code            │────→│ course_id (FK)  │
│ name            │     │ title           │
│ description     │     │ content         │
│ credit_units   │     │ order           │
│ year_id (FK)   │     └─────────────────┘
│ semester_id(FK)│            │
│ pass_mark      │            ▼
│ quiz_attempts  │     ┌─────────────────┐
│ exam_attempts  │     │   resources     │
│ is_premium     │     ├─────────────────┤
└─────────────────┘     │ id (PK)         │
        │              │ lesson_id (FK)  │
        ▼              │ type            │
┌─────────────────┐     │ url             │
│   questions     │     │ order           │
├─────────────────┤     └─────────────────┘
│ id (PK)         │
│ course_id (FK)  │
│ type            │
│ question_text  │
│ options (JSON)  │
│ correct_answer  │
│ points          │
└─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  quiz_attempts  │     │  user_progress  │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │────→│ user_id (FK)    │
│ course_id (FK)  │     │ year_id (FK)    │
│ attempt_number  │     │ semester_id(FK) │
│ started_at      │     │ status          │
│ completed_at    │     │ is_unlocked     │
│ score           │     └─────────────────┘
│ passed          │
│ answers (JSON)  │
│ cooldown_until  │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ subscriptions   │     │ transactions    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │────→│ user_id (FK)    │
│ plan_type       │     │ reference       │
│ status          │     │ amount          │
│ started_at      │     │ plan_type       │
│ expires_at      │     │ status          │
│ auto_renew      │     │ created_at      │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ capstone_sub    │     │ suggestions     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │────→│ proposer_id(FK) │
│ github_url      │     │ type            │
│ live_url        │     │ status          │
│ description     │     │ content (JSON)  │
│ status          │     │ admin_notes     │
│ admin_notes     │     │ created_at      │
│ submitted_at    │     │ reviewed_at     │
│ reviewed_by     │     │ reviewed_by     │
└─────────────────┘     └─────────────────┘
```

---

## 12. API Routes

### 12.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### 12.2 Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List available courses |
| GET | `/api/courses/[id]` | Get course details |
| POST | `/api/courses` | Create course (admin) |
| PUT | `/api/courses/[id]` | Update course (admin) |
| DELETE | `/api/courses/[id]` | Delete course (admin) |

### 12.3 Quiz

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/start` | Start quiz attempt |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/quiz/history/[courseId]` | Get attempt history |

### 12.4 GPA

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gpa/semester/[semesterId]` | Get semester GPA |
| GET | `/api/gpa/cumulative` | Get cumulative GPA |
| GET | `/api/gpa/transcript` | Export transcript (premium) |

### 12.5 Progression

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progression/status` | Get current status |
| GET | `/api/progression/can-unlock/[year]/[semester]` | Check unlock status |

### 12.6 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Create checkout session |
| POST | `/api/webhooks/paystack` | Handle Paystack webhooks |
| GET | `/api/payments/status` | Get subscription status |

### 12.7 Capstone

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/capstone/submit` | Submit capstone |
| GET | `/api/capstone/status` | Get submission status |
| PUT | `/api/capstone/[id]` | Update submission |
| GET | `/api/admin/capstone` | List all (admin) |
| PUT | `/api/admin/capstone/[id]/review` | Review submission (admin) |

### 12.8 Suggestions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/suggestions` | Submit suggestion |
| GET | `/api/suggestions` | List own suggestions |
| GET | `/api/admin/suggestions` | List all (admin) |
| PUT | `/api/admin/suggestions/[id]` | Review suggestion (admin) |

---

## 13. Edge Functions

### 13.1 Grade Quiz (`grade-quiz`)

**Purpose**: Server-side quiz grading with anti-cheat

**Flow**:
1. Receive answers + attempt ID
2. Verify attempt belongs to user
3. Verify no cooldown active
4. Fetch questions from database
5. Calculate score server-side
6. Store encrypted results
7. Update user progress if passed
8. Return grade to client

### 13.2 Calculate GPA (`calculate-gpa`)

**Purpose**: Server-side GPA computation

**Flow**:
1. Receive user ID + (optional) semester
2. Fetch all grades for user
3. Apply grade point values
4. Calculate weighted average
5. Store result (immutable)
6. Return GPA data

### 13.3 Check Progression (`check-progression`)

**Purpose**: Validate progression unlock conditions

**Flow**:
1. Receive user ID + target year/semester
2. Check prerequisites met
3. Return unlock status + reason if locked

### 13.4 Verify Payment (`verify-payment`)

**Purpose**: Process Paystack webhooks

**Flow**:
1. Receive webhook payload
2. Verify Paystack signature
3. Check idempotency (reference not used)
4. Update subscription status
5. Record transaction
6. Send confirmation email

---

## 14. Middleware

### 14.1 Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (session && isAuthRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### 14.2 Role-Based Middleware

```typescript
// For admin routes
export function adminMiddleware(request: NextRequest) {
  // Check user role from database
  // Redirect if not admin
}
```

---

## 15. User Flows

### 15.1 Student Enrollment Flow

```
1. Register account
   ↓
2. Complete profile
   ↓
3. View available courses (Year 100, Semester 1)
   ↓
4. Enroll in course
   ↓
5. Complete lessons
   ↓
6. Take quiz (max 3 attempts)
   ↓
7. Take final exam
   ↓
8. Pass (≥60%) → Unlock next semester/year
   ↓
9. Repeat until Year 400 complete
   ↓
10. Submit capstone → Graduation
```

### 15.2 Payment Flow

```
1. User attempts premium feature
   ↓
2. Redirect to pricing page
   ↓
3. Select plan (one-time/subscription)
   ↓
4. Redirect to Paystack checkout
   ↓
5. Complete payment
   ↓
6. Webhook updates subscription
   ↓
7. User redirected to premium content
```

---

## 16. Success Metrics

### 16.1 Key Metrics

| Metric | Target |
|--------|--------|
| Total Users | 10,000+ |
| Monthly Active Users | 5,000+ |
| Course Completion Rate | 60%+ |
| Quiz Pass Rate | 75%+ |
| Average GPA | 3.0+ |
| Payment Conversion | 5%+ |
| System Uptime | 99.9% |

### 16.2 User Engagement

- Average lessons completed per week
- Quiz attempts per course
- Time spent per lesson
- Return rate (weekly)

---

## 17. Future Considerations

### 17.2 Phase 2 Features

- Live virtual classes
- Peer review system for assignments
- Instructor chat support
- Mobile app (React Native)
- Certificate verification API
- Multi-language support
- API for institutional integrations

---

## 18. Appendix

### A. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### B. RLS Policy Summary

All RLS policies enforce:
- Users can only access own data
- Grades computed server-side only
- Premium content behind subscription check
- Admin-only routes protected
- Audit trail for all modifications

### C. Testing Requirements

- Unit tests for GPA calculations
- Integration tests for quiz flow
- E2E tests for payment processing
- Security tests for RLS policies
- Load testing for 10k users

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Ready for Development
