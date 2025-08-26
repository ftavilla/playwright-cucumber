import {Given, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../src/support/world';
import {UPLOAD_FILE_USE_CASE_TOKEN, UploadFileUseCase} from '../../src/application/use-cases/upload/UploadFileUseCase';

Given('I am on the upload page', async function (this: CustomWorld) {
  this.setUseCase(UPLOAD_FILE_USE_CASE_TOKEN, new UploadFileUseCase(this.page));
});

When('I upload a file named {string}', async function (this: CustomWorld, filePath: string) {
  const uploadFileUseCase = this.getUseCase<UploadFileUseCase>(UPLOAD_FILE_USE_CASE_TOKEN);
  await uploadFileUseCase.execute(filePath);
});

Then('I should see the uploaded file name displayed', async function (this: CustomWorld) {
  const uploadFileUseCase = this.getUseCase<UploadFileUseCase>(UPLOAD_FILE_USE_CASE_TOKEN);
  const message = await uploadFileUseCase.getSuccessMessage();

  if (!message || !message.includes('sample.txt')) {
    throw new Error(`Upload success message is incorrect or missing. Found: "${message}"`);
  }
});
