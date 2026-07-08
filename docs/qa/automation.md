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

Run all browser tests:

```bash
bun run test:e2e
```

Open the visual Playwright runner:

```bash
bun run test:e2e:ui
```

Open the latest HTML report:

```bash
bun run test:e2e:report
```

Run one file:

```bash
bun run test:e2e -- e2e/smoke/public-pages.spec.ts
```

## Debugging Rule

When a Playwright test fails, inspect the error, screenshot, and trace before changing code. Fix the app if the user flow is broken. Fix the test if the expectation no longer matches the intended product behavior.
