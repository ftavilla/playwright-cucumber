import { chromium, Browser, BrowserContext, Page } from 'playwright';

export class BrowserService {
    private browser: Browser | undefined;
    private context: BrowserContext | undefined;

    async launch(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: false });
        }
        return this.browser;
    }

    async createContext(): Promise<BrowserContext> {
        if (!this.browser) {
            await this.launch();
        }
        this.context = await this.browser!.newContext();
        return this.context;
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }
    }

    async createPage(): Promise<Page> {
        if (!this.context) {
            await this.createContext();
        }
        return this.context!.newPage();
    }
}
