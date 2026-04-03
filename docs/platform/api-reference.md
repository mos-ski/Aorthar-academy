# API Reference

**Last Updated:** 2026-04-03

---

## Overview

Complete API route inventory grouped by product and domain.

---

## University — Learning & Classroom

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/lessons/reaction` | Like/dislike a lesson | Required |
| POST | `/api/lessons/summary` | Generate AI lesson summary | Required |
| GET | `/api/lessons/related` | Get related lessons | Required |
| POST | `/api/lessons/deep-dive` | Get supplemental discovery links | Required |
| GET | `/api/lessons/comments` | Get lesson comments | Required |
| POST | `/api/lessons/comments` | Add a comment | Required |
| POST | `/api/lessons/comments/reaction` | Like/dislike a comment | Required |

---

## University — Assessment

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/quiz/start` | Start a quiz/exam attempt | Required |
| POST | `/api/quiz/generate` | Generate fallback question set | Required |
| POST | `/api/quiz/submit` | Submit answers and get graded | Required |
| GET | `/api/quiz/attempt/[attemptId]` | Get attempt state | Required |
| GET | `/api/quiz/attempt/[attemptId]/solutions` | Get reviewed solutions | Required |

---

## University — Student Lifecycle

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/onboarding/complete` | Complete department onboarding | Required |
| POST | `/api/suggestions` | Submit a content suggestion | Required |
| POST | `/api/capstone/submit` | Submit capstone project | Required |
| POST | `/api/unlock-next-level` | Check and unlock next level | Required |

---

## University — Billing

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/payments/checkout` | Initiate subscription payment | Required |
| POST | `/api/webhooks/paystack` | Paystack webhook handler | Webhook |

---

## University — Admin

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/courses` | List courses | Admin |
| POST | `/api/admin/courses` | Create a course | Admin |
| GET | `/api/admin/courses/[courseId]` | Get course details | Admin |
| PATCH | `/api/admin/courses/[courseId]` | Update course metadata | Admin |
| DELETE | `/api/admin/courses/[courseId]` | Delete a course | Admin |
| GET | `/api/admin/courses/[courseId]/lessons` | List lessons | Admin |
| POST | `/api/admin/courses/[courseId]/lessons` | Create a lesson | Admin |
| GET | `/api/admin/courses/[courseId]/questions` | List questions | Admin |
| POST | `/api/admin/courses/[courseId]/questions` | Create a question | Admin |
| PATCH | `/api/admin/lessons/[lessonId]` | Update a lesson | Admin |
| DELETE | `/api/admin/lessons/[lessonId]` | Delete a lesson | Admin |
| POST | `/api/admin/lessons/[lessonId]/resources` | Add a resource | Admin |
| PATCH | `/api/admin/resources/[resourceId]` | Update a resource | Admin |
| DELETE | `/api/admin/resources/[resourceId]` | Delete a resource | Admin |
| PATCH | `/api/admin/questions/[questionId]` | Update a question | Admin |
| DELETE | `/api/admin/questions/[questionId]` | Delete a question | Admin |
| GET | `/api/admin/curriculum` | Get full curriculum structure | Admin |
| POST | `/api/admin/years` | Create a year | Admin |
| DELETE | `/api/admin/years/[yearId]` | Delete a year | Admin |
| POST | `/api/admin/semesters` | Create a semester | Admin |
| DELETE | `/api/admin/semesters/[semesterId]` | Delete a semester | Admin |
| GET | `/api/admin/users` | List users | Admin |
| PATCH | `/api/admin/users/[userId]` | Update user (role, etc.) | Admin |
| PATCH | `/api/admin/users/[userId]/premium` | Grant/revoke premium | Admin |
| PATCH | `/api/admin/users/[userId]/suspension` | Suspend/unsuspend | Admin |
| GET | `/api/admin/suggestions` | List suggestions | Admin |
| PATCH | `/api/admin/suggestions/[id]` | Approve/reject suggestion | Admin |
| GET | `/api/admin/capstone` | List capstone submissions | Admin |
| PATCH | `/api/admin/capstone/[id]` | Review capstone | Admin |
| GET | `/api/admin/payments` | List transactions | Admin |
| GET | `/api/admin/transactions/unified` | Unified transaction view | Admin |
| POST | `/api/admin/admin-access/invite` | Invite admin | Super Admin |
| POST | `/api/admin/admin-access/grant` | Grant admin access | Super Admin |
| PATCH | `/api/admin/admin-access/[userId]/level` | Change admin level | Super Admin |
| GET | `/api/admin/audit-logs` | View audit logs | Super Admin |
| GET | `/api/admin/pricing` | List plans | Admin |
| PATCH | `/api/admin/pricing/[planId]` | Update a plan | Admin |
| POST | `/api/admin/standalone-courses` | Create bootcamp | Admin |
| GET | `/api/admin/standalone-courses` | List bootcamps | Admin |
| PATCH | `/api/admin/standalone-courses/[id]` | Update bootcamp | Admin |
| GET | `/api/admin/standalone-courses/[id]/lessons` | List bootcamp lessons | Admin |
| POST | `/api/admin/standalone-courses/[id]/lessons` | Add bootcamp lesson | Admin |
| PATCH | `/api/admin/standalone-courses/[id]/lessons/[lessonId]` | Update bootcamp lesson | Admin |
| GET | `/api/admin/students/import` | Import students (CSV) | Admin |
| PATCH | `/api/admin/students/[userId]/standalone-access` | Grant bootcamp access | Admin |

---

## Auth

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/callback` | Supabase email verification callback | Public |
| POST | `/api/auth/forgot-password` | Send password reset email | Public |
| POST | `/api/auth/send-welcome` | Send welcome email | Public |

---

## Account

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/account` | Get current user profile | Required |
| PATCH | `/api/account` | Update profile (name, avatar) | Required |
| POST | `/api/account/delete` | Request account deletion | Required |
| POST | `/api/account/change-department` | Change department | Required |
| POST | `/api/account/logout` | Logout from all sessions | Required |

---

## Bootcamps

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/standalone/checkout` | Initiate bootcamp purchase | Required |
| GET | `/api/standalone/verify-payment` | Verify payment via redirect | Required |
| POST | `/api/standalone/verify-payment` | Verify payment via webhook | Webhook |
| GET | `/api/standalone/progress` | Get bootcamp progress | Required |
| POST | `/api/standalone/certificate/generate` | Generate completion certificate | Required |
| POST | `/api/standalone/logout` | Logout from bootcamps | Required |

---

## Internship

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/internship/checkout` | Initiate form purchase | Public |
| GET | `/api/internship/verify-payment` | Verify form payment | Public |
| POST | `/api/internship/exam/start` | Validate code, start exam session | Public |
| POST | `/api/internship/exam/submit` | Submit exam answers | Public |
| POST | `/api/internship/exam/grade` | Admin: grade all submissions | Admin |
| POST | `/api/internship/select-top` | Admin: select top 10 | Admin |
| POST | `/api/internship/placements` | Admin: create placement records | Admin |

---

## Cron / Background

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/cron/repair-links` | Scheduled link maintenance | Cron |

---

## Demo

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/demo-mode` | Toggle demo mode (dev only) | Admin |

---

## Partnership

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/partnership` | Submit partnership inquiry | Public |

---

## Transcript

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/transcript/download` | Download academic transcript PDF | Required |
