# QA Test Cases — Aorthar Academy

---

## Smoke Test Suite (Critical Path)

| # | Test | Module | Priority |
|---|------|--------|----------|
| SM-01 | User can register with valid credentials | Auth | High |
| SM-02 | User receives verification email | Auth | High |
| SM-03 | User can verify email and access dashboard | Auth | High |
| SM-04 | User can log in with valid credentials | Auth | High |
| SM-05 | Dashboard loads with courses | University | High |
| SM-06 | User can start and submit a quiz | University | High |
| SM-07 | User can purchase a standalone course | Standalone | High |
| SM-08 | Admin can view users and transactions | Admin | High |
| SM-09 | Payment webhook records purchase | Payments | High |
| SM-10 | Suspended user cannot access platform | Auth | High |

---

## Detailed Test Cases

### Authentication

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| AUTH-01 | Register with valid university credentials | High | 1. Visit /register on aorthar.com 2. Enter name, email, valid password, department 3. Submit | Account created, redirected to /verify, email sent |
| AUTH-02 | Register with valid standalone credentials | High | 1. Visit /register on courses.aorthar.com 2. Enter name, email, valid password 3. Submit | Account created, redirected to /verify, email sent |
| AUTH-03 | Register with weak password | Medium | 1. Enter password "password1" (no uppercase) 2. Submit | Error: "Must contain at least one uppercase letter" |
| AUTH-04 | Register with existing email | Medium | 1. Use email of existing account 2. Submit | Supabase error shown to user |
| AUTH-05 | Register with invalid email | Low | 1. Enter "notanemail" 2. Submit | Error: "Invalid email address" |
| AUTH-06 | Login with correct credentials | High | 1. Visit /login 2. Enter valid email + password 3. Submit | Redirected to dashboard |
| AUTH-07 | Login with wrong password | Medium | 1. Enter valid email + wrong password 2. Submit | Error shown, no redirect |
| AUTH-08 | Login with unverified email | Medium | 1. Register new account 2. Don't verify 3. Try to login | Login succeeds but onboarding gate blocks access |
| AUTH-09 | Forgot password flow | High | 1. Visit /forgot-password 2. Enter email 3. Submit | Reset email sent, success message shown |
| AUTH-10 | Reset password | High | 1. Click reset link from email 2. Enter new password (matching confirm) 3. Submit | Password updated, redirected to dashboard |
| AUTH-11 | Reset password with mismatched passwords | Low | 1. Enter different passwords in both fields 2. Submit | Error: "Passwords do not match" |
| AUTH-12 | Suspended user login | High | 1. Suspend user via admin 2. User logs in | Redirected to /suspended |
| AUTH-13 | Session persistence across subdomains | High | 1. Login on aorthar.com 2. Visit courses.aorthar.com | User is authenticated on both |
| AUTH-14 | Logout from standalone platform | Medium | 1. On courses.aorthar.com 2. Call /api/standalone/logout | Session cleared, redirected |

### University Student App

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| UNI-01 | Dashboard loads with semester courses | High | 1. Login as student 2. Visit /dashboard | Shows current year/semester, courses, progress |
| UNI-02 | Course listing shows all semesters | Medium | 1. Visit /courses | Courses grouped by semester with status |
| UNI-03 | Enter classroom for a course | High | 1. Click course → Enter Classroom | Classroom loads with lessons, materials tabs |
| UNI-04 | Start quiz | High | 1. In classroom, click "Start Quiz" 2. Confirm | Quiz starts, timer begins, questions shown |
| UNI-05 | Submit quiz | High | 1. Answer questions 2. Click Submit | Score calculated, results displayed |
| UNI-06 | Quiz answers not exposed to client | High | 1. Start quiz 2. Inspect network requests | No correct answers in API response |
| UNI-07 | Quiz cooldown enforcement | Medium | 1. Submit quiz 2. Try to start again immediately | Blocked with cooldown timer |
| UNI-08 | Quiz attempt limit enforcement | Medium | 1. Submit quiz 3 times 2. Try 4th attempt | Blocked, no new attempt created |
| UNI-09 | GPA page shows correct calculation | High | 1. Complete courses with known scores 2. Visit /gpa | GPA matches manual calculation |
| UNI-10 | Progress page shows semester status | Medium | 1. Visit /progress | Visual breakdown of completed/locked courses |
| UNI-11 | Capstone submission (eligible student) | High | 1. 400-level + premium + GPA ≥ 3.5 2. Fill capstone form 3. Submit | Status changes to "pending" |
| UNI-12 | Capstone submission (ineligible student) | Medium | 1. Not 400-level or no premium 2. Try to submit | Form disabled or blocked |
| UNI-13 | Submit curriculum suggestion | Medium | 1. Visit /suggest 2. Fill form 3. Submit | Suggestion recorded as pending |
| UNI-14 | Premium subscription purchase | High | 1. Visit /pricing 2. Select plan 3. Complete Paystack | Subscription activated, premium features unlocked |
| UNI-15 | Semester unlock after passing all courses | High | 1. Pass all Semester 1 courses 2. Refresh | Semester 2 courses unlocked |
| UNI-16 | Year 400 locked without premium | Medium | 1. Free student 2. Try to access 400-level | Blocked, prompted to upgrade |
| UNI-17 | Department change | Medium | 1. Settings → Change department 2. Select new 3. Confirm | Profile updated, progress recalculated |
| UNI-18 | Download transcript | Medium | 1. Complete at least one course 2. Request transcript | PDF downloaded with grades and GPA |
| UNI-19 | Delete account | High | 1. Settings → Delete account 2. Confirm | Account deleted, logged out, data removed |

