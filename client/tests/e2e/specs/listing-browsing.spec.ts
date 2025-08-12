import { test, expect } from '@playwright/test';

test.describe('Listing browsing flow', () => {
  test('shows properties from API on listings page', async ({ page }) => {
    await page.route('**/properties*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              name: 'Sample Property',
              description: 'Nice place',
              pricePerMonth: 1500,
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/listings');
    await expect(page.getByText('Sample Property')).toBeVisible();
    await expect(page.getByText('$1500')).toBeVisible();
  });
});
