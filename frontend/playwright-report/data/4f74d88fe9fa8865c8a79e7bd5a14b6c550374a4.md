# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile Management >> should edit profile details successfully
- Location: tests\profile.spec.ts:16:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to <button disabled type="submit" class="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center gap-2 ">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

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
      - generic [ref=e72]:
        - generic [ref=e73]:
          - button "Overview" [ref=e74]:
            - img [ref=e75]
            - text: Overview
          - button "Edit Info" [ref=e78]:
            - img [ref=e79]
            - text: Edit Info
          - button "Skills" [ref=e82]:
            - img [ref=e83]
            - text: Skills
          - button "Experience" [ref=e86]:
            - img [ref=e87]
            - text: Experience
          - button "Education" [ref=e90]:
            - img [ref=e91]
            - text: Education
          - button "Projects" [ref=e93]:
            - img [ref=e94]
            - text: Projects
          - button "Settings" [ref=e97]:
            - img [ref=e98]
            - text: Settings
        - generic [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - heading "Identity & Presence" [level=2] [ref=e105]
              - paragraph [ref=e106]: Update your professional identity and appearance.
            - generic [ref=e107]:
              - generic [ref=e108]:
                - img "Avatar" [ref=e110]
                - generic [ref=e112] [cursor=pointer]:
                  - img [ref=e113]
                  - generic [ref=e116]: Update
              - generic [ref=e117]:
                - heading "Professional Portrait" [level=3] [ref=e118]
                - paragraph [ref=e119]: A professional photo increases your profile visibility by 14x. Use a clear, high-resolution headshot.
                - generic [ref=e120]:
                  - generic [ref=e121] [cursor=pointer]: Upload New Photo
                  - generic [ref=e122]: Active Profile Image
          - generic [ref=e124]:
            - generic [ref=e125]:
              - heading "Core Information" [level=3] [ref=e127]
              - generic [ref=e128]:
                - generic [ref=e129]:
                  - generic [ref=e130]:
                    - text: First Name
                    - textbox "John" [ref=e131]: Denuwan
                  - generic [ref=e132]:
                    - text: Last Name
                    - textbox "Doe" [ref=e133]: Yasanga
                - generic [ref=e134]:
                  - text: Professional Headline
                  - textbox "e.g. Full Stack Developer | ML Enthusiast" [ref=e135]: Future Software Engineer | Playwright Enthusiast
                - generic [ref=e136]:
                  - text: About Me (Bio)
                  - textbox "Describe your journey, skills, and what drives you..." [ref=e137]: This is a test bio generated by automated Playwright tests to verify the profile update functionality.
            - generic [ref=e138]:
              - generic [ref=e139]:
                - heading "Academic Nexus" [level=3] [ref=e140]
                - paragraph [ref=e141]: Your current placement and academic trajectory.
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - text: University / Institution
                  - textbox "e.g. SLIIT" [ref=e144]: SLIIT
                - generic [ref=e145]:
                  - text: Faculty
                  - textbox "e.g. Computing" [ref=e146]: Computing
                - generic [ref=e147]:
                  - text: Major / Specialization
                  - textbox "e.g. Software Engineering" [ref=e148]: Information Technology
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - text: Year
                    - spinbutton [ref=e151]: "3"
                  - generic [ref=e152]:
                    - text: GPA
                    - spinbutton [ref=e153]: "3.25"
                  - generic [ref=e154]:
                    - text: Student ID
                    - textbox "ITXXXXXXXX" [ref=e155]: IT12345678
            - generic [ref=e156]:
              - generic [ref=e157]:
                - heading "Presence & Preferences" [level=3] [ref=e158]
                - paragraph [ref=e159]: Manage your visibility and professional status.
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - text: City
                  - textbox "Colombo" [active] [ref=e162]: Kandy
                - generic [ref=e163]:
                  - text: Country
                  - textbox "Sri Lanka" [ref=e164]
                - generic [ref=e165]:
                  - text: Contact Phone
                  - textbox "+94 7..." [ref=e166]: "+94758229351"
              - generic [ref=e167]:
                - generic [ref=e168] [cursor=pointer]:
                  - checkbox "Open to Opportunities" [checked] [ref=e170]
                  - generic [ref=e172]: Open to Opportunities
                - generic [ref=e173] [cursor=pointer]:
                  - checkbox "Public Profile Discovery" [checked] [ref=e175]
                  - generic [ref=e177]: Public Profile Discovery
            - generic [ref=e178]:
              - generic [ref=e179]:
                - paragraph [ref=e180]: Ready to sync updates?
                - paragraph [ref=e181]: Your profile will be re-analyzed by NEXAR AI upon saving.
              - button "Force Save Updates" [disabled] [ref=e182]:
                - img [ref=e183]
                - text: Force Save Updates
      - generic [ref=e187]:
        - generic [ref=e188]:
          - generic [ref=e189]:
            - heading "Completeness" [level=2] [ref=e190]
            - button [ref=e191]:
              - img [ref=e192]
          - generic [ref=e196]:
            - img [ref=e197]
            - generic [ref=e200]:
              - generic [ref=e201]: 100%
              - generic [ref=e202]: Profile Health
          - paragraph [ref=e203]: Your profile is fully optimized for top-tier career opportunities!
          - button "Optimize Profile" [ref=e204]
        - generic [ref=e206]:
          - generic [ref=e207]:
            - heading "Core Skills" [level=3] [ref=e208]
            - button [ref=e209]:
              - img [ref=e210]
          - generic [ref=e211]:
            - generic [ref=e213]:
              - generic [ref=e214]: React.js
              - generic [ref=e215]: advanced
            - generic [ref=e219]:
              - generic [ref=e220]: Node.js
              - generic [ref=e221]: intermediate
            - generic [ref=e225]:
              - generic [ref=e226]: MongoDB
              - generic [ref=e227]: intermediate
            - generic [ref=e231]:
              - generic [ref=e232]: Express.js
              - generic [ref=e233]: intermediate
          - button "Manage All Skills" [ref=e236]
        - generic [ref=e237]:
          - heading "Connect" [level=3] [ref=e238]
          - generic [ref=e239]:
            - generic [ref=e240] [cursor=pointer]:
              - img [ref=e242]
              - generic [ref=e245]:
                - generic [ref=e246]: Email Address
                - generic [ref=e247]: studentdemo123@sliit.lk
            - generic [ref=e248]:
              - img [ref=e250]
              - generic [ref=e253]:
                - generic [ref=e254]: Location
                - generic [ref=e255]: Kandy, Sri Lanka
            - link "LinkedIn View Professional Profile" [ref=e256] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/denuwan-yasanga-9a4442309/
              - img [ref=e258]
              - generic [ref=e262]:
                - generic [ref=e263]: LinkedIn
                - generic [ref=e264]:
                  - generic [ref=e265]: View Professional Profile
                  - img [ref=e266]
            - link "GitHub View Code Repos" [ref=e270] [cursor=pointer]:
              - /url: https://github.com/denuwan9
              - img [ref=e272]
              - generic [ref=e275]:
                - generic [ref=e276]: GitHub
                - generic [ref=e277]:
                  - generic [ref=e278]: View Code Repos
                  - img [ref=e279]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Profile Management', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login first
  6  |     await page.goto('/login');
  7  |     await page.fill('input[name="email"]', 'studentdemo123@sliit.lk');
  8  |     await page.fill('input[name="password"]', 'Demo123@');
  9  |     await page.click('button[type="submit"]');
  10 |     await expect(page).toHaveURL(/.*dashboard/);
  11 |     
  12 |     // Navigate to Profile
  13 |     await page.goto('/profile');
  14 |   });
  15 | 
  16 |   test('should edit profile details successfully', async ({ page }) => {
  17 |     // Click on Edit Info tab
  18 |     await page.click('button:has-text("Edit Info")');
  19 | 
  20 |     // Fill some details
  21 |     await page.fill('input[name="headline"]', 'Future Software Engineer | Playwright Enthusiast');
  22 |     await page.fill('textarea[name="bio"]', 'This is a test bio generated by automated Playwright tests to verify the profile update functionality.');
  23 |     
  24 |     // Changing location
  25 |     await page.fill('input[name="location.city"]', 'Kandy');
  26 |     
  27 |     // Click Save
> 28 |     await page.click('button[type="submit"]');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  29 | 
  30 |     // Check for success toast or indicator
  31 |     // The EditInfoTab shows "Nexus Synced!" on the button itself or a toast
  32 |     await expect(page.locator('text=Profile saved successfully')).toBeVisible();
  33 | 
  34 |     await page.screenshot({ path: 'test-results/screenshots/profile-edit-success.png', fullPage: true });
  35 |   });
  36 | });
  37 | 
```