### Standalone Courses

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| SC-01 | Browse published courses | High | 1. Visit /courses-app | Published courses displayed with prices |
| SC-02 | View course detail page | High | 1. Click a course | Course page with preview, description, buy button |
| SC-03 | Free preview (1 minute) | High | 1. Play first lesson without purchasing 2. Wait 60 seconds | Preview ends, paywall overlay shown |
| SC-04 | Purchase course via Paystack | High | 1. Logged in 2. Click "Buy" 3. Complete Paystack | Redirected to learn page, purchase recorded |
| SC-05 | Purchase recording (webhook) | High | 1. Purchase course 2. Close browser immediately 3. Wait for webhook | Purchase recorded in database |
| SC-06 | Access purchased lessons | High | 1. Purchase course 2. Visit /courses-app/learn/[slug] | All lessons accessible, no paywall |
| SC-07 | Access unpurchased course | Medium | 1. Don't purchase 2. Try /courses-app/learn/[slug] | Redirected to course page |
| SC-08 | Lesson progress tracking | Medium | 1. Watch lesson 2. Move to next 3. Check progress | Previous lesson marked complete |
| SC-09 | My Courses page | Medium | 1. Visit /courses-app/learn | List of all purchased courses with progress |
| SC-10 | Duplicate purchase prevention | Medium | 1. Purchase course 2. Try to purchase again | Redirected to learn page (409) |
| SC-11 | YouTube video playback | Medium | 1. Watch YouTube lesson | Video plays correctly |
| SC-12 | Google Drive video playback | Medium | 1. Watch Drive lesson | Video plays correctly |
| SC-13 | Course not found (invalid slug) | Low | 1. Visit /courses-app/nonexistent | 404 page |
| SC-14 | Draft course not visible | Low | 1. Course status = draft 2. Browse courses | Course not shown |

### Admin Dashboard

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| AD-01 | Admin dashboard loads | High | 1. Login as admin 2. Visit /admin | Metrics displayed: users, subscriptions, revenue |
| AD-02 | Create course | High | 1. /admin/courses → Create 2. Fill form 3. Save | Course created, appears in list |
| AD-03 | Edit course | Medium | 1. Select course 2. Edit fields 3. Save | Changes saved and reflected |
| AD-04 | Delete course | Medium | 1. Select course 2. Delete | Course removed (or blocked if has enrollments) |
| AD-05 | Add lesson to course | Medium | 1. Edit course 2. Add lesson 3. Save | Lesson appears in course |
| AD-06 | Add question to course | Medium | 1. Edit course 2. Add question with options 3. Save | Question saved with correct options format |
| AD-07 | View users list | High | 1. /admin/users | All users shown with name, email, role, status |
| AD-08 | Search users | Medium | 1. /admin/users 2. Enter name/email in search | Filtered results |
| AD-09 | Filter users by role | Medium | 1. /admin/users 2. Select role filter | Only matching users shown |
| AD-10 | View standalone course buyers | High | 1. /admin/users 2. Check users with purchases | Buyers shown with course names in Purchases column |
| AD-11 | View payments/transactions | High | 1. /admin/payments | All subscriptions + standalone purchases shown |
| AD-12 | Revenue calculation | Medium | 1. /admin/payments 2. Check total revenue | Matches sum of all successful transactions |
| AD-13 | Review suggestion | Medium | 1. /admin/suggestions 2. Select pending 3. Approve/reject | Status updated, contributor promoted if applicable |
| AD-14 | Review capstone | Medium | 1. /admin/capstone 2. Select pending 3. Approve/reject/revision | Status updated, student notified |
| AD-15 | Manage standalone courses | High | 1. /admin/standalone-courses 2. Create course 3. Add lessons | Course created and published |
| AD-16 | Suspend user | High | 1. /admin/users 2. Suspend user | User redirected to /suspended on next login |
| AD-17 | Grant premium access | Medium | 1. /admin/users 2. Grant premium | User gains premium features immediately |
| AD-18 | Grant standalone access | Medium | 1. /admin/users 2. Grant course access | User can access course without payment |
| AD-19 | View audit logs | Medium | 1. /admin/audit-logs | Chronological log of admin actions |
| AD-20 | Non-admin access blocked | High | 1. Login as student 2. Visit /admin | Redirected to /unauthorized (in staging/prod) |
| AD-21 | Finance admin cannot edit courses | Medium | 1. Login as finance_admin 2. Try to edit course | Blocked by permissions |
| AD-22 | Content admin cannot view payments | Medium | 1. Login as content_admin 2. Try /admin/payments | Blocked by permissions |

