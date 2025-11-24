/**
 * Page Object for the web table functionality
 */
export class WebTablePage {
  constructor(private page: any) {}

  async navigate() {
    await this.page.goto('https://demoqa.com/webtables');
  }

  async clickAddButton() {
    await this.page.click('#addNewRecordButton');
  }

  async fillForm(data: any) {
    await this.page.fill('#firstName', data.firstName);
    await this.page.fill('#lastName', data.lastName);
    await this.page.fill('#userEmail', data.email);
    await this.page.fill('#age', data.age);
    await this.page.fill('#salary', data.salary);
    await this.page.fill('#department', data.department);
  }

  async submit() {
    await this.page.click('#submit');
  }

  async entryExists(email: string): Promise<boolean> {
    return this.page.locator('.rt-td').filter({ hasText: email }).isVisible();
  }
}
