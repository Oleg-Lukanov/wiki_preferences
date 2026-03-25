import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // getByLabel matches the <label> text on the MediaWiki login form
  private readonly usernameInput = this.page.getByLabel('Username');
  private readonly passwordInput = this.page.getByLabel('Password');
  private readonly loginButton = this.page.getByRole('button', { name: 'Log in' });

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
