import { test, expect } from '@playwright/test';

test.describe('Nexar AI Intelligence Features', () => {
    test.beforeEach(async ({ page }) => {
        // Shared Login Logic
        await page.goto('/login');
        await page.fill('input[name="email"]', 'studentdemo123@sliit.lk');
        await page.fill('input[name="password"]', 'Demo123@');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*dashboard/);
        
        // Navigate to Advisor Hub
        await page.goto('/advisor');
    });

    test('Skill Dashboard - Detailed Analytics', async ({ page }) => {
        // Switch to Skills Tab
        await page.click('button:has-text("Skill Dashboard")');
        
        // Wait for stats to load
        await expect(page.locator('text=Core Competencies')).toBeVisible({ timeout: 15000 });
        
        // Capture full page
        await page.screenshot({ path: 'test-results/screenshots/skill-dashboard-full.png', fullPage: true });
    });

    test('Career Simulator - Roadmap Generation', async ({ page }) => {
        // Switch to Simulator Tab
        await page.click('button:has-text("Career Simulator")');
        
        // Fill target role
        await page.fill('input[placeholder*="Target Executive Role"]', 'Senior Cloud Architect');
        await page.click('button:has-text("Simulate Trajectory")');
        
        // Extended wait for AI Roadmap Output
        await expect(page.locator('text=Professional Trajectory')).toBeVisible({ timeout: 180000 });
        
        // Capture full page (Roadmap is long)
        await page.screenshot({ path: 'test-results/screenshots/career-simulator-full.png', fullPage: true });
    });

    test('Skill Gap Analyzer - Competency Matrix', async ({ page }) => {
        // Switch to Skill Gap Tab
        await page.click('button:has-text("Skill Gap")');
        
        // Fill target role
        await page.fill('input[placeholder*="Machine Learning Engineer"]', 'Senior DevOps Engineer');
        await page.click('button:has-text("Identify Skill Gaps")');
        
        // Wait for results
        await expect(page.locator('text=Strategic Summary')).toBeVisible({ timeout: 180000 });
        
        // Capture full page
        await page.screenshot({ path: 'test-results/screenshots/skill-gap-full.png', fullPage: true });
    });

    test('Resume Check - ATS Simulation', async ({ page }) => {
        // Switch to Resume Tab
        await page.click('button:has-text("Resume Check")');
        
        // Fill role
        await page.fill('input[placeholder*="Principal Cloud Architect"]', 'Senior Software Engineer');
        
        // Manual input
        await page.click('button:has-text("Manual Buffer")');
        await page.fill('textarea[placeholder*="Input profile narrative"]', 'John Doe. Experienced Full-Stack Developer with 4 years in React, Node.js, and TypeScript. Lead developer for high-traffic enterprise solutions. Skilled in AWS (EC2, S3, Lambda), Docker, and CI/CD pipelines. Bachelor of Science in Information Technology from SLIIT.');
        
        // Trigger simulation
        await page.click('button:has-text("Simulate ATS Alignment")');
        
        // Wait for score
        await expect(page.locator('text=Match Index')).toBeVisible({ timeout: 180000 });
        
        // Capture full page
        await page.screenshot({ path: 'test-results/screenshots/resume-check-full.png', fullPage: true });
    });

    test('AI Advisor Chatbot - Deep Query', async ({ page }) => {
        // Default tab is chat
        const chatInput = page.locator('textarea[placeholder*="Input command"]');
        const sendButton = page.locator('button:has(svg.lucide-send)');

        // Send a simple query
        await chatInput.fill('Please provide a brief overview of my current career readiness.');
        await sendButton.click();

        // Wait for AI response (extended for deep thinking)
        // We wait for the second bubble that isn't thinking
        const aiResponse = page.locator('div.bg-white.text-\\[\\#334155\\]').nth(1);
        await expect(aiResponse).toBeVisible({ timeout: 180000 }); 
        await expect(aiResponse).not.toContainText('Analyzing', { timeout: 180000 });

        // Capture full page
        await page.screenshot({ path: 'test-results/screenshots/ai-advisor-chat-full.png', fullPage: true });
    });
});
