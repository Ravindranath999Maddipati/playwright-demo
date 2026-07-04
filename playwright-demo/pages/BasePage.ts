import { Page, Locator } from '@playwright/test';

export class BasePage {
    public readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper to navigate to a path (relative to baseURL if configured).
     */
    async navigateTo(path: string = '') {
        await this.page.goto(path);
    }

    /**
     * Wait for a locator to be visible
     */
    async waitForVisible(locator: Locator, timeout: number = 10000) {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for a selector string to be visible
     */
    async waitForSelectorVisible(selector: string, timeout: number = 10000) {
        await this.page.waitForSelector(selector, { state: 'visible', timeout });
    }

    /**
     * Wait for element to be attached to DOM
     */
    async waitForAttached(locator: Locator, timeout: number = 10000) {
        await locator.waitFor({ state: 'attached', timeout });
    }
}
