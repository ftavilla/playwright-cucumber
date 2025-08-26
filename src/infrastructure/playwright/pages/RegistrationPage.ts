export class RegistrationPage {
  constructor(private page: any) {}

  async navigate() {
    await this.page.goto('https://demoqa.com/automation-practice-form');
  }

  async fillFirstName(firstName: string) {
    await this.page.fill('#firstName', firstName);
  }

  async fillLastName(lastName: string) {
    await this.page.fill('#lastName', lastName);
  }

  async fillEmail(email: string) {
    await this.page.fill('#userEmail', email);
  }

  async selectGender(gender: 'Male' | 'Female' | 'Other') {
    await this.page.click(`label[for="gender-radio-${gender === 'Male' ? 1 : gender === 'Female' ? 2 : 3}"]`);
  }

  async fillMobile(mobile: string) {
    await this.page.fill('#userNumber', mobile);
  }

  async submit() {
    await this.page.click('#submit');
  }

  async isConfirmationVisible(): Promise<boolean> {
    return this.page.isVisible('#example-modal-sizes-title-lg');
  }
}
