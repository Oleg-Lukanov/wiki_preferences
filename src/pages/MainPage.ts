import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserMenuComponent } from '../components/UserMenuComponent';
import { SearchComponent } from '../components/SearchComponent';

export class MainPage extends BasePage {
  readonly userMenu: UserMenuComponent;
  readonly search: SearchComponent;

  constructor(page: Page) {
    super(page);
    this.userMenu = new UserMenuComponent(page);
    this.search = new SearchComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/wiki/Main_Page');
    await this.waitForLoad();
  }
}
