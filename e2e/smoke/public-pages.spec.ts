import { expect, test } from '@playwright/test';

const publicRoutes: Array<{ name: string; path: string; heading: RegExp }> = [
  { name: 'Marketing home', path: '/', heading: /Aorthar/i },
  { name: 'University landing', path: '/university', heading: /University/i },
  { name: 'Internship landing', path: '/internship', heading: /Internship/i },
  { name: 'Bootcamp catalog', path: '/courses-app', heading: /learn product at your own pace/i },
];

test.describe('SMOKE: public pages', () => {
  for (const route of publicRoutes) {
    test(`${route.name} loads`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      await expect(page).toHaveTitle(/Aorthar/i);
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    });
  }
});
