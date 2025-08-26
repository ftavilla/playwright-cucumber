import { WebTablePage } from '../../../infrastructure/playwright/pages/WebTablePage';

interface WebTableEntry {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  salary: string;
  department: string;
}

export const ADD_WEBTABLE_ENTRY_USE_CASE_TOKEN = Symbol('AddWebTableEntryUseCase');

export class AddWebTableEntryUseCase {
  constructor(private page: any) {}

  async execute(data: {
    firstName: string;
    lastName: string;
    email: string;
    age: string;
    salary: string;
    department: string;
  }): Promise<void> {
    const webTablePage = new WebTablePage(this.page);

    await webTablePage.navigate();
    await webTablePage.clickAddButton();
    await webTablePage.fillForm(data);
    await webTablePage.submit();

    const rowExists = await webTablePage.entryExists(data.email);
    if (!rowExists) throw new Error('Entry not found in the table');
  }

  async getRowData(): Promise<string[][]> {
    const rows = await this.page.locator('.rt-tbody .rt-tr-group');

    const rowCount = await rows.count();
    const rowData: string[][] = [];

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('.rt-td');
      const cellCount = await cells.count();
      const row: string[] = [];

      for (let j = 0; j < cellCount; j++) {
        row.push((await cells.nth(j).textContent())?.trim() || '');
      }

      rowData.push(row);
    }

    return rowData;
  }
}
