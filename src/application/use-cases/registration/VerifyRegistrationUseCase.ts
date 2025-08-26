import { Page } from '@playwright/test';

export class VerifyRegistrationUseCase {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async execute(): Promise<String> {
        const confirmationMessage = await this.page.locator('.modal-body');

        const textContent = await confirmationMessage.innerText();

        if (!textContent.includes('John Doe')) {
            throw new Error('Registration confirmation message does not display the correct full name.');
        }

        return textContent
    }

}
