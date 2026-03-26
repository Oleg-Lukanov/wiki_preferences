# wiki_preferences

[![Playwright Tests](https://github.com/Oleg-Lukanov/wiki_preferences/actions/workflows/playwright.yml/badge.svg)](https://github.com/Oleg-Lukanov/wiki_preferences/actions/workflows/playwright.yml)

Playwright + TypeScript E2E automation project for testing the Wikipedia interface language switching feature.

**[Latest Test Report (GitHub Pages)](https://oleg-lukanov.github.io/wiki_preferences/)**

---

## Test Case TC-01: Successful Interface Language Switch

**Title:** Authenticated user successfully switches the Wikipedia UI language from English to Ukrainian and back.

| Field             | Value                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| **ID**            | TC-01                                                                                 |
| **Preconditions** | User account exists (`Lowyquzet`), browser starts with English UI (`html[lang="en"]`) |
| **URL**           | https://en.wikipedia.org/wiki/Main_Page                                               |

### Steps

| #   | Action                                                                                 | Expected Result                                                    |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Navigate to `https://en.wikipedia.org/wiki/Main_Page`                                  | Main Page loads; `html[lang]` = `en`                               |
| 2   | Click the profile icon (top-right) to open the user menu                               | Dropdown menu is visible                                           |
| 3   | Click **Preferences** in the dropdown                                                  | Redirected to `Special:Preferences` page                           |
| 4   | Scroll to the **Internationalisation** section (Language field `#mw-input-wplanguage`) | Language combobox is visible                                       |
| 5   | Click the language combobox and type `uk`                                              | Dropdown list shows language options matching "uk"                 |
| 6   | Select **Ukrainian (uk)** from the dropdown                                            | "Ukrainian" is chosen in the language field                        |
| 7   | Click **Save**                                                                         | Page reloads; `html[lang]` = `uk`; UI elements appear in Ukrainian |
| 8   | Navigate to `Special:Preferences` again                                                | Preferences page loads in Ukrainian                                |
| 9   | Change the language back to **English (en)** and click **Save**                        | Page reloads; `html[lang]` = `en`; UI returns to English           |
| 10  | Click the profile icon to open the user menu                                           | Dropdown is visible                                                |
| 11  | Click **Log out**                                                                      | Redirect to Main Page; login link is now visible in the header     |
| 12  | Verify logged-out state                                                                | `#pt-login` element is visible; user is not logged in              |

**Postconditions:** User is logged out; interface language is English.

---

## Project Structure

```
wiki_preferences/
├── .env                          # Credentials (gitignored)
├── .env.example                  # Credentials template
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
├── Dockerfile                    # Docker image for CI
├── docker-compose.yml            # Docker Compose with report volume mount
├── run-tests.sh                  # Convenience script for Docker execution
├── src/
│   ├── components/
│   │   ├── UserMenuComponent.ts  # User dropdown menu (composition)
│   │   └── SearchComponent.ts    # Search bar (composition)
│   ├── fixtures/
│   │   └── pageFixtures.ts       # Custom Playwright fixtures for POM injection
│   ├── interfaces/
│   │   ├── IUserMenu.ts          # Interface for user menu component
│   │   └── ISearch.ts            # Interface for search component
│   ├── pages/
│   │   ├── BasePage.ts           # Base class (only class with constructor)
│   │   ├── LoginPage.ts          # Login page interactions (used in setup only)
│   │   ├── MainPage.ts           # Main page — composes UserMenu + Search
│   │   └── PreferencesPage.ts    # Preferences page — language selector
│   └── tests/
│       ├── setup/
│       │   └── auth.setup.ts     # One-time login + storageState save
│       └── language-switch.spec.ts  # TC-01 automated test
```

---

## Setup

### Prerequisites

- Node.js ≥ 18
- Docker + Docker Compose (for container execution)

### Install dependencies

```bash
npm install
npx playwright install chromium
```

### Configure credentials

Copy `.env.example` to `.env` and fill in your Wikipedia credentials:

```bash
cp .env.example .env
```

```
WIKI_USERNAME=your_wikipedia_username
WIKI_PASSWORD=your_wikipedia_password
```

> `.env` is listed in `.gitignore` and will never be committed to the repository.

---

## Running Tests

### Locally

```bash
# Run all tests (setup + TC-01)
npx playwright test

# Run only the auth setup (generates .auth/user.json)
npx playwright test --project=setup

# Run only TC-01 (requires .auth/user.json to exist)
npx playwright test src/tests/language-switch.spec.ts
```

### In Docker

```bash
# Option 1 — convenience script (loads .env automatically)
./run-tests.sh

# Option 2 — docker-compose directly
docker compose up --build
```

The HTML report is written to `./playwright-report/` on the **host machine** via a Docker volume mount.

---

## Viewing the Report

After a test run, open the HTML report in your browser:

```bash
# Open automatically
npx playwright show-report

# Or open manually
open playwright-report/index.html      # macOS
xdg-open playwright-report/index.html  # Linux
```

---

## Architecture Notes

- **POM with inheritance** — All page objects extend `BasePage`. Only `BasePage` has a constructor.
- **Composition for shared components** — `UserMenuComponent` and `SearchComponent` are composed into page objects that need them (`MainPage`, `PreferencesPage`).
- **Playwright fixtures** — Page objects are injected via custom fixtures in `src/fixtures/pageFixtures.ts`. Tests import `test` and `expect` from there.
- **storageState authentication** — `src/tests/setup/auth.setup.ts` runs once before the main test project, logs in via the UI, and saves the session to `.auth/user.json`. All subsequent tests reuse this session without re-logging in.
