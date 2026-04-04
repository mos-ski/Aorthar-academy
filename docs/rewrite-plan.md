# University Backend Rewrite — Master Plan

**Project:** Aorthar Academy — University Backend Rewrite  
**Status:** 🚧 Critical Rewrite Needed  
**Agent:** Any capable Next.js/Supabase/TypeScript engineer or AI agent  
**Repository:** github.com/mos-ski/Aorthar-academy  
**Branch:** Create `rewrite/university-backend` from `main`

---

## 1. Problem Statement

The current university backend is "buggy af" because:
- **Mixed concerns:** University courses, bootcamps, and internship logic are tangled together
- **Inconsistent subdomain routing:** `university.aorthar.com` shares code with other products without clear boundaries
- **Assessment engine issues:** Quiz/exam grading, cooldowns, and attempt tracking have edge cases
- **GPA calculation bugs:** Semester and cumulative GPA don't always recalculate correctly
- **Admin CMS confusion:** Admin can't easily distinguish university vs bootcamp vs internship data
- **Proxy/middleware gaps:** Auth gates, onboarding, and premium checks have holes
- **API route naming:** `/api/standalone/` vs `/api/courses/` vs `/api/university/` is inconsistent

**Goal:** Rewrite the university backend to be clean, isolated, predictable, and bug-free.

---

## 2. Architecture Principles

### 2.1 Strict Product Isolation
Each product (University, Bootcamps, Internship) must have:
- Dedicated route group: `(university)`, `(bootcamps)`, `(internship)`
- Dedicated API prefix: `/api/university/*`, `/api/bootcamps/*`, `/api/internship/*`
- Dedicated database tables (or clearly namespaced shared tables)
- Dedicated admin sub-routes: `/admin/university/*`, `/admin/bootcamps/*`, `/admin/internship/*`

### 2.2 Subdomain-First Routing
- `university.aorthar.com` → Only serves `(university)` route group
- `bootcamp.aorthar.com` → Only serves `(bootcamps)` route group
- `internship.aorthar.com` → Only serves `(internship)` route group
- `admin.aorthar.com` → Serves all admin routes with product scoping
- `aorthar.com` → Marketing site only (no product logic)

### 2.3 Database Design
- Keep existing tables but add `product_type` discriminator where shared
- University tables: `university_courses`, `university_lessons`, `university_enrollments`, etc.
- OR keep current table names but enforce `WHERE product_type = 'university'` everywhere
- **Recommendation:** Keep current names, add strict RLS policies by product

### 2.4 API Contract
- All university APIs must be under `/api/university/*`
- Return consistent response shapes: `{ success, data, error, meta }`
- Use Zod for all input validation
- Return proper HTTP status codes (400, 401, 403, 404, 500)

---

## 3. Database Schema (Current + Recommended)

### 3.1 Current Tables (Keep, but namespace or filter)
```
years → filter by product_type = 'university'
semesters → filter by product_type = 'university'
courses → add product_type = 'university'
lessons → add product_type = 'university'
resources → add product_type = 'university'
questions → add product_type = 'university'
quiz_attempts → filter by product_type = 'university'
course_grades → filter by product_type = 'university'
semester_gpas → filter by product_type = 'university'
cumulative_gpas → filter by product_type = 'university'
enrollments → filter by product_type = 'university'
user_progress → filter by product_type = 'university'
semester_progress → filter by product_type = 'university'
capstone_submissions → filter by product_type = 'university'
```

### 3.2 Add `product_type` Column
```sql
ALTER TABLE courses ADD COLUMN product_type TEXT NOT NULL DEFAULT 'university';
ALTER TABLE lessons ADD COLUMN product_type TEXT NOT NULL DEFAULT 'university';
-- ... repeat for all university-specific tables
```

### 3.3 RLS Policies (Critical)
```sql
-- Example: Only university data visible to university users
CREATE POLICY "Users can view own university courses"
ON courses FOR SELECT
USING (product_type = 'university' AND user_has_access());
```

---

