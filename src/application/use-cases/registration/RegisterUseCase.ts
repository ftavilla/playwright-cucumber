import { RegistrationPage } from '../../../infrastructure/playwright/pages/RegistrationPage';

export const REGISTER_USE_CASE_TOKEN = Symbol('RegisterUseCase');

/**
 * Use case to handle user registration
 */
export class RegisterUseCase {
  constructor(private page: any) {}

  /**
   * Executes the registration process
   * @param data - User registration data
   */
  async execute(data: {
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    mobile: string;
  }): Promise<void> {
    const registrationPage = new RegistrationPage(this.page);

    await registrationPage.navigate();
    await registrationPage.fillFirstName(data.firstName);
    await registrationPage.fillLastName(data.lastName);
    await registrationPage.fillEmail(data.email);
    await registrationPage.selectGender(data.gender);
    await registrationPage.fillMobile(data.mobile);
    await registrationPage.submit();

    const success = await registrationPage.isConfirmationVisible();
    if (!success) throw new Error('Registration confirmation not visible');
  }
}
