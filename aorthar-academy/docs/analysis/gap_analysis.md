# Gap Analysis — Aorthar Academy

---

## Critical Gaps

| ID | Gap | Impact | Module | Recommendation |
|----|-----|--------|--------|----------------|
| G-01 | `notifications` table exists but has no UI | Medium | Notifications | Build notification bell in Navbar + notification list page |
| G-02 | No email notification when suggestion is approved/rejected | Medium | Suggestions | Send email to proposer on status change |
| G-03 | No email notification when capstone is reviewed | Medium | Capstone | Send email to student on review |
| G-04 | `?module=courses` query param on admin pages has no effect | Low | Admin | Either implement filtering or remove the param from URLs |
| G-05 | No pagination on admin users/transactions tables (limit 100) | Medium | Admin | Add pagination or infinite scroll for large datasets |
| G-06 | No export functionality for transactions/users | Medium | Admin | Add CSV export for financial reporting |
| G-07 | `univeristy/transaction` typo route exists | Low | Routing | Redirect to correct `/university/transactions` path |
| G-08 | No real-time quiz submission confirmation | Low | University | Add loading state and explicit success/error feedback |

## Important Gaps

| ID | Gap | Impact | Module | Recommendation |
|----|-----|--------|--------|----------------|
| G-09 | No bulk email capability for admins | Medium | Admin | Add ability to send announcements to all students |
| G-10 | No analytics dashboard (page views, engagement, drop-off) | Medium | Admin | Add basic analytics or integrate with PostHog/Plausible |
| G-11 | No referral/affiliate system for standalone courses | Low | Standalone | Add referral codes for organic growth |
| G-12 | No certificate of completion for standalone courses | Medium | Standalone | Generate PDF certificate when all lessons completed |
| G-13 | No search functionality for courses (university or standalone) | Medium | Both | Add course search with filters |
| G-14 | No mobile app or PWA support | Low | Platform | Consider PWA for offline lesson viewing |
| G-15 | No discussion forum or community feature | Medium | University | Add course-level discussion threads |
| G-16 | No progress email reminders for inactive students | Low | Engagement | Weekly email nudges for students who haven't studied |
| G-17 | No A/B testing framework for pricing page | Low | Monetization | Test pricing card layouts and copy |
| G-18 | Standalone course purchase recording has 3 code paths (redirect, webhook, learn page) | Medium | Standalone | Consolidate to single source of truth |

## Nice-to-Have Gaps

| ID | Gap | Impact | Module | Recommendation |
|----|-----|--------|--------|----------------|
| G-19 | No dark/light theme toggle on standalone courses platform | Low | Standalone | Add theme toggle matching university |
| G-20 | No course reviews/ratings from students | Low | Standalone | Add star ratings and written reviews |
| G-21 | No wishlist or save-for-later for courses | Low | Standalone | Allow users to bookmark courses |
| G-22 | No social sharing for course completion | Low | Engagement | Share certificate on LinkedIn/Twitter |
| G-23 | No instructor dashboard for standalone courses | Low | Admin | Allow instructors to manage their own courses |
| G-24 | No coupon/discount code system | Medium | Payments | Add promo codes for marketing campaigns |
| G-25 | No multi-currency support | Low | Payments | Currently NGN only |
| G-26 | No student leaderboard or gamification | Low | Engagement | Add streaks, badges, leaderboards |

---

## Broken / Incomplete Flows

| ID | Flow | Issue | Severity |
|----|------|-------|----------|
| B-01 | Admin users page → standalone buyers | Was not joining standalone_purchases table | **Fixed** (2026-04-03) |
| B-02 | Admin payments page → standalone purchases | Was querying `created_at` instead of `purchased_at` | **Fixed** (2026-04-03) |
| B-03 | Admin users/payments → buyers without profiles | Inner join on profiles excluded buyers without profile rows | **Fixed** (2026-04-03) |
| B-04 | University pages (`/university/*`) | Exist but unclear if connected to main flows | **Investigate** |
| B-05 | `?module=courses` param | Present in URLs but not implemented in code | **Low priority** |

---

## Mocked / Placeholder Logic

| ID | Area | Status | Notes |
|----|------|--------|-------|
| M-01 | Demo mode snapshots | Mocked data | `adminSnapshot.ts` and `studentSnapshot.ts` provide fallback when tables are empty |
| M-02 | AI question generation | Real (Gemini) | Works but quality depends on prompt engineering |
| M-03 | Lesson summaries/related/deep-dive | Real (Gemini) | AI-generated, may produce inaccurate links |
| M-04 | YouTube URL validation | Real (oEmbed) | May fail for unlisted/private videos |
| M-05 | Transcript PDF generation | Real | Server-side PDF streaming |

---

## Backend Gaps

| ID | Gap | Impact | Recommendation |
|----|-----|--------|----------------|
| BG-01 | No rate limiting on API routes | Medium | Add rate limiting for auth, quiz, and payment endpoints |
| BG-02 | No API versioning | Low | Add `/api/v1/` prefix for future compatibility |
| BG-03 | No webhook retry logic | Medium | If webhook processing fails, no automatic retry |
| BG-04 | No background job queue | Low | Email sending is fire-and-forget; consider a queue for reliability |
| BG-05 | No database backups automation | High | Ensure Supabase automated backups are enabled |
| BG-06 | No migration rollback capability | Medium | Supabase migrations are forward-only |
