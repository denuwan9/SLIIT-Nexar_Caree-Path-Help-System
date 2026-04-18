import { test, expect } from '@playwright/test';

test.describe('AI Advisor Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'studentdemo123@sliit.lk');
    await page.fill('input[name="password"]', 'Demo123@');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Navigate to AI Advisor
    await page.goto('/advisor');
  });

  test('should interact with AI Advisor', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Input command"]');
    const sendButton = page.locator('button:has(svg.lucide-send)');

    // Ensure initial AI message is present
    await expect(page.getByText(/Ayubowan! I'm NEXAR/i)).toBeVisible();

    // Send a question
    const testMessage = 'What careers are best for a software engineer specializing in Cloud?';
    await chatInput.fill(testMessage);
    await sendButton.click();

    // Verify user message appears in chat
    await expect(page.locator(`text=${testMessage}`)).toBeVisible();

    // Wait for AI response (typing indicator will show and then disappear)
    // The thinking state also has bg-white, so we wait for the actual content
    const aiResponse = page.locator('div.bg-white.text-\\[\\#334155\\]').nth(1);
    await expect(aiResponse).toBeVisible({ timeout: 120000 }); 

    // Additional check to ensure it's not just the typing indicator
    await expect(aiResponse).not.toContainText('Analyzing');
    await expect(aiResponse).not.toContainText('Evaluating');
    await expect(aiResponse).not.toContainText('Synthesizing');

    await page.screenshot({ path: 'test-results/screenshots/ai-advisor-chat.png', fullPage: true });
  });
});