## 4. Route Structure (New)

```
src/app/
├── (marketing)/               ← aorthar.com
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   └── contact/
├── (university)/              ← university.aorthar.com
│   ├── layout.tsx
│   ├── dashboard/
│   ├── courses/
│   │   ├── [courseId]/
│   │   │   └── classroom/
│   ├── progress/
│   ├── gpa/
│   ├── capstone/
│   └── settings/
├── (bootcamps)/               ← bootcamp.aorthar.com
│   ├── layout.tsx
│   └── courses-app/
├── (internship)/              ← internship.aorthar.com
│   ├── layout.tsx
│   └── apply/
├── (admin)/                   ← admin.aorthar.com
│   ├── layout.tsx
│   ├── university/            ← University admin
│   ├── bootcamps/             ← Bootcamp admin
│   └── internship/            ← Internship admin
└── (auth)/                    ← Shared auth
    ├── login/
    ├── register/
    └── verify/
```

---

## 5. API Route Structure (New)

```
src/app/api/
├── university/
│   ├── courses/
│   │   ├── route.ts           ← GET list, POST create
│   │   └── [courseId]/
│   │       ├── route.ts       ← GET detail, PATCH update
│   │       ├── lessons/
│   │       │   └── route.ts
│   │       └── quiz/
│   │           ├── start/
│   │           └── submit/
│   ├── progress/
│   │   └── route.ts
│   ├── gpa/
│   │   └── route.ts
│   └── capstone/
│       └── route.ts
├── bootcamps/
│   └── ...
├── internship/
│   └── ...
└── admin/
    ├── university/
    │   ├── courses/
    │   ├── users/
    │   └── grades/
    └── bootcamps/
```

---

## 6. Proxy/Middleware Rewrite (Critical)

### 6.1 Current Issues
- `src/proxy.ts` handles all subdomains in one file — hard to maintain
- Auth checks are scattered and inconsistent
- Onboarding gate doesn't work correctly for all subdomains
- Premium route protection is fragile

### 6.2 New `src/proxy.ts` Structure
```typescript
// src/proxy.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 1. Subdomain detection
const PRODUCT_MAP = {
  'university.aorthar.com': 'university',
  'bootcamp.aorthar.com': 'bootcamps',
  'internship.aorthar.com': 'internship',
  'admin.aorthar.com': 'admin',
} as const;

function getProduct(host: string): keyof typeof PRODUCT_MAP | 'marketing' {
  return PRODUCT_MAP[host as keyof typeof PRODUCT_MAP] ?? 'marketing';
}

// 2. Route rewriting per product
function rewriteForProduct(request: NextRequest, product: string) {
  const url = request.nextUrl.clone();
  
  switch (product) {
    case 'university':
      // Pass through to (university) route group
      return null;
    case 'bootcamps':
      // Rewrite to /courses-app/*
      url.pathname = `/courses-app${url.pathname}`;
      return NextResponse.rewrite(url);
    case 'internship':
      // Rewrite to /internship/*
      url.pathname = `/internship${url.pathname}`;
      return NextResponse.rewrite(url);
    case 'admin':
      // Rewrite to /admin/*
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    default:
      return null;
  }
}

// 3. Auth gate (per product)
async function authGate(request: NextRequest, product: string, supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user && requiresAuth(product, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return user;
}

// 4. Product-specific gates
async function universityGate(request: NextRequest, user: any, supabase: any) {
  // Onboarding check
  const { data: profile } = await supabase
    .from('profiles')
    .select('department, onboarding_completed_at')
    .eq('user_id', user.id)
    .single();
    
  if (!profile?.onboarding_completed_at) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  // Premium check for Year 400
  if (request.nextUrl.pathname.includes('/400')) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    if (!sub) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
  }
  
  return null;
}

// 5. Main proxy function
export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const product = getProduct(host);
  
  // Step 1: Rewrite for subdomain
  const rewrite = rewriteForProduct(request, product);
  if (rewrite) return rewrite;
  
  // Step 2: Initialize Supabase
  const supabase = createServerClient(...);
  
  // Step 3: Auth gate
  const user = await authGate(request, product, supabase);
  
  // Step 4: Product-specific gates
  if (user && product === 'university') {
    const gate = await universityGate(request, user, supabase);
    if (gate) return gate;
  }
  
  return NextResponse.next();
}
```

