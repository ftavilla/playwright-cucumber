import {Given, Then, When} from '@cucumber/cucumber';
import {
  ADD_WEBTABLE_ENTRY_USE_CASE_TOKEN,
  AddWebTableEntryUseCase
} from '../../src/application/use-cases/web-table/AddWebTableEntryUseCase';
import {CustomWorld} from "../../src/support/world";

Given('I open the web table page', async function (this: CustomWorld) {
  this.setUseCase(ADD_WEBTABLE_ENTRY_USE_CASE_TOKEN, new AddWebTableEntryUseCase(this.page));
});

When('I add a new user entry', async function (this: CustomWorld) {
  const addWebTableEntryUseCase = this.getUseCase<AddWebTableEntryUseCase>(ADD_WEBTABLE_ENTRY_USE_CASE_TOKEN);

  await addWebTableEntryUseCase.execute({
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    age: '28',
    salary: '70000',
    department: 'Engineering'
  });
});

Then('I should see the new entry in the table', async function (this: CustomWorld) {
  const addWebTableEntryUseCase = this.getUseCase<AddWebTableEntryUseCase>(ADD_WEBTABLE_ENTRY_USE_CASE_TOKEN);

  const data = await addWebTableEntryUseCase.getRowData();
  const expected = ['Alice', 'Smith', '28', 'alice.smith@example.com', '70000', 'Engineering'];

  const found = data.some(row =>
      expected.every(val => row.includes(val))
  );

  if (!found) {
    throw new Error('New entry was not added to the table.');
  }
});
