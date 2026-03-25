import { Page } from '@playwright/test';

/**
 * Abstract base class for all composition components.
 * Mirrors BasePage — holds the single constructor so descendant
 * component classes can use property initializers without declaring
 * their own constructors.
 */
export abstract class BaseComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