---

## 7. Assessment Engine Rewrite

### 7.1 Current Issues
- Quiz attempts are not properly validated
- Cooldown logic is broken
- Server-side grading has edge cases
- Anti-cheat measures are weak

### 7.2 New Assessment Flow
```typescript
// src/app/api/university/courses/[courseId]/quiz/start/route.ts

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const { user } = await requireAuth();
  const courseId = params.courseId;
  
  // 1. Check enrollment
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, courseId)
    )
  });
  
  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
  }
  
  // 2. Check attempt limits
  const attempts = await db.query.quizAttempts.findMany({
    where: and(
      eq(quizAttempts.userId, user.id),
      eq(quizAttempts.courseId, courseId),
      eq(quizAttempts.assessmentType, 'quiz')
    )
  });
  
  const maxAttempts = await db.query.courses.findFirst({
    where: eq(courses.id, courseId)
  }).then(c => c?.quizAttemptLimit ?? 3);
  
  if (attempts.length >= maxAttempts) {
    return NextResponse.json({ error: 'Max attempts reached' }, { status: 403 });
  }
  
  // 3. Check cooldown
  const lastAttempt = attempts[attempts.length - 1];
  if (lastAttempt?.cooldownUntil && new Date(lastAttempt.cooldownUntil) > new Date()) {
    return NextResponse.json({ 
      error: 'Cooldown active',
      cooldownUntil: lastAttempt.cooldownUntil 
    }, { status: 429 });
  }
  
  // 4. Create attempt with randomized questions
  const questions = await db.query.questions.findMany({
    where: and(
      eq(questions.courseId, courseId),
      eq(questions.assessmentType, 'quiz')
    ),
    orderBy: random(), // Server-side shuffle
    limit: 20
  });
  
  const attempt = await db.insert(quizAttempts).values({
    userId: user.id,
    courseId,
    assessmentType: 'quiz',
    attemptNumber: attempts.length + 1,
    startedAt: new Date(),
    questions: questions.map(q => ({ id: q.id, text: q.questionText, options: shuffle(q.options) }))
  }).returning();
  
  return NextResponse.json({ attemptId: attempt[0].id, questions: attempt[0].questions });
}
```

### 7.3 Edge Function: `grade-quiz`
```typescript
// supabase/functions/grade-quiz/index.ts

serve(async (req) => {
  const { attemptId, answers } = await req.json();
  
  // 1. Fetch attempt
  const attempt = await supabase
    .from('quiz_attempts')
    .select('*, questions(*)')
    .eq('id', attemptId)
    .single();
    
  if (!attempt) {
    return new Response('Attempt not found', { status: 404 });
  }
  
  // 2. Check time limit
  const timeLimit = attempt.questions.length * 2 * 60 * 1000; // 2 min per question
  const elapsed = Date.now() - new Date(attempt.startedAt).getTime();
  
  if (elapsed > timeLimit) {
    return new Response('Time limit exceeded', { status: 400 });
  }
  
  // 3. Grade answers (server-side only)
  let score = 0;
  let totalPoints = 0;
  
  for (const answer of answers) {
    const question = attempt.questions.find(q => q.id === answer.questionId);
    if (!question) continue;
    
    totalPoints += question.points;
    
    if (question.type === 'multiple_choice') {
      if (answer.value === question.correctAnswer) {
        score += question.points;
      }
    }
    // ... handle other types
  }
  
  const percentage = (score / totalPoints) * 100;
  const passed = percentage >= attempt.course.passMark;
  
  // 4. Update attempt
  await supabase
    .from('quiz_attempts')
    .update({
      completedAt: new Date(),
      score: percentage,
      passed,
      answers: JSON.stringify(answers),
      cooldownUntil: passed ? null : addHours(new Date(), 24)
    })
    .eq('id', attemptId);
    
  // 5. Update course grade
  await updateCourseGrade(attempt.userId, attempt.courseId);
  
  return new Response(JSON.stringify({ score: percentage, passed, cooldownUntil: passed ? null : addHours(new Date(), 24) }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 8. GPA Engine Rewrite

### 8.1 Current Issues
- GPA doesn't recalculate on grade changes
- Cumulative GPA is sometimes incorrect
- Semester GPA calculation misses edge cases

### 8.2 New GPA Calculation
```typescript
// src/lib/gpa.ts

