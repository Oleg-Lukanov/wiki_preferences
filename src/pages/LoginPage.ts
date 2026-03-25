import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput;
  private readonly passwordInput;
  private readonly loginButton;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#wpName1');
    this.passwordInput = page.locator('#wpPassword1');
    this.loginButton = page.locator('#wpLoginAttempt');
  }

  async goto(): Promise<void> {
    await this.page.goto('/w/index.php?title=Special:UserLogin');
    await this.waitForLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for redirect back to wikipedia after auth.wikimedia.org auth flow
    await this.page.waitForURL(/en\.wikipedia\.org/, { timeout: 15000 });
    await this.waitForLoad();
  }
}
