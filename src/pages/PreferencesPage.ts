import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserMenuComponent } from '../components/UserMenuComponent';

export class PreferencesPage extends BasePage {
  readonly userMenu: UserMenuComponent;

  // Internationalisation section language selector (OOUI combobox)
  private readonly languageInput;
  private readonly saveButton;

  constructor(page: Page) {
    super(page);
    this.userMenu = new UserMenuComponent(page);
    // The OOUI widget wraps #mw-input-wplanguage inside a combobox container
    this.languageInput = page.locator('#mw-input-wplanguage');
    this.saveButton = page.locator('#prefcontrol');
  }

  async goto(): Promise<void> {
    await this.page.goto('/wiki/Special:Preferences');
    await this.waitForLoad();
  }

  /**
   * Scrolls to the language field, clears it, types the language code,
   * picks the first matching option from the OOUI dropdown, then verifies selection.
   */
  async selectLanguage(langCode: string): Promise<void> {
    await this.languageInput.scrollIntoViewIfNeeded();

    // Click to focus and open the OOUI combobox
    await this.languageInput.click();
    await this.languageInput.fill(langCode);

    // Wait for dropdown options to appear and pick the one matching the langCode
    const optionLocator = this.page.locator(`.oo-ui-menuSelectWidget .oo-ui-optionWidget[data-value="${langCode}"]`);
    await optionLocator.waitFor({ state: 'visible', timeout: 5000 });
    await optionLocator.click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForLoad();
  }

  async getSelectedLanguage(): Promise<string> {
    return (await this.languageInput.inputValue()) ?? '';
  }
}
