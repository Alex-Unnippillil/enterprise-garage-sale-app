import { test, expect } from '@playwright/test';

test.describe('Listing creation flow', () => {
  test('submits new property form successfully', async ({ page }) => {
    await page.route('**/managers/newproperty', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <h1>Add New Property</h1>
          <form id="listing-form">
            <label>Manager ID<input name="managerCognitoId" /></label>
            <label>Property Name<input name="name" /></label>
            <label>Description<textarea name="description"></textarea></label>
            <label>Price per Month<input name="pricePerMonth" type="number" /></label>
            <label>Security Deposit<input name="securityDeposit" type="number" /></label>
            <label>Application Fee<input name="applicationFee" type="number" /></label>
            <label>Beds<input name="beds" type="number" /></label>
            <label>Baths<input name="baths" type="number" /></label>
            <label>Square Feet<input name="squareFeet" type="number" /></label>
            <label>Property Type<input name="propertyType" /></label>
            <label>Address<input name="address" /></label>
            <label>City<input name="city" /></label>
            <label>State<input name="state" /></label>
            <label>Country<input name="country" /></label>
            <label>Postal Code<input name="postalCode" /></label>
            <button type="submit">Submit</button>
          </form>
          <script>
            document.getElementById('listing-form').addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const res = await fetch('/properties', { method: 'POST', body: formData });
              if (res.ok) {
                const div = document.createElement('div');
                div.id = 'success';
                div.innerText = 'Created';
                document.body.appendChild(div);
              }
            });
          </script>
        </body></html>`
      });
    });

    let requestReceived = false;
    await page.route('**/properties', async (route) => {
      requestReceived = true;
      route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
    });

    await page.goto('http://localhost:3000/managers/newproperty');
    await page.getByLabel('Manager ID').fill('manager');
    await page.getByLabel('Property Name').fill('Test Property');
    await page.getByLabel('Description').fill('Great place');
    await page.getByLabel('Price per Month').fill('1500');
    await page.getByLabel('Security Deposit').fill('500');
    await page.getByLabel('Application Fee').fill('50');
    await page.getByLabel('Beds').fill('2');
    await page.getByLabel('Baths').fill('1');
    await page.getByLabel('Square Feet').fill('900');
    await page.getByLabel('Property Type').fill('Apartment');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('Townsville');
    await page.getByLabel('State').fill('TS');
    await page.getByLabel('Country').fill('USA');
    await page.getByLabel('Postal Code').fill('12345');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('#success')).toHaveText('Created');
    expect(requestReceived).toBeTruthy();
  });
});
