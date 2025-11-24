import { UploadPage } from '../../../infrastructure/playwright/pages/UploadPage';
import path from 'path';

export const UPLOAD_FILE_USE_CASE_TOKEN = Symbol('UploadFileUseCase');

/**
 * Use case to handle file upload
 */
export class UploadFileUseCase {
  constructor(private page: any) {}

  /**
   * Executes the file upload process
   * @param fileName - Name of the file to upload
   */
  async execute(fileName: string): Promise<void> {
    const uploadPage = new UploadPage(this.page);
    await uploadPage.navigate();

    const filePath = path.resolve('assets', fileName);
    await uploadPage.upload(filePath);

    const isUploaded = await uploadPage.isFileNameDisplayed(fileName);
    if (!isUploaded) throw new Error('File upload failed or filename not visible');
  }

  /**
   * Gets the success message after upload
   * @returns The success message or null if not visible
   */
  async getSuccessMessage(): Promise<string | null> {
    const successMessageElement = this.page.locator('#uploadedFilePath');
    if (await successMessageElement.isVisible()) {
      return (await successMessageElement.textContent())?.trim() || null;
    }
    return null;
  }
}
