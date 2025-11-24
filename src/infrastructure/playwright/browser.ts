import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { execSync } from 'child_process';

export class BrowserService {
    private browser: Browser | undefined;
    private context: BrowserContext | undefined;

    async launch(): Promise<Browser> {
        if (!this.browser) {
            const headless = process.env.HEADLESS !== 'false' && (process.env.CI === 'true' || process.env.HEADLESS === 'true');

            console.log(`🚀 Launching browser in ${headless ? 'headless' : 'headed'} mode`);

            this.browser = await chromium.launch({
                headless,
                args: headless ? [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ] : []
            });
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
