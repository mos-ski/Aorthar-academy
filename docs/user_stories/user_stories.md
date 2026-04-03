# User Stories — Aorthar Academy

---

## Authentication & Onboarding

**AS-001** As a visitor, I want to browse the landing page and pricing so that I can understand what Aorthar Academy offers before signing up.

Given I am on aorthar.com
When I view the landing page
Then I see hero section, features, pricing cards, and partner logos

**AS-002** As a visitor, I want to create an account with my email, name, and password so that I can access the platform.

Given I am on the register page
When I fill in my full name, email, and a valid password (8+ chars, uppercase, number)
And I click "Create Account"
Then I am redirected to the email verification page
And a verification email is sent to my inbox

**AS-003** As a new student, I want to verify my email so that I can activate my account.

Given I have received a verification email
When I click the verification link
Then my account is activated
And I am redirected to the onboarding page (university) or dashboard (courses)

**AS-004** As a university student, I want to select my department during onboarding so that I see the correct curriculum for my field.

Given I have verified my email on the university domain
When I complete the onboarding form with my department
Then my profile is updated with the department
And I am redirected to the dashboard

**AS-005** As a returning user, I want to log in with my email and password so that I can access my account.

Given I have a verified account
When I enter my email and password on the login page
And I click "Sign In"
Then I am redirected to my dashboard (or the `?next` URL)

**AS-006** As a user who forgot my password, I want to reset it via email so that I can regain access to my account.

Given I am on the forgot password page
When I enter my registered email
And I submit the form
Then I receive a password reset email
And clicking the link takes me to the reset password page

---

## University Student App

**US-001** As a university student, I want to see my dashboard with my current semester, courses, and progress so that I know what to study next.

Given I am logged in and have completed onboarding
When I visit /dashboard
Then I see my current year/semester, enrolled courses, progress summary, and quick actions

**US-002** As a student, I want to view my course list so that I can see all available courses for my department and level.

Given I am on the courses page
When I view the course listing
Then I see courses grouped by semester with status indicators (not started, in progress, passed, failed)

**US-003** As a student, I want to enter the classroom for a course so that I can study lessons and take quizzes.

Given I am on a course page
When I click "Enter Classroom"
Then I am taken to the classroom viewer with lessons, materials, and quiz tabs

**US-004** As a student, I want to take a quiz so that I can test my knowledge and earn a grade.

Given I am in the classroom for a course
When I start a quiz
Then I see timed questions one at a time
And I can submit my answers
And I receive my score after submission

**US-005** As a student, I want to take an exam so that I can complete the course assessment.

Given I have completed the quiz requirements for a course
When I start an exam
Then I see timed exam questions
And my score contributes to my final course grade

**US-006** As a student, I want to see my GPA so that I can track my academic performance.

Given I have completed at least one semester's courses
When I visit the GPA page
Then I see my semester GPA and cumulative GPA on a 5.0 scale

**US-007** As a student, I want to see my progress across semesters so that I know what I've completed and what's next.

Given I am on the progress page
Then I see a visual breakdown of my completed, in-progress, and locked courses by semester

**US-008** As a 400-level student with premium access and GPA ≥ 3.5, I want to submit my capstone project so that I can graduate.

Given I meet all capstone requirements
When I fill out the capstone form with GitHub URL, live URL, description, and tech stack
And I submit it
Then my capstone is marked as pending review

**US-009** As a student, I want to suggest improvements to the curriculum so that I can contribute to the community.

Given I am logged in
When I submit a suggestion for a course, lesson, or resource
Then my suggestion is recorded as pending review
And I earn contributor status after 3 approved suggestions

**US-010** As a student, I want to upgrade to premium so that I can access Year 400 courses and the capstone.

Given I am on the pricing page
When I select a premium plan and complete payment via Paystack
Then my subscription is activated
And I gain access to premium features

---

## Standalone Courses (courses.aorthar.com)

**SC-001** As a visitor, I want to browse standalone courses so that I can find courses to purchase.

Given I visit courses.aorthar.com
When I view the course catalog
Then I see published courses with titles, descriptions, prices, and instructor info

**SC-002** As a visitor, I want to preview the first lesson of a course for free so that I can evaluate the course quality.

Given I am viewing a course page
When I play the first lesson
Then I can watch a 1-minute free preview
And after the preview, I see a paywall prompt

**SC-003** As a logged-in user, I want to purchase a course so that I get lifetime access.

Given I am logged in and viewing a course
When I click "Buy this course"
Then I am redirected to Paystack to complete payment
And after successful payment, I gain full access to all lessons

**SC-004** As a course buyer, I want to watch purchased lessons so that I can learn at my own pace.

Given I have purchased a course
When I visit the course learn page
Then I can watch all lessons without restrictions
And my progress is tracked

**SC-005** As a learner, I want to see my purchased courses in one place so that I can easily resume learning.

