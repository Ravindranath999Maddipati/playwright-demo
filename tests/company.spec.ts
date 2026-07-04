import { test, expect } from '../fixtures/my-fixtures';
import { CompanyPage } from 'pages/CompanyPage';


/**
 * Company Page Test Suite for CMS - CSMS Statiq
 *
 * Each test is fully independent.
 * The loggedInPage fixture handles login automatically.
 * Tests only focus on Company page business logic.
 *
 * Tests Covered:
 *  TC_COMPANY_01 - Navigate to Company Page and Verify Landing
 *  TC_COMPANY_02 - Search by Company Name
 *  TC_COMPANY_03 - Filter by Company Type
 *  TC_COMPANY_04 - Filter by Payout Type
 *  TC_COMPANY_05 - Filter by Country
 *  TC_COMPANY_06 - Open Add Company Form
 */

test.describe(" Company Page Test Suite", () => {

    test('TC_COMPANY_01 - Navigate to Company Page and Verify Landing', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);

        await companyPage.navigateToCompanyPage();

        // Verify we landed on the correct page
        await expect(companyPage.page).toHaveURL(/.*company-management\/cpo.*/);
        await expect(companyPage.page.getByText('Company Management')).toBeVisible();
    });

    test('TC_COMPANY_02 - Search by Company Name - Morris Garage', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);
        await companyPage.navigateToCompanyPage();

        await companyPage.searchByCompanyName('Morris Garage');

        // Assertions using companyPage
        await expect(companyPage.page.getByText('Morris Garage')).toBeVisible();
    });

    test('TC_COMPANY_03 - Filter by Company Type - CPO', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);
        await companyPage.navigateToCompanyPage();

        await companyPage.selectCompanyType('CPO');

        await expect(companyPage.page.getByText('CPO')).toBeVisible();
    });

    test('TC_COMPANY_04 - Filter by Payout Type', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);
        await companyPage.navigateToCompanyPage();

        await companyPage.selectPayoutType('Platform');

        // Add your specific assertion
        await expect(companyPage.page).toHaveURL(/.*company-management\/cpo.*/);
    });

    test('TC_COMPANY_05 - Filter by Country', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);
        await companyPage.navigateToCompanyPage();

        await companyPage.selectCountry('India');

        await expect(companyPage.page.getByText('India')).toBeVisible();
    });

    test('TC_COMPANY_06 - Open Add Company Form', async ({ loggedInPage }) => {
        const companyPage = new CompanyPage(loggedInPage.page);
        await companyPage.navigateToCompanyPage();

        await companyPage.openAddCompanyForm();

        await expect(companyPage.page).toHaveURL(/.*company-management\/cpo\/add.*/);
        await expect(companyPage.page.getByText('Add Company')).toBeVisible();
    });
});