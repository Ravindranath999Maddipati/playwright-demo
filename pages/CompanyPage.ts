import { Page, Locator } from '@playwright/test';
import { BasePage } from 'pages/BasePage';

export class CompanyPage extends BasePage {
    // Quick Filters
    readonly countryFilter: Locator;
    readonly companyNameSearch: Locator;
    readonly companyTypeDropdown: Locator;
    readonly payoutTypeDropdown: Locator;
    readonly searchButton: Locator;
    readonly clearButton: Locator;

    // Add Company Button
    readonly addCompanyButton: Locator;

    constructor(page: Page) {
        super(page);

        // Quick Filters
        this.countryFilter = page.locator('#country');
        this.companyNameSearch = page.getByPlaceholder('Company Name');
        this.companyTypeDropdown = page.locator('#company_type');
        this.payoutTypeDropdown = page.locator('#payout_type');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.clearButton = page.getByRole('button', { name: 'Clear' });

        // Add Company
        this.addCompanyButton = page.getByRole('button', { name: 'add company' });
    }

    async navigateToCompanyPage() {
        await this.navigateTo('/company-management/cpo');
    }

    // Search by Company Name
    async searchByCompanyName(name: string) {
        await this.waitForVisible(this.companyNameSearch, 10000);
        await this.companyNameSearch.clear();
        await this.companyNameSearch.fill(name);
        await this.searchButton.click();
    }

    // Select Company Type
    async selectCompanyType(type: string) {
        await this.companyTypeDropdown.click();
        await this.page.getByRole('option', { name: type }).click();
        await this.searchButton.click();
    }

    // Select Payout Type
    async selectPayoutType(type: string) {
        await this.payoutTypeDropdown.click();
        await this.page.getByRole('option', { name: type }).click();
        await this.searchButton.click();
    }

    // Select Country
    async selectCountry(country: string) {
        await this.countryFilter.click();
        await this.page.getByRole('option', { name: country }).click();
        await this.searchButton.click();
    }

    // Open Add Company Form
    async openAddCompanyForm() {
        await this.waitForVisible(this.addCompanyButton, 10000);
        await this.addCompanyButton.click();
    }
}