Given I have purchased one or more courses
When I visit /courses-app/learn
Then I see a list of all my purchased courses with progress indicators

---

## Admin Dashboard

**AD-001** As an admin, I want to see an overview dashboard so that I can quickly understand platform health.

Given I am logged in as an admin
When I visit /admin
Then I see key metrics: total users, active subscriptions, revenue, recent activity

**AD-002** As an admin, I want to manage courses so that I can create, edit, and publish curriculum content.

Given I am on the admin courses page
When I create or edit a course
Then I can set the code, name, description, thumbnail, year, semester, credit units, pass mark, and grading weights

**AD-003** As an admin, I want to manage lessons and resources within a course so that I can structure the learning content.

Given I am editing a course
When I add lessons and resources
Then I can set titles, content (Markdown), YouTube URLs, links, and documents
And I can order them

**AD-004** As an admin, I want to manage the question bank so that I can create quiz and exam questions.

Given I am on the admin questions page
When I create a question
Then I can set the question text, options (with correct answers), explanation, points, difficulty, and scope

**AD-005** As an admin, I want to view and manage users so that I can see who has registered, their roles, and their purchases.

Given I am on the admin users page
When I view the user list
Then I see all registered users with their name, email, role, department, premium status, and course purchases
And I can search and filter by role

**AD-006** As an admin, I want to view all transactions so that I can monitor revenue and payment history.

Given I am on the admin payments page
When I view the transaction list
Then I see both university subscriptions and standalone course purchases with user info, amounts, and dates

**AD-007** As an admin, I want to review student suggestions so that I can approve or reject curriculum improvements.

Given I am on the admin suggestions page
When I review a suggestion
Then I can see the proposed content, vote count, and approve or reject with notes

**AD-008** As an admin, I want to review capstone submissions so that I can approve or request revisions.

Given I am on the admin capstone page
When I review a capstone
Then I can see the GitHub URL, live URL, description, tech stack, and approve/reject/request revision

**AD-009** As an admin, I want to manage standalone courses so that I can create and edit pay-per-course offerings.

Given I am on the admin standalone courses page
When I create a standalone course
Then I can set the slug, title, description, price, thumbnail, and status
And I can add lessons with YouTube/Drive URLs

**AD-010** As a super admin, I want to manage pricing plans so that I can adjust subscription pricing.

Given I am on the admin pricing page
When I edit a plan
Then I can change the name, price, billing type, and access scope

**AD-011** As a super admin, I want to view audit logs so that I can track all admin actions on the platform.

Given I am on the admin audit logs page
When I view the logs
Then I see a chronological list of all admin actions with who performed them, what changed, and when

**AD-012** As a super admin, I want to suspend a user's account so that I can block access for policy violations.

Given I am viewing a user in the admin panel
When I suspend their account
Then they are immediately redirected to the suspended page on next login
And their profile is marked as suspended

**AD-013** As a super admin, I want to grant premium access to a user so that I can give them free premium status.

Given I am viewing a user in the admin panel
When I grant them premium access
Then they immediately gain access to premium features

**AD-014** As a super admin, I want to grant standalone course access to a user so that I can give them a course without payment.

Given I am viewing a user in the admin panel
When I grant them access to a standalone course
Then they can immediately access that course's lessons

---

## Settings & Account

**ST-001** As a user, I want to update my profile information so that my name and social links are current.

Given I am on the settings page
When I edit my full name, bio, GitHub URL, or LinkedIn URL
And I save
Then my profile is updated

**ST-002** As a student, I want to change my department after onboarding so that I can switch to a different curriculum.

Given I have completed onboarding
When I request a department change
Then my profile is updated with the new department
And my progress is recalculated for the new curriculum

**ST-003** As a user, I want to delete my account so that I can remove all my data from the platform.

Given I am on the settings page
When I confirm account deletion
Then my profile, progress, and submissions are deleted
And I am logged out

**ST-004** As a user, I want to download my academic transcript so that I have a record of my performance.

Given I have completed at least one course
When I request my transcript
Then a PDF is generated and downloaded
And it includes my courses, grades, and GPA

---

## Notifications & System

**NT-001** As a student, I want to receive a welcome email after signing up so that I feel welcomed and know next steps.

Given I have just created an account
When my account is created
Then I receive a welcome email with next steps

**NT-002** As a course buyer, I want to receive a purchase confirmation email so that I have a record of my purchase.

Given I have successfully purchased a course
When the payment is verified
Then I receive a confirmation email with course details and access link

**NT-003** As a student, I want to receive a password reset email so that I can recover my account.

Given I requested a password reset
When I submit my email on the forgot password page
Then I receive an email with a reset link

---

## Partnership

**PT-001** As a potential partner, I want to submit a partnership inquiry so that I can explore collaboration opportunities.

Given I am on the partnership page or contact form
When I fill out the partnership inquiry form with my name, company, email, type, and message
And I submit it
Then my inquiry is recorded in the database
And I see a success confirmation
