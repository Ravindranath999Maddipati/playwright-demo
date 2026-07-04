import { test as base } from '@playwright/test';
import { LoginPage } from 'pages/LoginPage';

// Define the fixture types
type MyFixtures = {
  loginPage: LoginPage;
  loggedInPage: LoginPage;
};

// Extend base test to include the custom page object fixtures
export const test = base.extend<MyFixtures>({

  // ── loginPage ──────────────────────────────────────────────────────────
  // Navigates to the login page ONLY. Does NOT log in.
  // Used by: login.spec.ts (which tests the login flow itself)
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  // ── loggedInPage ───────────────────────────────────────────────────────
  // Navigates to the login page AND performs a full login workflow.
  // Used by: company.spec.ts, client.spec.ts, users.spec.ts, admin.spec.ts, etc.
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    const mobile = process.env.LOGIN_NUMBER || '123456789';
    const password = process.env.PASSWORD;
    await loginPage.loginWorkflow(mobile, password);
    await loginPage.expectSuccessfulLogin();

    // Pass the authenticated LoginPage instance to the test
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