const GRADE_SCALE = {
  90: 5.0,  // A+
  85: 4.5,  // A
  80: 4.0,  // B+
  75: 3.5,  // B
  70: 3.0,  // C+
  65: 2.5,  // C
  60: 2.0,  // D
  0: 0.0    // F
} as const;

function getGradePoints(percentage: number): number {
  for (const [min, points] of Object.entries(GRADE_SCALE)) {
    if (percentage >= Number(min)) return points;
  }
  return 0;
}

export async function calculateSemesterGPA(userId: string, semesterId: string) {
  const grades = await db.query.courseGrades.findMany({
    where: and(
      eq(courseGrades.userId, userId),
      eq(courseGrades.semesterId, semesterId)
    ),
    with: { course: { columns: { creditUnits: true } } }
  });
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const grade of grades) {
    const points = getGradePoints(grade.finalGrade);
    totalPoints += points * grade.course.creditUnits;
    totalCredits += grade.course.creditUnits;
  }
  
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  await db.upsert('semesterGpas', {
    userId,
    semesterId,
    gpa,
    creditsEarned: totalCredits,
    updatedAt: new Date()
  });
  
  return { gpa, creditsEarned: totalCredits };
}

export async function calculateCumulativeGPA(userId: string) {
  const semesters = await db.query.semesterGpas.findMany({
    where: eq(semesterGpas.userId, userId),
    with: { semester: { with: { year: true } } }
  });
  
  // Group by year
  const yearGpas: Record<number, { gpa: number; credits: number }[]> = {};
  
  for (const sem of semesters) {
    const year = sem.semester.year.level;
    if (!yearGpas[year]) yearGpas[year] = [];
    yearGpas[year].push({ gpa: sem.gpa, credits: sem.creditsEarned });
  }
  
  // Calculate cumulative by year
  const cumulative = [];
  let runningPoints = 0;
  let runningCredits = 0;
  
  for (const year of [100, 200, 300, 400]) {
    const semesters = yearGpas[year] || [];
    
    for (const sem of semesters) {
      runningPoints += sem.gpa * sem.credits;
      runningCredits += sem.credits;
    }
    
    const cgpa = runningCredits > 0 ? runningPoints / runningCredits : 0;
    
    cumulative.push({
      year,
      cgpa,
      totalCredits: runningCredits
    });
  }
  
  // Update cumulative_gpas table
  for (const entry of cumulative) {
    await db.upsert('cumulativeGpas', {
      userId,
      yearId: await getYearId(entry.year),
      cgpa: entry.cgpa,
      totalCredits: entry.totalCredits,
      updatedAt: new Date()
    });
  }
  
  return cumulative;
}
```

---

## 9. Admin CMS Rewrite

### 9.1 Current Issues
- Admin can't easily switch between products
- Course creation is messy
- User management doesn't show product context

### 9.2 New Admin Structure
```
src/app/(admin)/admin/
├── page.tsx                    ← Dashboard with product stats
├── university/
│   ├── courses/
│   │   ├── page.tsx            ← List all university courses
│   │   ├── new/
│   │   └── [courseId]/
│   ├── curriculum/
│   │   └── page.tsx            ← Year/Semester structure
│   ├── users/
│   │   └── page.tsx            ← University students only
│   ├── grades/
│   │   └── page.tsx            ← Grade management
│   └── capstone/
│       └── page.tsx
├── bootcamps/
│   ├── courses/
│   ├── purchases/
│   └── users/
├── internship/
│   ├── cohorts/
│   ├── applications/
│   ├── results/
│   └── placements/
└── shared/
    ├── users/                  ← All users across products
    ├── payments/               ← All payments
    └── audit-logs/
