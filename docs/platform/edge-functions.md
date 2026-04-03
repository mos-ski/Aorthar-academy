# Edge Functions Reference

**Last Updated:** 2026-04-03

---

## Overview

Supabase Edge Functions (Deno) handle server-side logic that cannot be done in Next.js API routes, primarily quiz grading and payment verification.

---

## grade-quiz

**Location:** `supabase/functions/grade-quiz/index.ts`

**Purpose:** Server-side quiz/exam grading with anti-cheat measures.

**Input:**
```typescript
{
  attempt_id: string;
  answers: { question_id: string; answer: string | string[] }[];
}
```

**Process:**
1. Fetch attempt record and validate session
2. Fetch questions with correct answers (admin-only access)
3. Compare submitted answers against correct answers
4. Calculate score (MCQ auto-graded, essays stored for review)
5. Update `quiz_attempts` with score and pass/fail
6. Update `course_grades` with new weighted grade
7. Trigger progression check (semester/year unlock)
8. Return score and cooldown info

**Output:**
```typescript
{
  score: number;
  passed: boolean;
  cooldown_until: string | null;
  attempts_remaining: number;
}
```

**Security:**
- Questions and correct answers never leave the Edge Function
- Grading is fully server-side
- Attempt validation via JWT

---

## verify-payment

**Location:** `supabase/functions/verify-payment/index.ts`

**Purpose:** Verify Paystack payments and create subscription/purchase records.

**Input:**
```typescript
{
  reference: string;
  product: 'university' | 'bootcamp' | 'internship';
}
```

**Process:**
1. Call Paystack API to verify transaction
2. Check transaction status (`success`)
3. Verify amount matches expected
4. Create appropriate record:
   - University: `subscriptions` + `transactions`
   - Bootcamp: `standalone_purchases` + `transactions`
   - Internship: `internship_applications` + `transactions`
5. Generate access code (internship only)
6. Send confirmation email via Resend

**Output:**
```typescript
{
  success: boolean;
  record_id: string;
  access_code?: string;
}
```

**Security:**
- Amount verification against expected price
- Idempotent via `paystack_reference` uniqueness
- Paystack secret key used for verification

---

## send-email

**Location:** `supabase/functions/send-email/index.ts`

**Purpose:** Send transactional emails via Resend.

**Input:**
```typescript
{
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}
```

**Templates:**
- `welcome` — New account welcome
- `password-reset` — Password reset link
- `purchase-confirmation` — Payment success
- `internship-access-code` — Exam access code
- `internship-results` — Exam results notification
- `capstone-review` — Capstone status update

**Output:**
```typescript
{
  success: boolean;
  email_id?: string;
}
```

---

## generate-quiz-questions

**Location:** `supabase/functions/generate-quiz-questions/index.ts`

**Purpose:** Generate fallback question sets when admin hasn't created enough questions.

**Input:**
```typescript
{
  course_id: string;
  assessment_type: 'quiz' | 'exam';
  count: number;
}
```

**Process:**
1. Fetch course content (lessons, resources)
2. Use Gemini AI to generate relevant questions
3. Store generated questions in `questions` table
4. Return question set for the attempt

**Output:**
```typescript
{
  questions: Question[];
  generated: boolean;
}
```

---

## Function Deployment

All Edge Functions are deployed via Supabase CLI:

```bash
supabase functions deploy grade-quiz
supabase functions deploy verify-payment
supabase functions deploy send-email
supabase functions deploy generate-quiz-questions
```

---

## Environment Variables

| Variable | Function | Description |
|----------|----------|-------------|
| `PAYSTACK_SECRET_KEY` | verify-payment | Paystack API key |
| `RESEND_API_KEY` | send-email | Resend API key |
| `GEMINI_API_KEY` | generate-quiz-questions | Gemini AI key |
