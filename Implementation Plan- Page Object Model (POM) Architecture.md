# Implementation Plan: Page Object Model (POM) Architecture

This plan describes how we will structure Page Object Model (POM) classes and integrate custom fixtures in Playwright to keep tests clean, modular, and maintainable.

---

## User Review Required

> [!IMPORTANT]
> - We will create a `pages/` directory to store Page Objects representing your application views.
> - We will create a custom test fixture in `fixtures/my-fixtures.ts` to automatically instantiate these Page Objects. This is the industry-standard Playwright method, avoiding the boilerplate of repeating `new LoginPage(page)` in every test.

---

## Proposed Changes

### Directory Structure
We will introduce the following folders and files:
```text
cms-playwright/
├── pages/
│   ├── BasePage.ts           # Shared page utilities and base class
│   └── LoginPage.ts          # Page Object representing login + OTP verification
├── fixtures/
│   └── my-fixtures.ts        # Custom Playwright test runner fixture
└── tests/
    └── login.spec.ts         # Updated login test using the new POM + fixture structure
```

---

### Component Specifications

#### [NEW] [pages/BasePage.ts](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/pages/BasePage.ts)
A base class containing the `page` reference and shared helper utilities (e.g., explicit wait wrappers, finding elements, generic assertions).

#### [NEW] [pages/LoginPage.ts](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/pages/LoginPage.ts)
The login Page Object representing the dynamic login flow.
It will contain:
* Locators for: Mobile Number field, Password field, Login/Submit button, OTP text field, Verify OTP button.
* Methods:
  * `navigate()`: Navigates to `/`.
  * `enterCredentials(mobile, password)`: Fills in credentials and clicks submit.
  * `enterOTP(otpCode)`: Fills in the OTP code and clicks verify.
  * `loginWorkflow(mobile, password)`: Executes the full flow, retrieving the OTP dynamically using the Redis utility.

#### [NEW] [fixtures/my-fixtures.ts](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/fixtures/my-fixtures.ts)
A custom test fixture extending `@playwright/test`.
* It defines and pre-loads your page instances (e.g., `loginPage`) automatically.
* Inside tests, you can just import `test` from this fixture and directly use `{ loginPage }` in your arguments.

#### [MODIFY] [tests/login.spec.ts](file:///Users/maddipatiravindranath/Desktop/Automations/cms-playwright/tests/login.spec.ts)
Update our test to use the new fixture:
```typescript
import { test } from '../fixtures/my-fixtures';

test('Successful login test using POM', async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.loginWorkflow(
    process.env.LOGIN_NUMBER || '123456789',
    process.env.PASSWORD || '3949294939'
  );
});
```

---

## Verification Plan

### Automated Tests
1. Run the test suite:
   ```bash
   npx playwright test tests/login.spec.ts
   ```
2. Verify that compilation succeeds and the logs show navigation, credentials entry, and the Redis OTP query being initiated correctly.
