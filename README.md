# Playwright Automation Framework- Advance

Playwright test automation framework for UI and API validation. The framework uses page objects, typed fixtures, environment-driven configuration, reusable session state, Winston logging, and HTML/JSON/Allure reporting.

## Notes for Test Strategy

- These targets and frameworks were chosen because they offer a stable, low-maintenance automation setup with Playwright, page objects, and reusable fixtures for common UI flows.
- If a flaky test appears, I would reproduce it locally, review logs and screenshots, check timing or selector issues, and identify whether the cause is environmental, data-related, or application-side.
- If the team grows from 1 QA engineer to 5, I would split the suite by feature area, improve tagging and reporting, and introduce shared utilities and CI ownership to keep maintenance scalable.

## Quick Start

Install dependencies and browsers:

```bash
npm install
npx playwright install
```

Create or update `.env`:

```ini
BASE_URL=https://your-application-url/
EMAIL=automation-user@example.com
PASSWORD=your-password
TEST_ENV=QA

# API testing configuration
API_BASE_URL=https://reqres.in
API_TOKEN=your-api-key
```

Optional email/reporting values:

```ini
EMAIL_USER=
EMAIL_PASS=
EMAIL_TO=
BUILD_BUILDNUMBER=
```

Run locally on Windows:

```bash
npm run test:local
```

`test:local` redirects Playwright temporary files to the workspace `.tmp` folder. This avoids failures when the default Windows temp/cache location is full or restricted.

## Project Structure

```text
src/
  api/                         API request helpers
  config/                      Environment and timeout configuration
  fixtures/                    Base, page, API, and download fixtures
  global-setup.ts              Creates or reuses authenticated session state
  pages/                       Page object model classes
  test-data/                   Test data files
  tests/
    api/                       API specs
    ui/                        UI specs
  utils/                       Logging, helpers, session, email, Excel utilities

playwright.config.ts           Playwright runner configuration
session-state/                 Generated auth state, git-ignored
reports/                       Generated reports and logs, git-ignored
```

## Running Tests

```bash
# Recommended local run
npm run test:local

# Standard Playwright run
npm test

# Smoke tests
npm run smoke

# Regression tests
npm run regression

# UI spec
npx playwright test src/tests/ui/testRunner.spec.ts

# API spec
npx playwright test src/tests/api/reqresApi.spec.ts

# List tests without executing them
npm run test:local -- --list
```

## Session State

The framework saves an authenticated browser state in `session-state/auth-state.json` and reuses it across tests. This reduces repeated Gmail/login interactions and makes the suite more stable.

Current behavior:

- `src/global-setup.ts` logs in and saves state only when no state file exists.
- Existing state is reused by default.
- `src/fixtures/baseFixture.ts` loads cookies/localStorage and applies saved sessionStorage before page navigation.
- Page fixtures no longer perform repeated login calls.

Refresh session state when credentials change, login expires, or authentication tests need a fresh state:

```powershell
$env:FORCE_SESSION_REFRESH='true'
npm run test:local
```

Or delete the generated state:

```bash
npm run clean:session
npm run test:local
```

## Reports And Logs

Generated outputs:

- HTML report: `reports/html/`
- JSON report: `reports/results.json`
- Summary report: `reports/summary.json`
- Logs: `reports/logs-<process-id>.log`
- Allure results: `allure-results/`

Useful commands:

```bash
npm run report
npm run allure:generate
npm run allure:open
npm run clean
npm run clean:reports
npm run clean:session
npm run clean:all
```

## Troubleshooting

### `Cannot read properties of undefined (reading 'initialize')`

This was caused by calling `SessionStorageManager.initialize()` during Playwright config loading. The config no longer imports the manager. Session initialization happens during save in `globalSetup`.

### `ENOSPC: no space left on device, write`

Use:

```bash
npm run test:local
```

This uses the workspace `.tmp` folder for Playwright temporary files.

### `EPERM` on `reports/logs.log`

The logger now writes per-process log files such as `reports/logs-12345.log`, avoiding crashes when an old log file is locked.

### Tests are not authenticated

Refresh the session:

```bash
npm run clean:session
npm run test:local
```

If login still fails, verify `.env` values and update selectors in `src/pages/Login/LoginPage.ts`.

## Maintained Documentation

- [QUICKSTART.md](./QUICKSTART.md)
- [SESSION_STORAGE_GUIDE.md](./SESSION_STORAGE_GUIDE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API_WORKFLOW.md](./API_WORKFLOW.md)


Version: 1.1.0  
Last updated: 2026-08-08 
Auther: Sumer
