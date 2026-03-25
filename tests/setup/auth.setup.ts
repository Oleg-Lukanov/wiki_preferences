import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as Wikipedia user', async ({ page }) => {
  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error('WIKI_USERNAME and WIKI_PASSWORD must be set in .env');
  }

  await page.goto('https://en.wikipedia.org/w/index.php?title=Special:UserLogin');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for successful redirect back to en.wikipedia.org after auth.wikimedia.org flow
  await page.waitForURL(/en\.wikipedia\.org/, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  // Assert the user is now logged in — not redirected back to login page
  await expect(page).not.toHaveURL(/Special:UserLogin/);
  // The personal tools (logout link) exist in the DOM (inside a collapsed dropdown)
  await expect(page.locator('#pt-logout')).toBeAttached({ timeout: 10000 });

  // Ensure the auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
});
