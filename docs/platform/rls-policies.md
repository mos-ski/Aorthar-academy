# RLS Policies Reference

**Last Updated:** 2026-04-03

---

## Overview

Supabase Row Level Security policies control data access at the row level. This document lists all policies across all tables.

---

## Profile Policies

### profiles

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own profile | SELECT | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` |
| Admins can view all profiles | SELECT | `auth.jwt() ->> 'role' = 'admin'` |
| Admins can update all profiles | UPDATE | `auth.jwt() ->> 'role' = 'admin'` |
| New user profile auto-created | INSERT | Database trigger `handle_new_user()` |

---

## Academic Policies (University)

### years, semesters

| Policy | Action | Condition |
|--------|--------|-----------|
| Public read | SELECT | True (published content) |
| Admin write | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### courses

| Policy | Action | Condition |
|--------|--------|-----------|
| Published courses readable by all | SELECT | `status = 'published'` |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### lessons, resources

| Policy | Action | Condition |
|--------|--------|-----------|
| Published lessons readable by enrolled users | SELECT | `is_published = true` AND user is enrolled |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### questions

| Policy | Action | Condition |
|--------|--------|-----------|
| No direct read | SELECT | False (served via quiz API only) |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

---

## Assessment Policies

### quiz_attempts

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own attempts | SELECT | `auth.uid() = user_id` |
| No direct insert (via API only) | INSERT | False |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### course_grades

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own grades | SELECT | `auth.uid() = user_id` |
| No direct write (system-calculated) | INSERT/UPDATE | False |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### semester_gpas, cumulative_gpas

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own GPA | SELECT | `auth.uid() = user_id` |
| No direct write (system-calculated) | INSERT/UPDATE | False |

---

## Progression Policies

### enrollments

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own enrollments | SELECT | `auth.uid() = user_id` |
| System auto-enrolls on onboarding | INSERT | Via `onboarding/complete` API |
| Admin can view/manage all | SELECT/INSERT/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### user_progress

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own progress | SELECT | `auth.uid() = user_id` |
| System updates progress | UPDATE | Via quiz/exam submission |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### semester_progress

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own progress | SELECT | `auth.uid() = user_id` |
| System updates on semester completion | UPDATE | Via progression engine |

---

## Capstone Policies

### capstone_submissions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own submissions | SELECT | `auth.uid() = user_id` |
| Users can create own submission | INSERT | `auth.uid() = user_id` AND eligible |
| Users cannot modify after submission | UPDATE | False |
| Admin can view/manage all | SELECT/UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

---

## Community Policies

### suggestions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view all suggestions | SELECT | True |
| Users can create suggestions | INSERT | `auth.uid() = user_id` |
| Users cannot modify | UPDATE | False |
| Admin can update status | UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

### suggestion_votes

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view votes | SELECT | True |
| Users can vote (once per suggestion) | INSERT | `auth.uid() = user_id` |
| Users cannot modify votes | UPDATE | False |

### lesson_reactions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view reactions | SELECT | True |
| Users can react to lessons | INSERT/UPDATE | `auth.uid() = user_id` |

### lesson_comments

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view comments | SELECT | True |
| Users can comment | INSERT | `auth.uid() = user_id` |
| Users can edit own comments | UPDATE | `auth.uid() = user_id` |

### lesson_comment_reactions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view reactions | SELECT | True |
| Users can react to comments | INSERT/UPDATE | `auth.uid() = user_id` |

---

## AI Content Policies

### lesson_summaries

| Policy | Action | Condition |
|--------|--------|-----------|
| Published summaries readable | SELECT | `lesson_id` is published |
| System generates summaries | INSERT | Via AI pipeline |

### lesson_deep_dive_links

| Policy | Action | Condition |
|--------|--------|-----------|
| Published links readable | SELECT | `lesson_id` is published |
| System generates links | INSERT | Via AI pipeline |

---

## Billing Policies

### subscriptions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own subscription | SELECT | `auth.uid() = user_id` |
| System creates via webhook | INSERT | Via Paystack webhook |
| Admin can view/manage all | SELECT/UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

### plans

| Policy | Action | Condition |
|--------|--------|-----------|
| Active plans readable by all | SELECT | `is_active = true` |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### transactions

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own transactions | SELECT | `auth.uid() = user_id` |
| System creates via webhook | INSERT | Via Paystack webhook |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

---

## Internship Policies

### internship_cohorts

| Policy | Action | Condition |
|--------|--------|-----------|
| Public read | SELECT | True |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### internship_applications

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own application | SELECT | `auth.uid() = user_id` OR email match |
| System creates via payment | INSERT | Via webhook |
| Admin can view/manage all | SELECT/UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

### internship_exam_results

| Policy | Action | Condition |
|--------|--------|-----------|
| No direct read (via API only) | SELECT | False |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### internship_placements

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own placement | SELECT | Via application relationship |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

---

## Bootcamp Policies

### standalone_courses

| Policy | Action | Condition |
|--------|--------|-----------|
| Published bootcamps readable | SELECT | `status = 'published'` |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### standalone_lessons

| Policy | Action | Condition |
|--------|--------|-----------|
| Published lessons readable | SELECT | `is_published = true` |
| Admin full access | INSERT/UPDATE/DELETE | `auth.jwt() ->> 'role' = 'admin'` |

### standalone_purchases

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own purchases | SELECT | `auth.uid() = user_id` |
| System creates via payment | INSERT | Via Paystack webhook |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### standalone_lesson_progress

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view/update own progress | SELECT/UPDATE | `auth.uid() = user_id` |
| Admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

---

## Admin Policies

### audit_log

| Policy | Action | Condition |
|--------|--------|-----------|
| No insert by users | INSERT | False (system-only) |
| Super admin can view all | SELECT | `auth.jwt() ->> 'role' = 'admin'` |

### webhook_events

| Policy | Action | Condition |
|--------|--------|-----------|
| No access by users | ALL | False (system-only) |

### notifications

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own notifications | SELECT | `auth.uid() = user_id` |
| System creates notifications | INSERT | Via triggers |
| Users can mark as read | UPDATE | `auth.uid() = user_id` |

### partnership_inquiries

| Policy | Action | Condition |
|--------|--------|-----------|
| Public submit | INSERT | True |
| Admin can view/manage all | SELECT/UPDATE | `auth.jwt() ->> 'role' = 'admin'` |

---

## Key Principles

1. **Users can only see their own data** — profiles, grades, purchases, progress
2. **Graded records are immutable** — no UPDATE after grading
3. **Assessment data is never directly readable** — served via API with server-side validation
4. **Admin bypasses RLS for writes** — uses `createAdminClient()` for admin operations
5. **Webhook-created records bypass RLS** — system-level inserts