### Payments

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| PAY-01 | Paystack checkout session created | High | 1. Click checkout 2. API call | Payment URL returned |
| PAY-02 | Webhook signature verification | High | 1. Send webhook with invalid signature | 400 response |
| PAY-03 | Webhook records subscription | High | 1. Successful subscription payment 2. Webhook fires | Subscription created in DB |
| PAY-04 | Webhook records standalone purchase | High | 1. Successful course payment 2. Webhook fires | Purchase recorded in DB |
| PAY-05 | Idempotent webhook handling | High | 1. Send same webhook event twice | Only one record created |
| PAY-06 | Failed payment handling | Medium | 1. Payment fails at Paystack | No subscription/purchase created |
| PAY-07 | Purchase confirmation email sent | Medium | 1. Complete purchase | Email received with course details |
| PAY-08 | Subscription expiration | Medium | 1. Subscription end_date passes 2. expire_subscriptions() runs | Status changed to expired |
| PAY-09 | Premium access revoked on expiry | High | 1. Subscription expires 2. Try to access premium feature | Blocked |

### Security

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| SEC-01 | RLS prevents cross-user data access | High | 1. Login as user A 2. Try to query user B's data | No data returned |
| SEC-02 | Admin API requires admin role | High | 1. Login as student 2. Call /api/admin/courses | 401/403 response |
| SEC-03 | Quiz answers not leaked | High | 1. Start quiz 2. Inspect API response | No is_correct in options |
| SEC-04 | Suspended user API blocked | High | 1. Suspend user 2. Call any authenticated API | 403 response |
| SEC-05 | Paystack webhook HMAC verification | High | 1. Send webhook without valid signature | 400 response |
| SEC-06 | Service role key not exposed | High | 1. Inspect client bundle | No SUPABASE_SERVICE_ROLE_KEY |
| SEC-07 | Demo mode hidden in production | Medium | 1. Visit production site | No demo toggle visible |

### Edge Cases & Error Handling

| TC | Title | Priority | Steps | Expected |
|----|-------|----------|-------|----------|
| ERR-01 | Network error during signup | Medium | 1. Block network 2. Try to register | Error message shown |
| ERR-02 | Paystack timeout during checkout | Medium | 1. Start checkout 2. Network drops | Error message, retry option |
| ERR-03 | Quiz timer expires | Medium | 1. Start quiz 2. Wait until timer hits 0 | Auto-submit or block further answers |
| ERR-04 | Invalid course code format | Low | 1. Admin creates course with "invalid-code" | Validation error |
| ERR-05 | GPA with no courses | Low | 1. New student visits /gpa | Shows 0.0 or "No grades yet" |
| ERR-06 | Empty transaction list | Low | 1. Admin visits /admin/payments with no transactions | "No transactions yet" message |
| ERR-07 | Empty user list | Low | 1. Admin visits /admin/users with no users | "No users" message |
| ERR-08 | Concurrent quiz submissions | Low | 1. Submit quiz twice rapidly | Only one attempt recorded |

---

## Regression Test Scenarios

| # | Scenario | Priority |
|---|----------|----------|
| REG-01 | After deploying new course, existing students see it | High |
| REG-02 | After changing pricing, existing subscriptions unaffected | High |
| REG-03 | After department change, student's progress recalculated | High |
| REG-04 | After admin suspension, user immediately blocked | High |
| REG-05 | After webhook reprocessing, no duplicate transactions | High |
| REG-06 | After updating quiz questions, existing attempts unaffected | Medium |
| REG-07 | After adding new lesson, course progress not reset | Medium |

---

## Test Environment Requirements

- **Supabase project** with all migrations applied
- **Paystack test mode** with test keys
- **Resend test mode** or email sandbox
- **Gemini API key** for AI features
- **Test accounts**: 1 admin, 1 student (free), 1 student (premium), 1 standalone buyer
- **Browser**: Chrome, Safari, Firefox (latest)
- **Mobile**: iOS Safari, Android Chrome
