# Product Recommendations — Aorthar Academy

---

## High-Impact, Low-Effort (Do First)

### 1. Admin CSV Export
**Impact:** High for finance/admin team  
**Effort:** 2–4 hours  
Add a "Export CSV" button to the users and payments admin pages. Finance teams need this for reconciliation and reporting.

### 2. Email Notifications for Reviews
**Impact:** High for student engagement  
**Effort:** 4–6 hours  
When an admin approves/rejects a suggestion or reviews a capstone, send an email to the student. Currently, students have no way of knowing their submission was reviewed unless they check manually.

### 3. Admin Pagination
**Impact:** High for scalability  
**Effort:** 4–8 hours  
Add pagination to users, transactions, and suggestions tables. Currently limited to 100 rows — will break as the platform grows.

### 4. Consolidate Purchase Recording
**Impact:** High for reliability  
**Effort:** 8–12 hours  
Three code paths record `standalone_purchases`. Consolidate to a single function with the webhook as primary and redirect as fallback. Reduces bugs and makes debugging easier.

### 5. Rate Limiting
**Impact:** High for security  
**Effort:** 4–8 hours  
Add rate limiting to auth endpoints (prevent brute force), quiz endpoints (prevent abuse), and payment endpoints (prevent fraud). Use Vercel Edge Middleware or Upstash Ratelimit.

---

## High-Impact, Medium-Effort (Do Next)

### 6. Course Search
**Impact:** High for discovery and conversions  
**Effort:** 1–2 weeks  
Add full-text search across both university and standalone courses. Use Supabase's built-in `pg_trgm` extension (already installed) for fuzzy matching. Include filters for department, level, price, and status.

### 7. Certificate of Completion
**Impact:** High for standalone course value proposition  
**Effort:** 1 week  
Generate a PDF certificate when a student completes all lessons in a standalone course. Increases perceived value and encourages social sharing (free marketing).

### 8. Notification System UI
**Impact:** Medium for engagement  
**Effort:** 1–2 weeks  
The `notifications` table already exists. Build a notification bell in the Navbar and a notification list page. Use this for: suggestion reviews, capstone reviews, subscription expiry reminders, and course announcements.

### 9. Coupon/Discount Codes
**Impact:** High for marketing and conversions  
**Effort:** 1–2 weeks  
Add a `coupon_codes` table with code, discount percentage/amount, expiration, and usage limits. Integrate into the Paystack checkout flow. Essential for marketing campaigns, flash sales, and referral programs.

### 10. Analytics Dashboard
**Impact:** High for product decisions  
**Effort:** 1 week  
Integrate PostHog (open-source, self-hostable) for page views, event tracking, funnel analysis, and cohort retention. Replace guesswork with data-driven decisions.

---

## Medium-Impact, Medium-Effort (Plan for Q2)

### 11. Discussion Forums
Add course-level discussion threads for university courses. Increases engagement and reduces support burden as students help each other.

### 12. Progress Email Reminders
Weekly automated emails to students who haven't studied in 7+ days. Include their current progress and a direct link to resume.

### 13. Bulk Email for Admins
Allow admins to send announcements to all students or filtered segments (by department, premium status, etc.).

### 14. Course Reviews/Ratings
Star ratings and written reviews for standalone courses. Social proof drives conversions.

### 15. Referral Program
Referral codes that give both referrer and referee a discount. Low-cost user acquisition channel.

---

## Strategic Recommendations

### 16. Instructor Marketplace
Allow external instructors to create and sell their own courses on the platform. Take a revenue share (20–30%). This transforms the platform from a single-instructor model to a marketplace, dramatically increasing catalog size and revenue potential.

### 17. Corporate/B2B Licensing
Offer bulk licenses to companies who want to train their teams. Price per seat with admin dashboard for HR managers. Higher ARPU than individual sales.

### 18. Mobile App (PWA First)
Before building a native app, create a Progressive Web App with offline lesson viewing. Lower development cost, instant distribution, works on all devices.

### 19. AI Tutor
Build a Gemini-powered Q&A assistant that can answer questions about course content. Differentiates from competitors and increases learning outcomes.

### 20. White-Label for Universities
Allow other universities to white-label the platform for their own students. B2B SaaS model with recurring revenue.

---

## Quick Wins (Under 2 Hours Each)

| # | Change | Impact |
|---|--------|--------|
| QW-01 | ~~Fix `/univeristy/transaction` typo redirect~~ | ✅ Resolved — removed /university/* and /univeristy/* routes entirely |
| QW-02 | Rename `src/lib/ai/openai.ts` to `gemini.ts` | Reduces confusion |
| QW-03 | Add `rel="noopener noreferrer"` to all external links | Security best practice |
| QW-04 | Add Open Graph meta tags to all public pages | Better social sharing |
| QW-05 | Add loading skeletons to admin tables | Perceived performance |
| QW-06 | Add empty state illustrations | Better UX |
| QW-07 | Standardize date formatting across all pages | Consistency |
| QW-08 | Add `?module=courses` filtering logic or remove param | Eliminates confusion |
