import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../../../.auth/user.json');

setup('authenticate as Wikipedia user', async ({ page }) => {
  setup.setTimeout(90000);

  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error('WIKI_USERNAME and WIKI_PASSWORD must be set in .env');
  }

  // Special:UserLogin redirects through auth.wikimedia.org (SUL3)
  await page.goto('https://en.wikipedia.org/wiki/Special:UserLogin');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // auth.wikimedia.org processes login and redirects back to en.wikipedia.org
  await page.waitForURL(/en\.wikipedia\.org/, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  await expect(page).not.toHaveURL(/Special:UserLogin|UserLogin/);
  await expect(page.locator('#pt-logout')).toBeAttached({ timeout: 10000 });

  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
});
