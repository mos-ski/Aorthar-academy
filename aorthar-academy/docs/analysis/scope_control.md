# Scope Control — Aorthar Academy

---

## In Scope (Current Product)

### Core Platform
- ✅ Email/password authentication with verification
- ✅ Password reset via email
- ✅ Student onboarding (department selection)
- ✅ 4-year university curriculum (100–400 level)
- ✅ 8 departments with semester-based progression
- ✅ Quiz/exam engine with server-side grading
- ✅ GPA calculation (5.0 scale)
- ✅ Capstone submission and review
- ✅ Community suggestions system
- ✅ Premium subscriptions (Paystack)
- ✅ Standalone courses (pay-per-course)
- ✅ YouTube and Google Drive video embedding
- ✅ Admin CMS (courses, users, payments, pricing)
- ✅ Multi-level admin permissions (super, content, finance)
- ✅ Audit logging
- ✅ Account suspension
- ✅ Email delivery (Resend)
- ✅ AI lesson content (Gemini)
- ✅ Demo mode
- ✅ Transcript PDF generation
- ✅ Partnership inquiries

### Admin Features
- ✅ Course CRUD (university + standalone)
- ✅ Lesson and resource management
- ✅ Question bank management
- ✅ User management (search, filter, suspend, grant premium)
- ✅ Transaction monitoring (subscriptions + standalone)
- ✅ Suggestion review
- ✅ Capstone review
- ✅ Pricing configuration
- ✅ Audit log viewer
- ✅ Student invite and bulk import
- ✅ Admin access management

---

## Out of Scope (Explicitly Not Building)

### Infrastructure
- ❌ Live video streaming infrastructure (using YouTube/Drive)
- ❌ Video hosting/encoding (using YouTube/Drive)
- ❌ CDN infrastructure (using Vercel)
- ❌ Database infrastructure (using Supabase)

### Product Features
- ❌ Real-time collaboration or live classes
- ❌ Blockchain-based certificates
- ❌ Multi-language support (English only)
- ❌ Native mobile apps (PWA considered in Q4)
- ❌ Corporate/B2B sales platform (Q3+ consideration)
- ❌ White-label platform (Q4 consideration)
- ❌ Discussion forums (Q2 consideration)
- ❌ Referral/affiliate system (Q3 consideration)
- ❌ Coupon/discount codes (Q2 consideration)
- ❌ Course reviews/ratings (Q2 consideration)
- ❌ Gamification (Q4 consideration)
- ❌ AI tutor (Q4 consideration)
- ❌ Instructor marketplace (Q3 consideration)

### Technical
- ❌ API versioning (Q2 consideration)
- ❌ Microservices architecture (Q4 consideration)
- ❌ Database sharding (Q4 consideration)
- ❌ Multi-region deployment (Q4 consideration)

---

## Grey Area (Needs Clarification)

| Item | Status | Notes |
|------|--------|-------|
| `/university/*` pages | ⚠️ Unclear | Separate product arm or legacy? Needs product decision |
| `?module=courses` query param | ⚠️ Unused | Present in URLs but not implemented. Implement or remove. |
| In-app notifications UI | ⚠️ Table exists, no UI | `notifications` table exists but no frontend. Build or remove? |
| External instructor accounts | ⚠️ Not yet designed | `instructor_name` is hardcoded. Should instructors have their own accounts? |
| Course sort order | ⚠️ Partial | `sort_order` column added but not fully utilized in UI |
