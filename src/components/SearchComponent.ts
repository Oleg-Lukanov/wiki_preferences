import { BaseComponent } from './BaseComponent';
import { ISearch } from '../interfaces/ISearch';

/**
 * Composition component representing the Wikipedia search bar.
 * Used in pages that expose search functionality.
 */
export class SearchComponent extends BaseComponent implements ISearch {
  private readonly searchInput = this.page.getByRole('searchbox', { name: 'Search Wikipedia' });
  private readonly searchButton = this.page.getByRole('button', { name: 'Search' });

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
