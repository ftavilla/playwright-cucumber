export class UploadPage {
  constructor(private page: any) {}

  async navigate() {
    await this.page.goto('https://demoqa.com/upload-download');
  }

  async upload(filePath: string) {
    await this.page.setInputFiles('#uploadFile', filePath);
  }

  async isFileNameDisplayed(fileName: string): Promise<boolean> {
    return this.page.locator('#uploadedFilePath').innerText().then((text: string) => text.includes(fileName));
  }
}
