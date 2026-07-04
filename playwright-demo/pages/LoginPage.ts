import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from 'pages/BasePage';
import { getOTP } from 'utils/redis';

export class LoginPage extends BasePage {
    // Sign In Form Locators
    readonly mobileInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    // OTP Form Locators
    readonly otpDigitInputs: Locator;
    readonly verifyOtpButton: Locator;

    // Error Locators
    // Case: Phone number not registered OR Wrong password (MUI helper text)
    readonly muiErrorMessage: Locator;
    // Case: Invalid OTP
    readonly otpErrorMessage: Locator;

    constructor(page: Page) {
        super(page);

        // ── Sign In Form ──────────────────────────────────────────────────────────

        // getByPlaceholder → matches <input placeholder="Enter mobile number">
        // Preferred: placeholder text is user-visible and unlikely to change with styling refactors.
        //this.mobileInput = this.page.locator('input[name="phoneNumber"]');
        this.mobileInput = this.page.getByPlaceholder('Enter Phone Number');

        // getByPlaceholder → matches <input placeholder="Enter password">
        this.passwordInput = this.page.getByPlaceholder('Enter password');

        // getByRole → matches <button> with accessible name "Sign In"
        // Most resilient: works regardless of CSS class names or DOM structure.
        this.loginButton = this.page.getByRole('button', { name: 'Sign In' });

        // ── OTP Form ──────────────────────────────────────────────────────────────

        // getByRole → targets all <input> elements whose aria-label starts with "Please enter OTP character"
        // Falls back to CSS '.otp-view-input' if aria-label is not present on the inputs.
        // Preferred over class selectors because it validates accessibility too.
        //this.otpDigitInputs = this.page.getByRole('textbox', { name: /Please enter OTP character/i });
        this.otpDigitInputs = this.page.locator('.otp-view-input')

        // getByRole → matches <button> with accessible name "Verify"
        // Replaces the fragile class selector 'button.login_button' used on the OTP step.
        this.verifyOtpButton = this.page.getByRole('button', { name: 'Verify' });

        // ── Error Messages ────────────────────────────────────────────────────────

        // getByRole('alert') → MUI renders error helper text with role="alert" when Mui-error is active.
        // This is more semantic than targeting internal MUI CSS class names (.MuiFormHelperText-root.Mui-error)
        // which can change across MUI versions.
        this.muiErrorMessage = this.page.locator('.MuiFormHelperText-root.Mui-error')
        //this.muiErrorMessage = this.page.getByRole('alert');

        // getByText → matches the exact error paragraph text for OTP failures.
        // CSS fallback: this.page.locator('.helper_text_error')
        this.otpErrorMessage = this.page.getByText('Invalid OTP or otp expired');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Navigate to the login page.
     */
    async navigate() {
        await this.navigateTo('/');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Enter credentials and click Sign In to trigger OTP flow.
     */
    async enterCredentials(mobile: string, password?: string) {
        console.log(`[Login] Entering mobile number: ${mobile}`);
        await this.waitForVisible(this.mobileInput, 20000);
        await this.mobileInput.clear();
        await this.mobileInput.fill(mobile);
        // Debug: Check if value was entered
        const enteredValue = await this.mobileInput.inputValue();
        console.log(`Entered value: ${enteredValue}`);
        if (password) {
            console.log(`[Login] Entering password`);
            await this.waitForVisible(this.passwordInput, 25000);
            await this.passwordInput.clear();
            await this.passwordInput.fill(password);
        }

        console.log(`[Login] Clicking Sign In button`);
        await this.loginButton.click();
    }

    /**
     * Enter the OTP code digit-by-digit into the 6-input OTP field and click Verify.
     */
    async enterOTP(otpCode: string) {
        console.log(`[OTP] Entering OTP code: ${otpCode}`);
        await this.waitForVisible(this.otpDigitInputs.first(), 10000);

        // Fill each individual OTP character input with one digit
        for (let i = 0; i < otpCode.length; i++) {
            await this.otpDigitInputs.nth(i).fill(otpCode[i]);
        }

        console.log(`[OTP] Clicking Verif y button`);
        await this.verifyOtpButton.click();
    }

    /**
     * Full end-to-end Login Workflow including dynamic OTP retrieval from Redis.
     */
    async loginWorkflow(mobile: string, password?: string) {
        // Step 1: Clear any stale OTP from Redis before triggering a new one

        // Step 2: Enter credentials & click Sign In (triggers new OTP)
        await this.enterCredentials(mobile, password);

        // Step 3: Fetch OTP from Redis (built-in retry logic)
        let otp: string;
        try {
            otp = await getOTP(mobile);
        } catch (err: any) {
            console.error(`[Login] Stopped: Could not retrieve OTP. Reason: ${err.message}`);
            throw err;
        }

        // Step 4: Fill OTP and click Verify
        await this.enterOTP(otp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Assertions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Assert user has been redirected to the dashboard after successful login.
     */
    async expectSuccessfulLogin() {
        console.log(`[Assert] Waiting for redirect to /dashboard/insights`);
        await this.page.waitForURL('**/dashboard/insights', { timeout: 15000 });
        expect(this.page.url()).toContain('/dashboard/insights');
    }

    /**
     * Assert the "Phone number is not registered" error message is visible.
     */
    async expectUnregisteredPhoneError() {
        console.log(`[Assert] Checking for unregistered phone error`);
        await expect(this.muiErrorMessage).toContainText('Phone number is not registered. Please contact support.', { timeout: 5000 });
    }

    /**
     * Assert the "Wrong Password" error message is visible.
     */
    async expectWrongPasswordError() {
        console.log(`[Assert] Checking for wrong password error`);
        await expect(this.muiErrorMessage).toContainText('Wrong Password', { timeout: 5000 });
    }

    /**
     * Assert the "Invalid OTP or otp expired" error message is visible.
     */
    async expectInvalidOTPError() {
        console.log(`[Assert] Checking for invalid OTP error`);
        await expect(this.otpErrorMessage).toContainText('Invalid OTP or otp expired', { timeout: 5000 });
    }
}
