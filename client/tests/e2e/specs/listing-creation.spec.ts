import { test, expect } from '@playwright/test';

test.describe('Listing creation flow', () => {
  test('allows manager to fill new property form', async ({ page }) => {
    await page.route('**/properties*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '[]',
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: '{}',
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/listings');

    await page.getByLabel('Property Name').fill('Test Property');
    await page.getByLabel('Description').fill('Great place');
    await page.getByLabel('Price per Month').fill('1500');

    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        req.url().includes('/properties') && req.method() === 'POST'
      ),
      page.getByRole('button', { name: 'Submit' }).click(),
    ]);
    expect(request.postDataJSON()).toEqual({
      name: 'Test Property',
      description: 'Great place',
      pricePerMonth: 1500,
    });
  });
});
