# One-Year Roadmap — Aorthar Academy

---

## Q1 (Apr–Jun 2026) — Stabilization & Core Fixes

### Goals
- Fix all critical bugs and gaps identified in gap analysis
- Establish testing foundation
- Improve admin experience for monitoring buyers and transactions

### Features
- [ ] **Admin transaction visibility** — Ensure all standalone buyers appear in users list and payments page (done)
- [ ] **Admin pagination** — Add pagination to users, transactions, and suggestions tables
- [ ] **CSV export** — Export users and transactions from admin panel
- [ ] **Email notifications for reviews** — Notify students when suggestions/capstones are reviewed
- [ ] **Rate limiting** — Add rate limiting to auth, quiz, and payment endpoints
- [ ] **Error monitoring** — Integrate Sentry for production error tracking
- [ ] **Test suite** — Add unit tests for GPA calculation, progression logic, and grading
- [x] **Fix typo route** — Removed `/univeristy/transaction` and all `/university/*` routes; all university links now point to `university.aorthar.com` (done)

### Technical Priorities
- Consolidate standalone purchase recording to single source of truth
- Standardize timestamp column naming
- Add error boundaries to all page layouts
- Fix admin guard to use server-side env check

### Success Metrics
- 0 critical bugs in production
- Test coverage > 40%
- Admin page load time < 2s with 1000+ users
- Email delivery rate > 99%

---

## Q2 (Jul–Sep 2026) — Core Feature Expansion

### Goals
- Enhance the learning experience for both university and standalone students
- Build community features
- Improve course discovery

### Features
- [ ] **Course search** — Full-text search across university and standalone courses
- [ ] **Discussion forums** — Course-level discussion threads for university courses
- [ ] **Certificate of completion** — PDF certificates for standalone courses (all lessons completed)
- [ ] **Notification system** — Build UI for existing `notifications` table; notification bell in Navbar
- [ ] **Course reviews/ratings** — Star ratings and written reviews for standalone courses
- [ ] **Progress email reminders** — Weekly nudges for inactive students
- [ ] **Bulk email for admins** — Send announcements to all students or segments
- [ ] **Coupon/discode codes** — Promo code system for marketing campaigns

### Technical Priorities
- Introduce lightweight global state (Zustand)
- Add React Query or SWR for client-side data fetching
- Implement database connection pooling optimization
- Add API versioning (`/api/v1/`)

### Success Metrics
- 20% increase in course completion rate
- 15% increase in standalone course conversions
- 50+ discussion threads active per month
- Notification open rate > 30%

---

## Q3 (Oct–Dec 2026) — Growth & Monetization

### Goals
- Drive revenue growth through new monetization features
- Expand standalone course catalog
- Build referral and affiliate systems

### Features
- [ ] **Referral program** — Referral codes for standalone courses with discounts
- [ ] **Affiliate dashboard** — Track affiliate earnings and referrals
- [ ] **Instructor onboarding** — Allow external instructors to create and manage standalone courses
- [ ] **Course bundles** — Bundle multiple standalone courses at a discount
- [ ] **Gift courses** — Purchase courses as gifts for other users
- [ ] **Multi-currency support** — Support USD in addition to NGN
- [ ] **A/B testing framework** — Test pricing page layouts and copy
- [ ] **Analytics dashboard** — Page views, engagement metrics, drop-off analysis (PostHog integration)

### Technical Priorities
- Multi-tenant instructor isolation in database
- Payment gateway abstraction (support multiple providers)
- CDN optimization for course thumbnails and media
- Database read replicas for analytics queries

### Success Metrics
- 30% of standalone revenue from referrals/affiliates
- 5+ external instructors onboarded
- 20% increase in average revenue per user
- Analytics dashboard with < 5min data freshness

---

## Q4 (Jan–Mar 2027) — Scale & Optimization

### Goals
- Prepare for 10x user growth
- Optimize performance and reliability
- Explore new product opportunities

### Features
- [ ] **PWA support** — Offline lesson viewing for standalone courses
- [ ] **Mobile app** — React Native app for iOS and Android
- [ ] **Gamification** — Streaks, badges, leaderboards for university students
- [ ] **Social sharing** — Share certificates and achievements on LinkedIn/Twitter
- [ ] **Advanced analytics** — Cohort analysis, LTV prediction, churn modeling
- [ ] **API for partners** — Public API for university partnerships
- [ ] **White-label option** — Allow institutions to white-label the platform
- [ ] **AI tutor** — Gemini-powered Q&A assistant for course content

### Technical Priorities
- Microservices architecture for quiz grading and payment processing
- Event-driven architecture with message queue (Upstash/SQS)
- Database sharding strategy for multi-tenant support
- CI/CD pipeline with automated testing and staging deployments
- Disaster recovery plan with cross-region backups

### Success Metrics
- 10,000+ active students
- 99.9% uptime
- < 1s page load time globally
- 50+ courses in standalone catalog
- 5+ institutional partnerships

---

## Out of Scope (Explicitly)

| Item | Reason |
|------|--------|
| Live video streaming | Requires significant infrastructure; YouTube/Drive is sufficient for now |
| Real-time collaboration | Not aligned with self-paced learning model |
| Blockchain/certificates | Over-engineering; PDF certificates are sufficient |
| Multi-language support | English-only market for now |
| Corporate/B2B sales | Focus on individual learners first |
| Video hosting infrastructure | YouTube and Google Drive handle this adequately |