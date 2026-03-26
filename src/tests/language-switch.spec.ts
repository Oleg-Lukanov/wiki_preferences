import { test, expect } from '../fixtures/pageFixtures';

test.describe('TC-01: Interface language switch', () => {
  test.use({ storageState: '.auth/user.json' });
  test.setTimeout(90000);

  test.beforeEach(async ({ preferencesPage }) => {
    await preferencesPage.goto();
    if ((await preferencesPage.getSelectedLanguage()) !== 'en') {
      await preferencesPage.selectLanguage('en');
      await preferencesPage.save();
    }
  });

  test.afterEach(async ({ preferencesPage }) => {
    await preferencesPage.goto();
    if ((await preferencesPage.getSelectedLanguage()) !== 'en') {
      await preferencesPage.selectLanguage('en');
      await preferencesPage.save();
    }
    await expect(preferencesPage.page.locator('html')).toHaveAttribute('lang', 'en');
    await preferencesPage.userMenu.clickLogout();
    await preferencesPage.page.waitForURL(/Special:UserLogout|UserLogout/, { timeout: 15000 });
    await preferencesPage.page.waitForLoadState('domcontentloaded');
    await expect(
      preferencesPage.page.getByRole('link', { name: 'Log in', exact: true }),
    ).toBeVisible();
  });

  test('authenticated user can switch UI language to Ukrainian', async ({
    mainPage,
    preferencesPage,
  }) => {
    await mainPage.goto();
    await expect(mainPage.page.locator('html')).toHaveAttribute('lang', 'en');
    await mainPage.userMenu.clickPreferences();
    await preferencesPage.waitForLoad();
    await preferencesPage.selectLanguage('uk');
    await preferencesPage.save();
    await expect(preferencesPage.page.locator('html')).toHaveAttribute('lang', 'uk');
  });
});
