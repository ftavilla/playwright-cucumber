import {Given, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../../src/support/world';
import {REGISTER_USE_CASE_TOKEN, RegisterUseCase} from '../../src/application/use-cases/registration/RegisterUseCase';
import {VerifyRegistrationUseCase} from '../../src/application/use-cases/registration/VerifyRegistrationUseCase';
import {expect} from "@playwright/test";

Given('I open the registration form', async function (this: CustomWorld) {
  this.setUseCase(REGISTER_USE_CASE_TOKEN, new RegisterUseCase(this.page));
});

When('I register with valid user data', async function (this: CustomWorld) {
  const registerUseCase = this.getUseCase<RegisterUseCase>(REGISTER_USE_CASE_TOKEN);

  await registerUseCase.execute({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    mobile: '1234567890',
  });
});

Then('I should see a registration confirmation with the user\'s full name', async function (this: CustomWorld) {
  const verifyUseCase = new VerifyRegistrationUseCase(this.page);
  const registeredUser = await verifyUseCase.execute();
  expect(registeredUser).toContain('John Doe');
});