```

---

## 10. Step-by-Step Implementation Plan

### Phase 1: Infrastructure (Week 1)
- [ ] Add `product_type` column to all university tables
- [ ] Update RLS policies to filter by `product_type`
- [ ] Create new route groups: `(university)`, `(bootcamps)`, `(internship)`
- [ ] Rewrite `src/proxy.ts` with product isolation
- [ ] Test subdomain routing end-to-end

### Phase 2: API Rewrite (Week 2)
- [ ] Move all university APIs to `/api/university/*`
- [ ] Add Zod validation to all routes
- [ ] Standardize response shapes
- [ ] Implement proper error handling
- [ ] Test all API routes

### Phase 3: Assessment Engine (Week 3)
- [ ] Rewrite quiz start endpoint with proper validation
- [ ] Rewrite quiz submit endpoint with server-side grading
- [ ] Implement cooldown logic correctly
- [ ] Add anti-cheat measures (time limits, session validation)
- [ ] Test assessment flow end-to-end

### Phase 4: GPA Engine (Week 4)
- [ ] Rewrite GPA calculation functions
- [ ] Add triggers for automatic GPA updates
- [ ] Test semester and cumulative GPA accuracy
- [ ] Add GPA recalculation endpoint for admin

### Phase 5: Admin CMS (Week 5)
- [ ] Create new admin route structure
- [ ] Build university-specific admin pages
- [ ] Add product switching in admin nav
- [ ] Test admin CRUD operations

### Phase 6: Testing & Polish (Week 6)
- [ ] End-to-end testing of all flows
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] Documentation updates

---

## 11. Key Files to Create/Modify

### New Files
```
src/app/(university)/layout.tsx
src/app/(university)/dashboard/page.tsx
src/app/api/university/courses/route.ts
src/app/api/university/courses/[courseId]/route.ts
src/app/api/university/courses/[courseId]/quiz/start/route.ts
src/app/api/university/courses/[courseId]/quiz/submit/route.ts
src/app/api/university/progress/route.ts
src/app/api/university/gpa/route.ts
src/lib/gpa.ts
src/lib/university/auth.ts
src/lib/university/validators.ts
```

### Modified Files
```
src/proxy.ts              ← Complete rewrite
src/middleware.ts         ← Remove or simplify
src/lib/supabase/server.ts ← Add product filtering
src/components/layout/Sidebar.tsx ← Add product switching
docs/platform/database-schema.md ← Update schema
```

---

## 12. Testing Checklist

- [ ] Subdomain routing works for all 5 subdomains
- [ ] Auth gate works correctly per product
- [ ] Onboarding gate only applies to university
- [ ] Premium gate only applies to Year 400
- [ ] Quiz start validates enrollment, attempts, cooldown
- [ ] Quiz submit grades correctly server-side
- [ ] GPA calculates correctly for all scenarios
- [ ] Admin can CRUD university courses
- [ ] Admin can view university students
- [ ] API routes return proper error codes
- [ ] RLS policies prevent cross-product data leakage

---

## 13. Rollback Plan

If something goes wrong:
1. Revert to `main` branch
2. Deploy previous working version from Vercel
3. Investigate issues in isolation
4. Fix and retry

---

## 14. Agent Instructions

When you receive this plan:
1. **Read the entire document** before starting
2. **Start with Phase 1** — do not skip ahead
3. **Test each phase** before moving to the next
4. **Commit frequently** with descriptive messages
5. **Ask for clarification** if anything is unclear
6. **Do not merge to main** until all phases are complete and tested
7. **Create a PR** for review before merging

**Good luck! This rewrite will fix the "buggy af" state and make the university backend clean, isolated, and reliable.**
