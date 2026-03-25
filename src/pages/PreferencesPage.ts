import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserMenuComponent } from '../components/UserMenuComponent';

export class PreferencesPage extends BasePage {
  readonly userMenu: UserMenuComponent;

  // #mw-input-wplanguage is the <select> element in the Internationalisation section
  private readonly languageSelect;
  private readonly saveButton;

  constructor(page: Page) {
    super(page);
    this.userMenu = new UserMenuComponent(page);
    // #mw-input-wplanguage is the OOUI DropdownInputWidget-php <div> wrapper;
    // the actual <select> element is nested inside it
    this.languageSelect = page.locator('#mw-input-wplanguage select');
    this.saveButton = page.locator('#prefcontrol');
  }

  async goto(): Promise<void> {
    await this.page.goto('/wiki/Special:Preferences');
    // Preferences is a JS-heavy OOUI application — wait for full initialization
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Scrolls to the language widget, then picks the option matching langCode
   * via the native <select> nested inside the OOUI DropdownInputWidget wrapper.
   */
  async selectLanguage(langCode: string): Promise<void> {
    const widgetLocator = this.page.locator('#mw-input-wplanguage');
    // Wait for the OOUI widget to be stably attached (it re-renders on page load)
    await widgetLocator.waitFor({ state: 'attached' });
    await widgetLocator.scrollIntoViewIfNeeded();
    // The OOUI DropdownInputWidget hides the native <select> behind a custom UI element.
    // force: true bypasses the visibility check so Playwright can set the value directly
    // on the hidden form element and fires the change event to notify the widget.
    await this.languageSelect.selectOption({ value: langCode }, { force: true });
  }

  async save(): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.saveButton.click(),
    ]);
  }

  async getSelectedLanguage(): Promise<string> {
    return (await this.languageSelect.inputValue()) ?? '';
  }
}
