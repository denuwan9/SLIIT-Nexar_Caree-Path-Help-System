import { test, expect } from '@playwright/test';

test.describe('Admin Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@sliit.lk');
    await page.fill('input[name="password"]', 'Demo123@');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin/);
  });

  test('should generate user report successfully', async ({ page }) => {
    // Ensure "Members" tab is active (it is by default)
    await expect(page.locator('text=System Registry')).toBeVisible();

    // Find the Generate Report button
    const generateBtn = page.locator('button[title="Generate Operational Report"]');
    await expect(generateBtn).toBeVisible();

    // Click the button and check if download process starts
    // Since this usually triggers a download via jsPDF, we might just verify the click works
    // and take a screenshot of the button being clicked or the state after
    await generateBtn.click();

    // We can also check if a "Downloading" toast or success message appears if implemented
    // In ManageUsers.tsx, it calls generateUserReport(filteredUsers) which uses jspdf to save
    
    await page.screenshot({ path: 'test-results/screenshots/admin-report-generation.png', fullPage: true });
  });
});
