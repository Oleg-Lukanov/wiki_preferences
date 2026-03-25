import { Page } from '@playwright/test';

/**
 * Composition component representing the Wikipedia search bar.
 * Used in pages that expose search functionality.
 */
export class SearchComponent {
  private readonly page: Page;

  private readonly searchInput;
  private readonly searchButton;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', { name: 'Search Wikipedia' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async typeAndSuggest(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Wait for autocomplete suggestions to appear
    await this.page.locator('.cdx-typeahead-search__suggestions').waitFor({ state: 'visible' });
  }
}
