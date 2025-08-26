import { UploadPage } from '../../../infrastructure/playwright/pages/UploadPage';
import path from 'path';

export const UPLOAD_FILE_USE_CASE_TOKEN = Symbol('UploadFileUseCase');

export class UploadFileUseCase {
  constructor(private page: any) {}

  async execute(fileName: string): Promise<void> {
    const uploadPage = new UploadPage(this.page);
    await uploadPage.navigate();

    const filePath = path.resolve('assets', fileName);
    await uploadPage.upload(filePath);

    const isUploaded = await uploadPage.isFileNameDisplayed(fileName);
    if (!isUploaded) throw new Error('File upload failed or filename not visible');
  }

  async getSuccessMessage(): Promise<string | null> {
    const successMessageElement = this.page.locator('#uploadedFilePath');
    if (await successMessageElement.isVisible()) {
      return (await successMessageElement.textContent())?.trim() || null;
    }
    return null;
  }
}
