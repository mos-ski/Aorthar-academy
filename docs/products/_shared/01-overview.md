# Product Overview — Aorthar Academy

**Last Updated:** 2026-04-03

---

## What Aorthar Is

Aorthar is a **five-subdomain education company** — four products plus a marketing site:

| Subdomain | Product | Model | Target User |
|-----------|---------|-------|-------------|
| `aorthar.com` | Marketing Site | — | Visitors, brand awareness |
| `internship.aorthar.com` | Internship | Quarterly cohorts (₦10k form fee) | Early-career product talent |
| `university.aorthar.com` | University | Subscription (semester/monthly/yearly) | Students seeking structured 4-year program |
| `bootcamp.aorthar.com` | Bootcamps | One-time purchase (permanent access) | Professionals wanting focused skills |
| `admin.aorthar.com` | Admin CMS | — | Internal team managing all products |

---

## Shared Infrastructure

### Single Sign-On (SSO)

- All five subdomains share **Supabase Auth** with `.aorthar.com` cookie domain
- One credential works across all products
- A user can be enrolled in University + own Bootcamp(s) + apply for Internship simultaneously

### Shared Services

| Service | Use |
|---------|-----|
| **Supabase** | Postgres database, Auth, Storage, Edge Functions |
| **Paystack** | Payments for Internship, University, and Bootcamps |
| **Resend** | Email (welcome, password reset, purchase confirmation) |
| **Vercel** | Hosting + CDN + Edge deployment |
| **Gemini AI** | Lesson summaries, related content, deep-dives (University only) |

---

## Product Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     Aorthar SSO                                  │
│              (Supabase Auth, .aorthar.com)                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Internship  │  │  University  │  │  Bootcamps   │           │
│  │              │  │              │  │              │           │
│  │ • 10k form   │  │ • Subscription│ │ • One-time   │           │
│  │ • Online exam│  │ • 4-year prog│ │ • Permanent  │           │
│  │ • Placement  │  │ • GPA system  │ │ • Self-paced │           │
│  │ • Certificate│  │ • Certificate │ │ • Certificate│           │
│  │              │  │              │  │              │           │
│  │ Completely   │  │ Completely   │  │ Completely   │           │
│  │ separate     │  │ separate     │  │ separate     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Marketing   │  │    Admin     │                             │
│  │  aorthar.com │  │ admin.aorthar│                             │
│  │              │  │              │                             │
│  │ Brand + CTA  │  │ Manages all  │                             │
│  │ to products  │  │ 3 products   │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

- **Internship**, **University**, and **Bootcamps** are completely separate tracks
- No product enrollment gates another product
- SSO allows seamless login across all products
- **Admin CMS** is on its own subdomain — manages all 3 products from one interface

---

## Key Metrics Summary

| Metric | University | Bootcamps | Internship |
|--------|-----------|-----------|------------|
| **Price model** | Subscription | One-time | One-time (form) |
| **Duration** | 4 years | Self-paced | 3 months |
| **Assessment** | Quiz + Exam per semester | None | One-time exam |
| **Certificate** | Yes | Yes | Yes + Placement |
| **Departments** | 8+ | N/A | N/A |
| **Cohorts** | Continuous | Continuous | Quarterly |

---

## See Also

- [Internship Product](../internship/00-overview.md)
- [University Product](../university/00-overview.md)
- [Bootcamps Product](../bootcamps/00-overview.md)
- [Shared Auth](./02-auth-sso.md)
- [Shared Payments](./03-payments.md)
- [Shared Admin CMS](./04-admin-cms.md)
