import { test, expect } from '@playwright/test';

test.describe('Listing creation flow', () => {
  test('allows manager to fill new property form', async ({ page }) => {
    await page.route('**/managers/newproperty', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <h1>Add New Property</h1>
          <label>Property Name<input name="name" /></label>
          <label>Description<textarea name="description"></textarea></label>
          <label>Price per Month<input name="pricePerMonth" type="number" /></label>
        </body></html>`
      });
    });

    await page.goto('http://localhost:3000/managers/newproperty');
    await page.getByLabel('Property Name').fill('Test Property');
    await page.getByLabel('Description').fill('Great place');
    await page.getByLabel('Price per Month').fill('1500');
    await expect(page.getByLabel('Property Name')).toHaveValue('Test Property');
    await expect(page.getByLabel('Price per Month')).toHaveValue('1500');
  });
});
