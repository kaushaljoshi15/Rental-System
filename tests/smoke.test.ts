import { test, expect } from '@playwright/test';

test('has title and loads successfully', async ({ page }) => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  
  // Navigate to landing page
  await page.goto(baseUrl);

  // Expect title to contain RentKart or Rental
  await expect(page).toHaveTitle(/RentKart|Rental/i);
});
