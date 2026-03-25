import { test, expect } from '../src/fixtures/pageFixtures';

/**
 * TC-01: Successful Wikipedia interface language switch by an authenticated user.
 *
 * Steps 1-4 (core scenario — verified by the test body):
 *  1. Open Main Page → verify interface is English.
 *  2. Navigate to Preferences via user menu.
 *  3. Change interface language to Ukrainian (uk) → Save.
 *  4. Verify interface is now Ukrainian.
 *
 * Steps 5-8 (teardown — moved to afterEach to keep the test body focused):
 *  5. Change language back to English (en) → Save.
 *  6. Verify interface is back to English.
 *  7. Logout via user menu.
 *  8. Verify user is logged out.
 */
test.describe('TC-01: Interface language switch', () => {
  test.use({ storageState: '.auth/user.json' });
  // Each navigation + save on Wikipedia takes 2-5s; allow 90s for all steps
  test.setTimeout(90000);

  test.beforeEach(async ({ preferencesPage }) => {
    // Guarantee English as the starting language to prevent state pollution from
    // previous failed test runs (the language preference is stored server-side).
    // Only save if a change is actually needed — OOUI keeps the Save button
    // disabled when no form fields have changed, so calling save() unconditionally
    // would time out when the language is already English.
    await preferencesPage.goto();
    if ((await preferencesPage.getSelectedLanguage()) !== 'en') {
      await preferencesPage.selectLanguage('en');
      await preferencesPage.save();
    }
  });

  test.afterEach(async ({ preferencesPage }) => {
    // ── Step 5: Change language back to English ───────────────────────────────
    // Navigate to preferences (page text may still be in Ukrainian after Step 4)
    await preferencesPage.goto();
    // Guard: OOUI disables Save when nothing changed — only save if language differs
    if ((await preferencesPage.getSelectedLanguage()) !== 'en') {
      await preferencesPage.selectLanguage('en');
      await preferencesPage.save();
    }

    // ── Step 6: Verify interface is back to English ───────────────────────────
    await expect(preferencesPage.page.locator('html')).toHaveAttribute('lang', 'en');

    // ── Step 7: Logout via user menu ──────────────────────────────────────────
    await preferencesPage.userMenu.clickLogout();
    // Wikipedia redirects to Special:UserLogout confirmation page
    await preferencesPage.page.waitForURL(/Special:UserLogout|UserLogout/, { timeout: 15000 });
    await preferencesPage.page.waitForLoadState('domcontentloaded');

    // ── Step 8: Verify user is now logged out ─────────────────────────────────
    // exact:true distinguishes header 'Log in' from body text 'log in'
    await expect(preferencesPage.page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  });

  test('authenticated user can switch UI language to Ukrainian', async ({
    mainPage,
    preferencesPage,
  }) => {
    // ── Step 1: Open Main Page and verify English interface ─────────────────
    await mainPage.goto();
    await expect(mainPage.page.locator('html')).toHaveAttribute('lang', 'en');

    // ── Step 2: Navigate to Preferences via user menu ────────────────────────
    await mainPage.userMenu.clickPreferences();
    await preferencesPage.waitForLoad();

    // ── Step 3: Change interface language to Ukrainian ────────────────────────
    await preferencesPage.selectLanguage('uk');
    await preferencesPage.save();

    // ── Step 4: Verify interface language is now Ukrainian ────────────────────
    await expect(preferencesPage.page.locator('html')).toHaveAttribute('lang', 'uk');
  });
});
