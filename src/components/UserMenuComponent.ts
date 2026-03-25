import { Page } from '@playwright/test';

/**
 * Composition component representing the user account menu.
 * Used in pages that need header user menu interactions (MainPage, PreferencesPage).
 */
export class UserMenuComponent {
  private readonly page: Page;

  // Profile icon that opens the dropdown
  private readonly menuToggle;
  // Individual menu items
  private readonly preferencesLink;
  private readonly logoutLink;
  private readonly loginLink;

  constructor(page: Page) {
    this.page = page;
    this.menuToggle = page.locator('#vector-user-links-dropdown-checkbox');
    this.preferencesLink = page.locator('#pt-preferences a');
    this.logoutLink = page.locator('#pt-logout a');
    this.loginLink = page.locator('#pt-login a');
  }

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
