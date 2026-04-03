# Aorthar Academy — Dashboard & Interface Product Specification

## 1. Overview

The Aorthar Academy dashboard is the primary workspace for students navigating the 4‑year academic curriculum. The interface must feel like a modern university portal combined with a learning platform.

Core goals:
- Provide a clear academic journey (Year → Semester → Course)
- Display academic performance (GPA, credits, course status)
- Enable fast access to courses and learning materials
- Track progression and unlock levels
- Allow contributions to the open‑source curriculum

The dashboard must be mobile responsive and optimized for desktop learning sessions.

---

# 2. Global Layout

## 2.1 Layout Structure

Three primary interface zones:

Sidebar Navigation
Main Workspace
Top Utility Bar

### Sidebar Navigation

Persistent vertical navigation on the left.

Menu items:
- Dashboard
- Courses
- Progress
- GPA & Grades
- Capstone
- Suggest Content
- Settings

Additional (Admin role):
- Curriculum Manager
- Contribution Review
- User Management
- Financial Dashboard

Sidebar behaviors:
- Collapsible
- Icons + labels
- Active route highlighting

---

### Top Utility Bar

Displays:
- User avatar
- Current role (Student / Admin)
- Notification bell
- Quick search

Quick search must allow searching:
- Course code
- Course name
- Lesson topic

---

# 3. Dashboard (Home Screen)

The dashboard is the academic overview page.

## Components

### Welcome Header

Displays:
"Welcome back"
Student name
Current academic level

Example:
"Welcome back, Damola"
"Year 100 — Semester 1"

---

### Academic Stats Cards

Four key metrics:

1. Cumulative GPA
- Value (0.00 – 5.00)
- Progress bar visualizing progress to graduation

2. Credits Earned
- Total credit units completed

3. Courses Passed
- Total courses successfully completed

4. Courses In Progress
- Courses currently being studied

---

### Academic Journey Tracker

Visual representation of:

Year 100
Year 200
Year 300
Year 400

Each year expands to show semesters.

Each semester displays:
- course cards
- locked/unlocked status

Status states:

Locked
Available
In Progress
Completed

---

### Recent Activity Feed

Displays latest student actions:

Examples:
- "Completed Lesson: Typography Basics"
- "Passed Quiz: Design Principles"
- "Unlocked Semester 2"

---

# 4. Courses Page

## Purpose

Display the complete curriculum structure.

## Layout

Grid layout grouped by academic year.

Example:

Year 100

Semester 1
DES101 — Design Principles
DES103 — Typography
PM101 — Product Thinking
SCR101 — Agile Fundamentals

Semester 2
DES102 — UI Layout Systems
DEV102 — JavaScript Fundamentals
PM102 — User Research
SCR102 — Scrum Practice

Each course card shows:
- Course code
- Title
- Credit units
- Status

Status badges:

Locked
Available
In Progress
Passed
Failed

Clicking a course opens the Course Detail page.

---

# 5. Course Detail Interface

## Layout

Left panel: Lesson list
Right panel: Learning content

### Lesson Sidebar

Displays ordered lessons.

Example:

Lesson 1 — What is Design
Lesson 2 — Design vs Art
Lesson 3 — Visual Hierarchy
Lesson 4 — Alignment & Balance

Lessons display status:

Not Started
Completed

---

### Lesson Content

Main learning area.

Includes:

YouTube video embed
Summary notes
Additional reading

Controls:

Mark Lesson Complete
Next Lesson

---

### Quiz Section

After all lessons completed.

Student can start quiz.

Quiz UI includes:

Progress indicator
Question number
Answer choices
Timer

Submit button at end.

---

# 6. Academic Progress Page

Purpose:
Provide detailed view of curriculum completion.

Visual elements:

Progress bars per year.

Example:

Year 100 — 40% complete
Year 200 — Locked
Year 300 — Locked
Year 400 — Locked

Each year expands to show course completion.

---

# 7. GPA & Grades Page

Displays full academic transcript.

Table columns:

Course Code
Course Title
Credit Units
Grade
Semester
Status

Below table:

Semester GPA
Cumulative GPA

Export transcript button (premium feature).

---

# 8. Capstone Page

Available only in Year 400.

Students submit final project.

Submission fields:

GitHub Repository
Live Project URL
Project Description
Track Selection

Submission status:

Pending Review
Revision Required
Approved

---

# 9. Suggest Content Page

Purpose:
Enable open‑source contributions.

Suggestion types:

New Course
New Lesson
New Resource

Form fields:

Course Code
Course Name
Credit Units
Year Level
Semester
Description

Submission enters moderation queue.

---

# 10. Pricing Page

Two plans:

Free
- Access Year 100–300
- 3 quiz attempts
- Community contributions

Premium
- Access Year 400
- Capstone eligibility
- Certificate
- Unlimited quiz attempts

Payment processed via Paystack.

---

# 11. Admin Interfaces

Admin users access additional tools.

## Curriculum Manager

Create/Edit/Delete:

Years
Semesters
Courses
Lessons
Resources

---

## Contribution Review

Admin moderation queue.

Displays:

Suggestion type
Contributor
Course
Description

Admin actions:

Approve
Reject
Request Revision

---

## Financial Dashboard

Displays:

Total revenue
Active subscriptions
Payment history
Conversion rate

---

# 12. Design System

UI must follow:

Color palette:

Primary: Black / White minimal theme
Accent: Green for success
Accent: Red for failures

Components:

Cards
Tables
Progress bars
Badges
Modal dialogs

Framework:

TailwindCSS + Shadcn UI

---

# 13. Responsive Behavior

Desktop: Full sidebar
Tablet: Collapsible sidebar
Mobile: Bottom navigation

Learning interface prioritizes readability.

---

# 14. Future Enhancements

Planned improvements:

Community discussion per course
Peer review assignments
Mentorship cohorts
AI study assistant

---

This dashboard specification defines the complete learning interface for Aorthar Academy.

