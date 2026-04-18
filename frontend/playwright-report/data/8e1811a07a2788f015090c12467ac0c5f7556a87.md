# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-features.spec.ts >> Nexar AI Intelligence Features >> AI Advisor Chatbot - Deep Query
- Location: tests\ai-features.spec.ts:78:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div.bg-white.text-\\[\\#334155\\]').nth(1)
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 180000ms
  - waiting for locator('div.bg-white.text-\\[\\#334155\\]').nth(1)

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - link "Nexar Logo" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - img "Nexar Logo" [ref=e7]
      - generic [ref=e8]: Menu
      - navigation [ref=e9]:
        - link "Dashboard" [ref=e10] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e11]
          - generic [ref=e16]: Dashboard
        - link "Profile" [ref=e17] [cursor=pointer]:
          - /url: /profile
          - img [ref=e18]
          - generic [ref=e21]: Profile
        - link "AI Advisor" [ref=e22] [cursor=pointer]:
          - /url: /advisor
          - img [ref=e23]
          - generic [ref=e26]: AI Advisor
        - link "Interviews" [ref=e27] [cursor=pointer]:
          - /url: /interviews
          - img [ref=e28]
          - generic [ref=e30]: Interviews
        - link "Study" [ref=e31] [cursor=pointer]:
          - /url: /study
          - img [ref=e32]
          - generic [ref=e34]: Study
        - link "Job Posts" [ref=e35] [cursor=pointer]:
          - /url: /job-postings
          - img [ref=e36]
          - generic [ref=e39]: Job Posts
        - link "Mock Interview" [ref=e40] [cursor=pointer]:
          - /url: /mock-interview
          - img [ref=e41]
          - generic [ref=e44]: Mock Interview
      - generic [ref=e45]:
        - link "Settings" [ref=e46] [cursor=pointer]:
          - /url: /settings
          - img [ref=e47]
          - generic [ref=e50]: Settings
        - button "Logout" [ref=e51]:
          - img [ref=e52]
          - generic [ref=e55]: Logout
  - main [ref=e56]:
    - generic [ref=e58]:
      - button [ref=e59]:
        - img [ref=e61]
      - generic [ref=e63] [cursor=pointer]:
        - img "Avatar" [ref=e64]
        - generic [ref=e65]:
          - generic [ref=e66]: Student Demo
          - generic [ref=e67]: Student
    - generic [ref=e71]:
      - generic [ref=e73]:
        - generic [ref=e74]:
          - img [ref=e76]
          - generic [ref=e79]:
            - heading "Nexar AI Intelligence" [level=1] [ref=e80]
            - paragraph [ref=e83]: Enterprise Grok-1.5 Layer — Sync Active
        - paragraph [ref=e84]: Chat with your personal AI career mentor. Our AI benchmarks your profile against global standards to provide hyper-personalised career strategy.
      - generic [ref=e86]:
        - button "AI Advisor" [ref=e87]:
          - img [ref=e88]
          - generic [ref=e91]: AI Advisor
        - button "Skill Dashboard" [ref=e92]:
          - img [ref=e93]
          - generic [ref=e94]: Skill Dashboard
        - button "Career Simulator" [ref=e95]:
          - img [ref=e96]
          - generic [ref=e101]: Career Simulator
        - button "Skill Gap" [ref=e102]:
          - img [ref=e103]
          - generic [ref=e107]: Skill Gap
        - button "Resume Check" [ref=e108]:
          - img [ref=e109]
          - generic [ref=e112]: Resume Check
      - generic [ref=e114]:
        - generic [ref=e115]:
          - generic [ref=e116]:
            - img [ref=e119]
            - generic [ref=e123]:
              - paragraph [ref=e124]: NEXAR Intelligence
              - generic [ref=e126]: Live — Deep Context Active
          - button "Reset Session" [ref=e127]:
            - img [ref=e128]
        - generic [ref=e131]:
          - generic [ref=e132]:
            - generic [ref=e133]:
              - img [ref=e135]
              - generic [ref=e139]:
                - paragraph [ref=e140]:
                  - text: 👋
                  - strong [ref=e141]: Ayubowan! I'm NEXAR, your enterprise AI Career Strategist.
                - paragraph [ref=e142]: I've integrated your full analytical student profile. We're ready to execute high-impact career planning based on real-time market data.
                - paragraph [ref=e143]:
                  - emphasis [ref=e144]: What strategic objective shall we address today?
            - generic [ref=e145]:
              - img [ref=e147]
              - paragraph [ref=e151]: Please provide a brief overview of my current career readiness.
          - generic [ref=e152]:
            - img [ref=e154]
            - paragraph [ref=e162]: Evaluating Skill Dominance...
        - generic [ref=e163]:
          - generic [ref=e164]:
            - textbox "Input command or query student dataset..." [disabled] [ref=e166]
            - button [disabled] [ref=e167]:
              - img [ref=e168]
          - paragraph [ref=e172]:
            - img [ref=e173]
            - text: Professional-Grade Advisory
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Nexar AI Intelligence Features', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         // Shared Login Logic
  6  |         await page.goto('/login');
  7  |         await page.fill('input[name="email"]', 'studentdemo123@sliit.lk');
  8  |         await page.fill('input[name="password"]', 'Demo123@');
  9  |         await page.click('button[type="submit"]');
  10 |         await expect(page).toHaveURL(/.*dashboard/);
  11 |         
  12 |         // Navigate to Advisor Hub
  13 |         await page.goto('/advisor');
  14 |     });
  15 | 
  16 |     test('Skill Dashboard - Detailed Analytics', async ({ page }) => {
  17 |         // Switch to Skills Tab
  18 |         await page.click('button:has-text("Skill Dashboard")');
  19 |         
  20 |         // Wait for stats to load
  21 |         await expect(page.locator('text=Core Competencies')).toBeVisible({ timeout: 15000 });
  22 |         
  23 |         // Capture full page
  24 |         await page.screenshot({ path: 'test-results/screenshots/skill-dashboard-full.png', fullPage: true });
  25 |     });
  26 | 
  27 |     test('Career Simulator - Roadmap Generation', async ({ page }) => {
  28 |         // Switch to Simulator Tab
  29 |         await page.click('button:has-text("Career Simulator")');
  30 |         
  31 |         // Fill target role
  32 |         await page.fill('input[placeholder*="Target Executive Role"]', 'Senior Cloud Architect');
  33 |         await page.click('button:has-text("Simulate Trajectory")');
  34 |         
  35 |         // Extended wait for AI Roadmap Output
  36 |         await expect(page.locator('text=Professional Trajectory')).toBeVisible({ timeout: 180000 });
  37 |         
  38 |         // Capture full page (Roadmap is long)
  39 |         await page.screenshot({ path: 'test-results/screenshots/career-simulator-full.png', fullPage: true });
  40 |     });
  41 | 
  42 |     test('Skill Gap Analyzer - Competency Matrix', async ({ page }) => {
  43 |         // Switch to Skill Gap Tab
  44 |         await page.click('button:has-text("Skill Gap")');
  45 |         
  46 |         // Fill target role
  47 |         await page.fill('input[placeholder*="Machine Learning Engineer"]', 'Senior DevOps Engineer');
  48 |         await page.click('button:has-text("Identify Skill Gaps")');
  49 |         
  50 |         // Wait for results
  51 |         await expect(page.locator('text=Strategic Summary')).toBeVisible({ timeout: 180000 });
  52 |         
  53 |         // Capture full page
  54 |         await page.screenshot({ path: 'test-results/screenshots/skill-gap-full.png', fullPage: true });
  55 |     });
  56 | 
  57 |     test('Resume Check - ATS Simulation', async ({ page }) => {
  58 |         // Switch to Resume Tab
  59 |         await page.click('button:has-text("Resume Check")');
  60 |         
  61 |         // Fill role
  62 |         await page.fill('input[placeholder*="Principal Cloud Architect"]', 'Senior Software Engineer');
  63 |         
  64 |         // Manual input
  65 |         await page.click('button:has-text("Manual Buffer")');
  66 |         await page.fill('textarea[placeholder*="Input profile narrative"]', 'John Doe. Experienced Full-Stack Developer with 4 years in React, Node.js, and TypeScript. Lead developer for high-traffic enterprise solutions. Skilled in AWS (EC2, S3, Lambda), Docker, and CI/CD pipelines. Bachelor of Science in Information Technology from SLIIT.');
  67 |         
  68 |         // Trigger simulation
  69 |         await page.click('button:has-text("Simulate ATS Alignment")');
  70 |         
  71 |         // Wait for score
  72 |         await expect(page.locator('text=Match Index')).toBeVisible({ timeout: 180000 });
  73 |         
  74 |         // Capture full page
  75 |         await page.screenshot({ path: 'test-results/screenshots/resume-check-full.png', fullPage: true });
  76 |     });
  77 | 
  78 |     test('AI Advisor Chatbot - Deep Query', async ({ page }) => {
  79 |         // Default tab is chat
  80 |         const chatInput = page.locator('textarea[placeholder*="Input command"]');
  81 |         const sendButton = page.locator('button:has(svg.lucide-send)');
  82 | 
  83 |         // Send a simple query
  84 |         await chatInput.fill('Please provide a brief overview of my current career readiness.');
  85 |         await sendButton.click();
  86 | 
  87 |         // Wait for AI response (extended for deep thinking)
  88 |         // We wait for the second bubble that isn't thinking
  89 |         const aiResponse = page.locator('div.bg-white.text-\\[\\#334155\\]').nth(1);
> 90 |         await expect(aiResponse).toBeVisible({ timeout: 180000 }); 
     |                                  ^ Error: expect(locator).toBeVisible() failed
  91 |         await expect(aiResponse).not.toContainText('Analyzing', { timeout: 180000 });
  92 | 
  93 |         // Capture full page
  94 |         await page.screenshot({ path: 'test-results/screenshots/ai-advisor-chat-full.png', fullPage: true });
  95 |     });
  96 | });
  97 | 
```