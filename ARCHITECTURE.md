# Architecture

## Test Runner Flow

```text
npm run test:local
  |
  |-- playwright.config.ts
  |     |-- loads environment config
  |     |-- registers globalSetup
  |     |-- defines Chromium project
  |
  |-- src/global-setup.ts
  |     |-- reuse session-state/auth-state.json when available
  |     |-- or login and save a new session
  |
  |-- src/fixtures/baseFixture.ts
  |     |-- load storageState
  |     |-- create BrowserContext
  |     |-- apply sessionStorage init script
  |     |-- create appPage and navigate to BASE_URL
  |
  |-- src/fixtures/pageFixtures.ts
        |-- provide page object instances
        |-- no repeated login calls
```

## Main Components

### `playwright.config.ts`

Owns runner settings:

- `testDir: './src/tests'`
- `globalSetup: require.resolve('./src/global-setup.ts')`
- HTML, JSON, email, Allure, and list reporters
- Chromium project
- trace/screenshot/video retention on failure

### `src/global-setup.ts`

Creates session state only when needed.

Decision logic:

```text
if auth-state.json exists and FORCE_SESSION_REFRESH is not true
  reuse existing state
else
  launch Chromium
  navigate to BASE_URL
  perform login
  save browser state
```

### `src/utils/sessionStorageManager.ts`

Core API:

```text
saveSessionState(context)
loadSessionState()
applySessionStorage(context)
sessionExists()
clearSessionState()
getStateFilePath()
getSessionFileSize()
```

`loadSessionState()` returns the Playwright-compatible `storageState`. `applySessionStorage()` restores custom sessionStorage entries before page scripts execute.

### `src/fixtures/baseFixture.ts`

Creates the browser context for each test:

```text
load saved storage state
browser.newContext({ storageState })
apply sessionStorage
context.newPage()
navigate to BASE_URL
```

### `src/fixtures/pageFixtures.ts`

Builds page objects on top of `appPage`. Authentication is handled by state restoration, so page fixtures should not call `login()` unless a test is explicitly validating login behavior.

## Generated Outputs

```text
session-state/auth-state.json       generated auth state, git-ignored
reports/html/                       Playwright HTML report
reports/results.json                Playwright JSON report
reports/summary.json                custom email summary
reports/logs-<pid>.log              Winston logs
allure-results/                     Allure result files
.tmp/                               local Playwright temp/cache files
```

## Security Boundary

`session-state/auth-state.json` is sensitive because it contains authenticated cookies and tokens. It is ignored by Git and should stay local to the machine that generated it.
