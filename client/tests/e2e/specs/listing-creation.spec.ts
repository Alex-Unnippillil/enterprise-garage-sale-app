import { test, expect } from '@playwright/test';

test.describe('Listing creation flow', () => {
  test('creates a new listing via the form', async ({ page }) => {
    const listings: any[] = [];

    await page.route('**/properties*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(listings),
        });
      } else if (method === 'POST') {
        const newListing = {
          id: 1,
          name: 'Test Property',
          description: 'Nice place',
          pricePerMonth: 1200,
        };
        listings.push(newListing);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newListing),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/listings');
    await page.getByLabel('Manager ID').fill('manager-1');
    await page.getByLabel('Property Name').fill('Test Property');
    await page.getByLabel('Description').fill('Nice place');
    await page.getByLabel('Price per Month').fill('1200');
    await page.getByLabel('Security Deposit').fill('600');
    await page.getByLabel('Application Fee').fill('100');
    await page.getByLabel('Beds').fill('3');
    await page.getByLabel('Baths').fill('2');
    await page.getByLabel('Square Feet').fill('1500');
    await page.getByLabel('Property Type').fill('House');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('Metropolis');
    await page.getByLabel('State').fill('CA');
    await page.getByLabel('Country').fill('USA');
    await page.getByLabel('Postal Code').fill('90210');
    await page.getByRole('button', { name: 'Submit' }).click({ force: true });

    await expect(page.getByText('Test Property')).toBeVisible();
    await expect(page.getByText('$1200')).toBeVisible();
  });
});
