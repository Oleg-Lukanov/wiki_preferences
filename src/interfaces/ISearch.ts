/**
 * Contract for search bar interactions.
 * Implemented by SearchComponent.
 */
export interface ISearch {
  search(query: string): Promise<void>;
  typeAndSuggest(query: string): Promise<void>;
}
