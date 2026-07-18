import { expect, test } from '@playwright/test';

const protectedRoutes: Array<{ name: string; path: string }> = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Capstone', path: '/capstone' },
];

test.describe('SMOKE: auth guards', () => {
  for (const route of protectedRoutes) {
    test(`${route.name} redirects guests to login`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(route.path)}`));
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });
  }
});

test('Admin path redirects to the admin subdomain', async ({ request }) => {
  const response = await request.get('/admin', { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe('https://admin.aorthar.com/admin');
});
