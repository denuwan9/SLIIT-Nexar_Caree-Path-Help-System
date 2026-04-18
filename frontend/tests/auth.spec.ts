import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully as Student', async ({ page }) => {
    await page.fill('input[name="email"]', 'studentdemo123@sliit.lk');
    await page.fill('input[name="password"]', 'Demo123@');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await page.screenshot({ path: 'test-results/screenshots/student-login-success.png', fullPage: true });
  });

  test('should login successfully as Admin', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@sliit.lk');
    await page.fill('input[name="password"]', 'Demo123@');
    await page.click('button[type="submit"]');

    // Should redirect to admin command center
    await expect(page).toHaveURL(/.*admin/);
    await page.screenshot({ path: 'test-results/screenshots/admin-login-success.png', fullPage: true });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@sliit.lk');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Check for error message in toast or on-screen
    // The AuthModule shows error message in a div if authError is set
    const errorAlert = page.locator('div.text-red-600');
    await expect(errorAlert).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/login-failure.png', fullPage: true });
  });
});
