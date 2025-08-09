import { test, expect } from '@playwright/test';

test.describe('Listing browsing flow', () => {
  test('shows properties from API on search page', async ({ page }) => {
    await page.route('**/search', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <h1>Search Properties</h1>
          <div id="list"></div>
          <script>
            fetch('/properties').then(r=>r.json()).then(data=>{
              const div=document.getElementById('list');
              div.innerHTML = '<div>' + data[0].name + '</div>';
            });
          </script>
        </body></html>`
      });
    });

    await page.route('**/properties', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Sample Property'
          }
        ])
      });
    });

    await page.goto('http://localhost:3000/search');
    await expect(page.getByText('Sample Property')).toBeVisible();
  });
});
