import { BasePage } from './BasePage';
import { UserMenuComponent } from '../components/UserMenuComponent';

export class PreferencesPage extends BasePage {
  readonly userMenu = new UserMenuComponent(this.page);

  // CSS kept: OOUI DropdownInputWidget-php hides the native <select> — no accessible role available
  private readonly languageWidget = this.page.locator('#mw-input-wplanguage');
  private readonly languageSelect = this.page.locator('#mw-input-wplanguage select');
  // CSS kept: #prefcontrol is locale-independent — the button label changes with UI language
  // (e.g. "Save" in English, "Зберегти" in Ukrainian), so getByRole/getByText would break
  // when preferences are saved while the UI is already in a non-English language.
  private readonly saveButton = this.page.locator('#prefcontrol');

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
    // Wait for the OOUI widget to be stably attached (it re-renders on page load)
    await this.languageWidget.waitFor({ state: 'attached' });
    await this.languageWidget.scrollIntoViewIfNeeded();
    // force: true bypasses the CSS visibility check on the hidden native <select>
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
