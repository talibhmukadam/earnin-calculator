# EarnIn Financial Calculator Tests

End-to-end regression and analytics coverage for the EarnIn financial calculator experience, implemented with Playwright and TypeScript. The suite exercises the public `https://www.earnin.com` site to guarantee that the calculator list renders, the budget calculator flows work, analytics events fire as expected, and key layouts stay visually stable on desktop and mobile form factors.

## Prerequisites

- Node.js 18 or later (Playwright supports 18/20/22; use `nvm` if you manage multiple versions).
- npm 9+ (ships with recent Node releases).
- Browsers installed via Playwright (`npx playwright install`).

> 💡 The tests hit the production EarnIn site. Ensure you are on a stable network and that outbound HTTPS requests are allowed from your environment.

## Setup

```bash
npm install
npx playwright install
```

The first command installs all TypeScript, Playwright, and AJV dependencies. The second grabs the Chromium and WebKit builds required by the configured projects.

## Running Tests

- `npm test` &ndash; run the entire suite headlessly.
- `npm run test:headed` &ndash; execute tests with browser UIs for debugging.
- `npx playwright test tests/analytics.spec.ts` &ndash; focus on analytics instrumentation scenarios.
- `npx playwright test tests/snapshots.spec.ts` &ndash; run only the visual regression checks.

Playwright HTML reports are stored in `playwright-report/`. To inspect the latest run:

```bash
npm run test:report
```

### Targeting Specific Tests

- Use `-g "<title>"` to match a test/describe block: `npx playwright test -g "Budget calculator analytics"`.
- Override the base URL for non-production environments: `npx playwright test --base-url=https://staging.earnin.com`.

### Updating Baseline Snapshots

Visual baselines live under `tests/snapshots.spec.ts-snapshots/`. After verifying UI changes manually, refresh the snapshots:

```bash
npx playwright test tests/snapshots.spec.ts --update-snapshots
```

Commit the updated PNGs to keep CI green.

## Project Structure

- `components/` &ndash; Page Object Model building blocks (`atoms`, `molecules`, `organisms`, `templates`, and page classes) used by higher-level keywords.
- `keywords/` &ndash; Business-centric actions that stitch page objects together (`openFinancialCalculatorsList`, `populateBudgetCalculator`, etc.), executed with a shared `KeywordContext`.
- `tests/` &ndash; Playwright specs covering analytics validation (`analytics.spec.ts`) and cross-device visual regression (`snapshots.spec.ts`) plus utility helpers.
- `testData/` &ndash; Static fixtures, such as income and ZIP inputs for the budget calculator.
- `constants/` &ndash; Shared analytics event names and property expectations.
- `i18n/` &ndash; Minimal string catalog used to locate UI elements consistently.
- `playwright.config.ts` &ndash; Global Playwright configuration (base URL, reporters, browser projects, snapshot templates).

GitHub Actions is configured in `.github/workflows/playwright.yml` to run the suite in CI using the same defaults.

## Debugging Tips

- Use `--headed --debug` to pause on failures and open Playwright Inspector.
- Capture traces or videos from `test-results/` (enabled on first retry) to analyze flaky behaviour.
- When analytics expectations fail, inspect `tests/utils/segmentTracker.ts` output by inserting `console.log(tracker.events)` inside the spec. Just make sure to remove ad-hoc logging before committing.

## Extending the Suite

1. Add new selectors or interactions to the relevant component atom/molecule/template so they stay reusable.
2. Capture business logic in a keyword to keep specs concise.
3. Prefer validating analytics payloads with AJV schemas (see `tests/analytics.spec.ts` for examples).
4. Update snapshots for any intentional UI changes as part of the same commit.

Following this layering keeps the tests maintainable and aligned with the structure of the EarnIn experience.
