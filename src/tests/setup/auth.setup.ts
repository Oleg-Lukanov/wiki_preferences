import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../../../.auth/user.json');
const EN_API = 'https://en.wikipedia.org/w/api.php';

interface ClientLoginResponse {
  clientlogin: {
    status: 'PASS' | 'UI' | 'REDIRECT' | 'RESTART' | 'FAIL';
    username?: string;
    message?: string;
  };
}

interface TokenResponse {
  query: {
    tokens: {
      logintoken: string;
    };
  };
}

async function tryClientLogin(
  context: { request: Pick<import('@playwright/test').APIRequestContext, 'get' | 'post'> },
  username: string,
  password: string,
): Promise<boolean> {
  try {
    const tokenRes = await context.request.get(EN_API, {
      params: { action: 'query', meta: 'tokens', type: 'login', format: 'json' },
    });
    const tokenData: TokenResponse = await tokenRes.json();
    const loginToken = tokenData.query.tokens.logintoken;

    const loginRes = await context.request.post(EN_API, {
      form: {
        action: 'clientlogin',
        username,
        password,
        logintoken: loginToken,
        loginreturnurl: 'https://en.wikipedia.org/',
        format: 'json',
      },
    });
    const loginData: ClientLoginResponse = await loginRes.json();

    if (loginData.clientlogin.status === 'PASS') {
      console.log(`clientlogin: PASS (user: ${loginData.clientlogin.username})`);
      return true;
    }

    console.log(`clientlogin: ${loginData.clientlogin.status} — falling back to web form`);
    return false;
  } catch (error) {
    console.log(`clientlogin error: ${error} — falling back to web form`);
    return false;
  }
}

async function webFormLogin(page: import('@playwright/test').Page, username: string, password: string): Promise<void> {
  await page.goto('https://en.wikipedia.org/wiki/Special:UserLogin');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL(/en\.wikipedia\.org/, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
}

setup('authenticate as Wikipedia user', async ({ page }) => {
  setup.setTimeout(90000);

  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error('WIKI_USERNAME and WIKI_PASSWORD must be set in .env');
  }

  // Try API clientlogin first (faster, avoids SUL3 web redirects)
  const apiSuccess = await tryClientLogin(page.context(), username, password);

  if (apiSuccess) {
    // Navigate to verify the API session is recognized by the browser
    await page.goto('https://en.wikipedia.org/');
    await page.waitForLoadState('domcontentloaded');
  }

  // If API login didn't produce a valid browser session, fall back to web form
  const isLoggedIn = apiSuccess && (await page.locator('#pt-logout').isVisible().catch(() => false));

  if (!isLoggedIn) {
    if (apiSuccess) {
      console.log('clientlogin cookies not recognized by browser — using web form');
    }
    await webFormLogin(page, username, password);
  }

  await expect(page).not.toHaveURL(/Special:UserLogin|UserLogin/);
  await expect(page.locator('#pt-logout')).toBeAttached({ timeout: 10000 });

  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
});
