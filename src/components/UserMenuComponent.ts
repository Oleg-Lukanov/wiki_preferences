import { BaseComponent } from './BaseComponent';
import { IUserMenu } from '../interfaces/IUserMenu';

/**
 * Composition component representing the user account menu.
 * Used in pages that need header user menu interactions (MainPage, PreferencesPage).
 */
export class UserMenuComponent extends BaseComponent implements IUserMenu {
  // CSS kept: hidden checkbox toggle — no accessible role, label is blocked by the input element
  private readonly menuToggle = this.page.locator('#vector-user-links-dropdown-checkbox');

  // Built-in locators for visible menu item links — exact:true avoids partial-text
  // collisions with body links like "Help:Preferences" or "Restore all default preferences"
  private readonly preferencesLink = this.page.getByRole('link', {
    name: 'Preferences',
    exact: true,
  });
  private readonly logoutLink = this.page.getByRole('link', { name: 'Log out', exact: true });
  readonly loginLink = this.page.getByRole('link', { name: 'Log in', exact: true });

  async openMenu(): Promise<void> {
    // Click the checkbox toggle directly — the label is blocked by the checkbox element
    await this.menuToggle.click();
    await this.preferencesLink.waitFor({ state: 'visible' });
  }

  async clickPreferences(): Promise<void> {
    await this.openMenu();
    await this.preferencesLink.click();
  }

  async clickLogout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.loginLink.isHidden();
  }

  async isLoggedOut(): Promise<boolean> {
    return this.loginLink.isVisible();
  }
}
