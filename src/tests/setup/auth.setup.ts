import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../../../.auth/user.json');

setup('authenticate as Wikipedia user', async ({ page }) => {
  setup.setTimeout(90000);

  const botName = process.env.WIKI_BOTPASSWORD_NAME;
  const botPassword = process.env.WIKI_BOTPASSWORD_PASSWORD;

  if (botName && botPassword) {
    await page.goto('https://en.wikipedia.org/');
    await page.waitForLoadState('domcontentloaded');

    const loginToken: string = await page.evaluate(async () => {
      const res = await fetch('/w/api.php?action=query&meta=tokens&type=login&format=json', {
        credentials: 'include',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      return data.query.tokens.logintoken as string;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loginResult: any = await page.evaluate(
      async ({ name, pass, token }: { name: string; pass: string; token: string }) => {
        const body = new URLSearchParams({
          action: 'login',
          format: 'json',
          lgname: name,
          lgpassword: pass,
          lgtoken: token,
        });
        const res = await fetch('/w/api.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        return res.json();
      },
      { name: botName, pass: botPassword, token: loginToken },
    );

    if (loginResult.login?.result !== 'Success') {
      throw new Error(`Bot password login failed: ${JSON.stringify(loginResult.login)}`);
    }

    await page.goto('https://en.wikipedia.org/wiki/Special:Preferences');
    await page.waitForLoadState('networkidle');
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
