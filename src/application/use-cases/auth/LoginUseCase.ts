import { UseCase } from '../../../domain/usecases/UseCase';
import { LoginInput, LoginOutput } from './LoginUseCase.types';
import { Page } from '@playwright/test';

/**
 * Use case to handle user authentication
 * Uses credentials retrieved from Vault
 */
export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
    constructor(private page: Page, private loginUrl: string = 'https://demoqa.com/login') {}

    async execute(input: LoginInput): Promise<LoginOutput> {
        try {
            const { credentials, rememberMe = false } = input;

            console.log(`🔐 Attempting login for: ${credentials.username}`);

            await this.page.goto(this.loginUrl);

            await this.page.fill('#userName', credentials.username);
            await this.page.fill('#password', credentials.password);

            if (rememberMe) {
                const rememberCheckbox = this.page.locator('#rememberMe');
                if (await rememberCheckbox.isVisible()) {
                    await rememberCheckbox.check();
                }
            }

            await this.page.click('#login');

            await Promise.race([
                this.page.waitForURL('**/profile', { timeout: 5000 }).catch(() => {}),
                this.page.waitForSelector('.mb-3', { timeout: 5000 }).catch(() => {})
            ]);

            const currentUrl = this.page.url();
            const isLoggedIn = currentUrl.includes('/profile') || !currentUrl.includes('/login');

            if (isLoggedIn) {
                console.log(`✅ Login successful for: ${credentials.username}`);
                return {
                    success: true,
                    message: 'Login successful',
                    userId: credentials.username
                };
            } else {
                console.log(`❌ Login failed for: ${credentials.username}`);
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }

        } catch (error: any) {
            console.error('❌ Error during login:', error.message);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
}

