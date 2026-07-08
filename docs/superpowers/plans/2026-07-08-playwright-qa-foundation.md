# Playwright QA Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a beginner-friendly Playwright foundation so Aorthar can run browser smoke tests locally and in CI.

**Architecture:** Playwright will live beside the existing Vitest suite instead of replacing it. Vitest remains responsible for unit and API behavior, while Playwright covers critical browser paths that prove the app renders and basic routes work from a user's point of view.

**Tech Stack:** Bun, Next.js 16, TypeScript, Vitest, Playwright, GitHub Actions.

## Global Constraints

- Use `bun`, not `npm` or `pnpm`.
- Keep `bun run build` as the primary correctness gate.
- Keep tests readable for a manual QA learner converting manual cases into automation.
- Use the existing QA matrix at `docs/qa/test_cases.md` as the test-case source of truth.
- Do not depend on real Paystack payment completion, real emails, or production data in smoke tests.

---

## File Structure

- Modify: `package.json` — add Playwright scripts.
- Create: `playwright.config.ts` — configure local dev server, browsers, traces, screenshots, and test directory.
- Create: `e2e/smoke/public-pages.spec.ts` — first browser smoke tests for public routes.
- Create: `docs/qa/automation.md` — explain how manual QA maps to automated tests.
- Modify: `docs/README.md` — fix the QA test-case link and add the automation guide.
- Create: `.github/workflows/qa.yml` — run lint, Vitest, build, and Playwright on pull requests after the local setup is proven.

## Task 1: Install And Configure Playwright

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: Existing `bun run dev`, `bun run build`, `bun run test`, and `bun run lint` scripts.
- Produces: `bun run test:e2e`, `bun run test:e2e:ui`, and `bun run test:e2e:report`.

- [ ] **Step 1: Install Playwright**

Run:

```bash
bun add -d @playwright/test
bunx playwright install chromium
```

Expected: `package.json` and `bun.lock` include `@playwright/test`; Chromium browser dependencies are available locally.

- [ ] **Step 2: Add Playwright scripts**

Update `package.json` scripts to include:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

Expected: `bun run test:e2e` starts Playwright.

- [ ] **Step 3: Create `playwright.config.ts`**

Create:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Expected: Playwright can start the Next.js dev server and run tests against `localhost:3000`.

- [ ] **Step 4: Verify the empty setup**

Run:

```bash
bun run test:e2e
```

Expected: Playwright reports that no tests were found. This confirms the runner is installed before adding specs.

## Task 2: Add First Public Smoke Tests

**Files:**
- Create: `e2e/smoke/public-pages.spec.ts`

**Interfaces:**
- Consumes: `playwright.config.ts` base URL.
- Produces: Beginner-friendly route smoke tests that can be expanded from `docs/qa/test_cases.md`.

- [ ] **Step 1: Create the smoke spec**

Create:

```ts
import { expect, test } from '@playwright/test';

const publicRoutes: Array<{ name: string; path: string; heading: RegExp }> = [
  { name: 'Marketing home', path: '/', heading: /Aorthar/i },
  { name: 'University landing', path: '/university', heading: /University/i },
  { name: 'Internship landing', path: '/internship', heading: /Internship/i },
  { name: 'Bootcamp catalog', path: '/courses-app', heading: /courses|bootcamp/i },
];

test.describe('SMOKE: public pages', () => {
  for (const route of publicRoutes) {
    test(`${route.name} loads`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page).toHaveTitle(/Aorthar/i);
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    });
  }
});
```

Expected: Tests describe user-visible behavior, not implementation details.

- [ ] **Step 2: Run the smoke tests**

Run:

```bash
bun run test:e2e
```

Expected: The public route tests pass or reveal route/title mismatches that should be fixed in the test or app.

- [ ] **Step 3: Inspect the report**

Run:

```bash
bun run test:e2e:report
```

Expected: Playwright opens an HTML report showing passed or failed test steps.

## Task 3: Add QA Learning Documentation

**Files:**
- Create: `docs/qa/automation.md`
- Modify: `docs/README.md`

**Interfaces:**
- Consumes: Existing `docs/qa/test_cases.md`.
- Produces: A learning guide for converting manual QA cases to automation.

- [ ] **Step 1: Create automation guide**

Create `docs/qa/automation.md`:

```md
# QA Automation Guide

This guide explains how Aorthar manual QA cases become automated tests.

## Test Layers

- `bun run lint` catches style and static-code problems.
- `bun run test` runs Vitest unit and API/integration tests.
- `bun run build` catches TypeScript, routing, and production-build issues.
- `bun run test:e2e` runs Playwright browser smoke tests.

## Manual Case To Automated Test

Manual QA case:

```txt
SC-01: Browse published courses
1. Visit /courses-app
2. Confirm published courses are visible
```

Automated Playwright shape:

```ts
test('SC-01: browse published courses', async ({ page }) => {
  await page.goto('/courses-app');
  await expect(page.getByRole('heading', { name: /courses|bootcamp/i }).first()).toBeVisible();
});
```

## Local Commands

```bash
bun run test:e2e
bun run test:e2e:ui
bun run test:e2e:report
```

## Debugging Rule

When a Playwright test fails, inspect the error, screenshot, and trace before changing code. Fix the app if the user flow is broken. Fix the test if the expectation no longer matches the intended product behavior.
```

Expected: A manual tester can understand what each automation command does.

- [ ] **Step 2: Fix QA links in docs index**

Update `docs/README.md` QA section to link to:

```md
- [Test Cases](./qa/test_cases.md) — detailed manual test cases + regression scenarios
- [Automation Guide](./qa/automation.md) — how manual QA maps to automated tests
```

Expected: Documentation links resolve.

## Task 4: Add CI Gate

**Files:**
- Create: `.github/workflows/qa.yml`

**Interfaces:**
- Consumes: `package.json` scripts.
- Produces: Pull request QA gate.

- [ ] **Step 1: Create GitHub Actions workflow**

Create:

```yaml
name: QA

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  qa:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.10

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Playwright Chromium
        run: bunx playwright install --with-deps chromium

      - name: Lint
        run: bun run lint

      - name: Unit and integration tests
        run: bun run test

      - name: Build
        run: bun run build

      - name: Browser smoke tests
        run: bun run test:e2e
```

Expected: PRs run the same quality gates a developer runs locally.

## Task 5: Final Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: All tasks above.
- Produces: Verified QA foundation.

- [ ] **Step 1: Run static and unit gates**

Run:

```bash
bun run lint
bun run test
bun run build
```

Expected: All commands pass.

- [ ] **Step 2: Run browser smoke gate**

Run:

```bash
bun run test:e2e
```

Expected: Playwright smoke tests pass.

- [ ] **Step 3: Review changed files**

Run:

```bash
git diff -- package.json bun.lock playwright.config.ts e2e docs .github
```

Expected: Diff only contains Playwright setup, QA docs, and CI workflow.

## Self-Review

- Spec coverage: The plan covers installation, first browser smoke tests, QA learning docs, CI, and verification.
- Placeholder scan: No placeholders remain.
- Type consistency: `test:e2e`, `test:e2e:ui`, and `test:e2e:report` are consistently named across package scripts and docs.
