import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import {BrowserService} from "../infrastructure/playwright/browser";

let browserService: BrowserService;

BeforeAll(async () => {
    browserService = new BrowserService();
    await browserService.launch();
});

AfterAll(async () => {
    await browserService.close();
});

Before(async function (this: CustomWorld) {
    const context = await browserService.createContext();
    this.page = await browserService.createPage();
});

After(async function (this: CustomWorld) {
    if (this.page) {
        await this.page.screenshot({
            path: './test-results/screenshots/failed-test.png',
            type: 'png',
        });
        await this.page.close();
    }
    await this.page?.context().close();
});
