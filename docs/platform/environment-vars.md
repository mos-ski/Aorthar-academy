# Environment Variables Reference

**Last Updated:** 2026-04-03

---

## Overview

Complete reference for all environment variables used across the Aorthar Academy codebase.

---

## Required Variables

### Supabase

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJ...` |

### Paystack

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYSTACK_SECRET_KEY` | Paystack secret key (server-only) | `sk_live_...` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (server-only) | `pk_live_...` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key (client) | `pk_live_...` |

### Resend

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key (server-only) | `re_...` |

### App Configuration

| Variable | Description | Values | Required |
|----------|-------------|--------|----------|
| `NEXT_PUBLIC_APP_ENV` | Application environment | `development` / `staging` / `production` | Yes |

---

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Site URL for email links | `http://localhost:3000` |
| `NODE_ENV` | Node environment | `development` |

---

## Environment-Specific Configuration

### Development (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_ENV=development
```

### Staging

Same as development but with staging Supabase project and Paystack test keys.

```
NEXT_PUBLIC_APP_ENV=staging
```

### Production

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_ENV=production
```

---

## What Each Product Uses

| Product | Services Used |
|---------|---------------|
| **Internship** | Supabase, Paystack, Resend |
| **University** | Supabase, Paystack, Resend, Gemini |
| **Bootcamps** | Supabase, Paystack, Resend |

---

## Security Notes

1. **Never commit `.env.local`** — it's in `.gitignore`
2. **Service role key is server-only** — never expose to client
3. **Paystack secret key is server-only** — never expose to client
4. **Use test keys in development** — `sk_test_` / `pk_test_`
5. **Use live keys in production** — `sk_live_` / `pk_live_`
6. **Rotate keys regularly** — especially service role and Paystack secret

---

## Vercel Deployment

Set environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Set `NEXT_PUBLIC_APP_ENV=production` for production
4. Redeploy after adding/changing variables

For preview deployments, use staging environment variables.
