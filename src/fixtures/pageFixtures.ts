import { test as base } from '@playwright/test';
import { MainPage } from '../pages/MainPage';
import { PreferencesPage } from '../pages/PreferencesPage';
import { LoginPage } from '../pages/LoginPage';

type PageFixtures = {
  mainPage: MainPage;
  preferencesPage: PreferencesPage;
  loginPage: LoginPage;
};

export const test = base.extend<PageFixtures>({
  mainPage: async ({ page }, use) => {
    await use(new MainPage(page));
  },

  preferencesPage: async ({ page }, use) => {
    await use(new PreferencesPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
