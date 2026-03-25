import { BasePage } from './BasePage';
import { UserMenuComponent } from '../components/UserMenuComponent';
import { SearchComponent } from '../components/SearchComponent';

export class MainPage extends BasePage {
  // Property initializers run after BasePage constructor sets this.page
  readonly userMenu = new UserMenuComponent(this.page);
  readonly search = new SearchComponent(this.page);

  async goto(): Promise<void> {
    await this.page.goto('/wiki/Main_Page');
    await this.waitForLoad();
  }
}
