import { Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getHtmlLang(): Promise<string> {
    return this.page.locator('html').getAttribute('lang').then((v) => v ?? '');
  }
}
