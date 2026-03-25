/**
 * Contract for user account dropdown menu interactions.
 * Implemented by UserMenuComponent.
 */
export interface IUserMenu {
  openMenu(): Promise<void>;
  clickPreferences(): Promise<void>;
  clickLogout(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  isLoggedOut(): Promise<boolean>;
}
