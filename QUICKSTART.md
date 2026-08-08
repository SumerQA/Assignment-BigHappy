# Quick Start

## Run The Suite

Use this command for local Windows execution:

```bash
npm run test:local
```

Use this command when the default temp/cache location is healthy:

```bash
npm test
```

## Common Commands

```bash
# List discovered tests
npm run test:local -- --list

# Run smoke tests
npm run smoke

# Run regression tests
npm run regression

# Run one spec file
npx playwright test src/tests/ui/testRunner.spec.ts

# Open HTML report
npm run report
```

## Session State

The first successful authentication creates:

```text
session-state/auth-state.json
```

Later runs reuse that file. To force a fresh login:

```powershell
$env:FORCE_SESSION_REFRESH='true'
npm run test:local
```

Or remove the generated session:

```bash
npm run clean:session
npm run test:local
```

## Environment

Required `.env` values:

```ini
BASE_URL=https://your-application-url/
EMAIL=automation-user@example.com
PASSWORD=your-password
```

Optional:

```ini
TEST_ENV=QA
EMAIL_USER=
EMAIL_PASS=
EMAIL_TO=
BUILD_BUILDNUMBER=
```

## Verify The Framework Loads

```bash
npm run test:local -- --list
```

Expected result: Playwright lists the available tests without config errors.

## Verify Session Reuse

Run one smoke test after a session file exists:

```bash
npm run test:local -- --grep "@smoke Login"
```

Expected behavior: global setup reports that it is reusing the existing session state, then the test opens the application already authenticated.
