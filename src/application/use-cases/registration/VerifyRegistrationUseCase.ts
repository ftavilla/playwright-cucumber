import { Page } from '@playwright/test';

/**
 * Use case to verify registration confirmation
 */
export class VerifyRegistrationUseCase {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Verifies the registration confirmation message
     * @returns The confirmation message text
     */
    async execute(): Promise<String> {
        const confirmationMessage = await this.page.locator('.modal-body');
        const textContent = await confirmationMessage.innerText();

        if (!textContent.includes('John Doe')) {
            throw new Error('Registration confirmation message does not display the correct full name.');
        }

        return textContent
    }

}
