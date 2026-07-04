import { test, expect } from '../fixtures/my-fixtures';

/**
 * Login Test Suite for CMS - CSMS Statiq
 *
 * Each test is fully independent.
 * Navigation is handled automatically by the fixture (my-fixtures.ts).
 * No beforeEach needed here.
 *
 * Tests Covered:
 *  TC_LOGIN_01 - Successful Login
 *  TC_LOGIN_02 - Unregistered Phone Number
 *  TC_LOGIN_03 - Incorrect Password
 *  TC_LOGIN_04 - Invalid OTP
 */
test.describe('CMS Login - Authentication Tests', () => {

    // ─────────────────────────────────────────────────────────────────────────
    // Test 1: Successful Login
    // ─────────────────────────────────────────────────────────────────────────
    test('TC_LOGIN_01 - Successful login with valid credentials', async ({ loginPage }) => {
        const mobile = process.env.LOGIN_NUMBER || '123456789';
        console.log(`enve mobile number: ${mobile}`);
        const password = process.env.PASSWORD;

        // Enter valid credentials, fetch OTP from Redis & verify
        await loginPage.loginWorkflow(mobile, password);

        // Assert: User redirected to Dashboard Insights page
        await loginPage.expectSuccessfulLogin();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Test 2: Unregistered Phone Number
    // ─────────────────────────────────────────────────────────────────────────
    test('TC_LOGIN_02 - Show error for unregistered phone number', async ({ loginPage }) => {
        const unregisteredMobile = '9588999995'; // A number not registered in CMS
        const password = process.env.PASSWORD;

        // Enter unregistered mobile & click Sign In
        await loginPage.enterCredentials(unregisteredMobile, password);

        // Assert: "Phone number is not registered. Please contact support."
        await loginPage.expectUnregisteredPhoneError();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: Incorrect Password
    // ─────────────────────────────────────────────────────────────────────────
    test('TC_LOGIN_03 - Show error for incorrect password', async ({ loginPage }) => {
        const mobile = process.env.LOGIN_NUMBER || '123456789';
        const wrongPassword = 'wrongpassword@999'; // Intentionally wrong

        // Enter valid mobile but wrong password, click Sign In
        await loginPage.enterCredentials(mobile, wrongPassword);

        // Assert: "Wrong Password"
        await loginPage.expectWrongPasswordError();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Invalid OTP
    // ─────────────────────────────────────────────────────────────────────────
    test('TC_LOGIN_04 - Show error for invalid OTP', async ({ loginPage }) => {
        const mobile = process.env.LOGIN_NUMBER || '123456789';
        const password = process.env.PASSWORD;
        const invalidOTP = '111111'; // Intentionally wrong OTP

        // Step 1: Enter valid credentials to reach OTP screen
        await loginPage.enterCredentials(mobile, password);

        // Step 2: Enter wrong OTP and click Verify
        await loginPage.enterOTP(invalidOTP);

        // Assert: "Invalid OTP or otp expired"
        await loginPage.expectInvalidOTPError();
    });

});
