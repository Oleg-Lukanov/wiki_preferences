import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../../../.auth/user.json');
const API_URL = 'https://en.wikipedia.org/w/api.php';

setup('authenticate as Wikipedia user', async ({ page }) => {
  setup.setTimeout(90000);

  const botName = process.env.WIKI_BOTPASSWORD_NAME;
  const botPassword = process.env.WIKI_BOTPASSWORD_PASSWORD;

  if (botName && botPassword) {
    const tokenResponse = await page.context().request.get(API_URL, {
      params: { action: 'query', meta: 'tokens', type: 'login', format: 'json' },
    });
    const { query } = await tokenResponse.json();
    const loginToken = query.tokens.logintoken as string;

    const loginResponse = await page.context().request.post(API_URL, {
      form: {
        action: 'login',
        format: 'json',
        lgname: botName,
        lgpassword: botPassword,
        lgtoken: loginToken,
      },
    });
    const loginData = await loginResponse.json();

    if (loginData.login?.result !== 'Success') {
      throw new Error(`Bot password login failed: ${JSON.stringify(loginData.login)}`);
    }

    await page.goto('https://en.wikipedia.org/wiki/Special:Preferences');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/Special:UserLogin|UserLogin/);

    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    await page.context().storageState({ path: authFile });
    return;
  }

  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set WIKI_USERNAME + WIKI_PASSWORD in .env (local) or WIKI_BOTPASSWORD_NAME + WIKI_BOTPASSWORD_PASSWORD (CI)',
    );
  }

  await page.goto('https://en.wikipedia.org/w/index.php?title=Special:UserLogin');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL(/en\.wikipedia\.org/, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');

  await expect(page).not.toHaveURL(/Special:UserLogin/);
  await expect(page.locator('#pt-logout')).toBeAttached({ timeout: 10000 });

  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
});
