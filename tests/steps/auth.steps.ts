import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../src/support/world';
import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase';

const LOGIN_USE_CASE_KEY = Symbol('LoginUseCase');

/**
 * Authentication steps with Vault integration
 * Credentials are fetched on-demand and never stored in memory
 */

Given('I am on the login page', async function (this: CustomWorld) {
    await this.page.goto('https://demoqa.com/login');
});

When('I login as {string} from Vault', async function (this: CustomWorld, userId: string) {
    const credentials = await this.getCredentialsFromVault(userId);

    const loginUseCase = new LoginUseCase(this.page);
    const result = await loginUseCase.execute({ credentials });

    if (!result.success) {
        throw new Error(`Login failed: ${result.message}`);
    }

    console.log(`✅ Login successful for: ${userId}`);
});

When('I login with user {string}', async function (this: CustomWorld, userId: string) {
    const credentials = await this.getCredentialsFromVault(userId);

    const loginUseCase = new LoginUseCase(this.page);
    this.setUseCase(LOGIN_USE_CASE_KEY, loginUseCase);

    const result = await loginUseCase.execute({ credentials });

    if (!result.success) {
        throw new Error(`Login failed for ${userId}: ${result.message}`);
    }
});

Then('I should be successfully logged in', async function (this: CustomWorld) {
    const currentUrl = this.page.url();
    const isLoggedIn = currentUrl.includes('/profile') || !currentUrl.includes('/login');

    if (!isLoggedIn) {
        throw new Error('User is not logged in');
    }

    console.log('✅ User successfully logged in');
});

Then('I should see my user profile', async function (this: CustomWorld) {
    try {
        await this.page.waitForSelector('#userName-value', { timeout: 5000, state: 'visible' });
        const profileVisible = await this.page.locator('#userName-value').isVisible();

        if (!profileVisible) {
            throw new Error('User profile is not visible');
        }

        console.log('✅ User profile visible');
    } catch (error: any) {
        const currentUrl = this.page.url();
        throw new Error(`User profile is not visible. Current URL: ${currentUrl}, Error: ${error.message}`);
    }
});

