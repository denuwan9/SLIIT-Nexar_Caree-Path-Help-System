import { test, expect } from '@playwright/test';

test('student creates a job post and admin filters/analyzes it', async ({ page }) => {
  test.setTimeout(60000);

  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss().catch(() => {});
  });

  // Student login
  await page.goto('http://localhost:5173/login');

  await page.getByRole('textbox', { name: 'student@my.sliit.lk or staff@' }).fill('studentdemo123@sliit.lk');
  await page.getByRole('textbox', { name: '••••••••' }).fill('Demo123@');
  await page.getByRole('button', { name: 'Login to Nexar' }).click();
  await page.waitForLoadState('networkidle');

  // Go to Job Posts
  await page.getByRole('link', { name: 'Job Posts' }).click();
  await page.waitForLoadState('networkidle');

  // Create job post
  await page.getByRole('button', { name: 'Create Job Post' }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Auto-Fill' }).click();

  await page.getByRole('textbox', { name: 'Job title' }).fill('Software Engineer');
  await page.getByRole('textbox', { name: 'Target role (e.g. Frontend' }).fill('sof');

  // Select suggestion from dropdown
  const suggestion = page.getByText('Software Engineer', { exact: true }).first();
  await expect(suggestion).toBeVisible({ timeout: 10000 });
  await suggestion.click();

  // Publish job post
  const publishButton = page.getByRole('button', { name: 'Publish Job Post' });
  await publishButton.scrollIntoViewIfNeeded();
  await expect(publishButton).toBeVisible();
  await expect(publishButton).toBeEnabled();
  await publishButton.click();

  await page.waitForLoadState('networkidle');

  // View applicants popup
  const viewApplicantsButton = page.getByRole('button', { name: 'View applicants' }).first();
  await expect(viewApplicantsButton).toBeVisible({ timeout: 10000 });
  await viewApplicantsButton.click();

  const closeButton = page.getByRole('button', { name: '✕' });
  await expect(closeButton).toBeVisible({ timeout: 10000 });
  await closeButton.click();

  // Logout student
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForLoadState('networkidle');

  // Admin login
  await page.getByRole('textbox', { name: 'student@my.sliit.lk or staff@' }).fill('admin@sliit.lk');
  await page.getByRole('textbox', { name: '••••••••' }).fill('Demo123@');
  await page.getByRole('button', { name: 'Login to Nexar' }).click();
  await page.waitForLoadState('networkidle');

  // Job Posts page
  await page.getByRole('link', { name: 'Job Posts' }).click();
  await page.waitForLoadState('networkidle');

  // Search post
  const searchBox = page.getByRole('textbox', { name: 'Search posts...' });
  await expect(searchBox).toBeVisible({ timeout: 10000 });
  await searchBox.fill('Software Engineer');

  // Role filter
  await page.getByRole('button', { name: 'Role' }).click();
  const roleSearch = page.getByRole('textbox', { name: 'Search by role...' });
  await expect(roleSearch).toBeVisible({ timeout: 10000 });
  await roleSearch.fill('Software Engineer');
  await page.getByRole('list').getByText('Software Engineer', { exact: true }).click();

  // AI filter
  await page.getByRole('button', { name: '🤖 AI Filter' }).click();
  const aiBox = page.getByRole('textbox', { name: 'Example: Show me the best' });
  await expect(aiBox).toBeVisible({ timeout: 10000 });
  await aiBox.fill('give me the best software engineers');

  await page.getByRole('button', { name: 'Analyze' }).click();
  await page.waitForLoadState('networkidle');

  // Wait for job card to appear, but do not click the title text
  const jobCardText = page.getByText('Software Engineer', { exact: true }).first();
  await expect(jobCardText).toBeVisible({ timeout: 10000 });

  // Try to click the actual action button if it appears
  const applyButton = page.getByRole('button', { name: /Interested/i });

  if (await applyButton.isVisible().catch(() => false)) {
    await applyButton.scrollIntoViewIfNeeded();
    await expect(applyButton).toBeEnabled();
    await applyButton.click();
    await page.waitForLoadState('networkidle');
  }
});