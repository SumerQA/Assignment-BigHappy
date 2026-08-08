# Session Storage Guide

## Purpose

The framework uses a generated browser state file to avoid logging in before every test. This is important for SSO-style login flows because repeated login attempts are slow and can become unreliable.

## Files Involved

| File | Purpose |
|------|---------|
| `src/global-setup.ts` | Creates or reuses the authenticated session before tests run |
| `src/utils/sessionStorageManager.ts` | Saves, loads, clears, and applies browser state |
| `src/fixtures/baseFixture.ts` | Creates each browser context with saved state |
| `src/fixtures/pageFixtures.ts` | Provides page objects without repeated login calls |
| `session-state/auth-state.json` | Generated session file, ignored by Git |

## What Gets Saved

Playwright's native `storageState` saves:

- Cookies
- localStorage

This framework also captures sessionStorage separately and restores it with `context.addInitScript()` before the page loads.

The generated file shape is:

```json
{
  "storageState": {
    "cookies": [],
    "origins": []
  },
  "sessionStorage": [
    {
      "origin": "https://example.com",
      "values": {}
    }
  ]
}
```

## Runtime Flow

1. Playwright loads `playwright.config.ts`.
2. Playwright runs `src/global-setup.ts`.
3. If `session-state/auth-state.json` exists and `FORCE_SESSION_REFRESH` is not `true`, setup reuses it.
4. If no session exists, setup opens Chromium, logs in through `LoginPage`, and saves state.
5. Each test context loads cookies/localStorage from `storageState`.
6. The base fixture registers an init script to restore sessionStorage for matching origins.
7. Tests navigate to `BASE_URL` already authenticated.

## Refreshing State

Use a refresh when the session expires, credentials change, or login behavior needs to be retested.

PowerShell:

```powershell
$env:FORCE_SESSION_REFRESH='true'
npm run test:local
```

Or:

```bash
npm run clean:session
npm run test:local
```

## Important Notes

- Do not commit `session-state/`; it contains authentication cookies/tokens.
- Do not share `auth-state.json` between users or machines.
- The session file does not store the plain-text password, but it is still sensitive.
- `npm run clean` removes test output only. Use `npm run clean:session` when you need to remove the auth state.
- Repeated login calls were removed from page fixtures. Tests should depend on authenticated fixtures instead.

## Troubleshooting

### Session file missing

Run:

```bash
npm run test:local
```

The session file is generated after a successful global setup login.

### Login fails in global setup

Check:

- `.env` has `BASE_URL`, `EMAIL`, and `PASSWORD`.
- The application login page is reachable.
- Selectors in `src/pages/Login/LoginPage.ts` still match the live login flow.

### Tests open login page instead of dashboard

Refresh the session:

```bash
npm run clean:session
npm run test:local
```

If the issue remains, the application may require additional storage state or the saved session may not be valid for the target environment.

### Playwright cannot write transform cache

Use:

```bash
npm run test:local
```

This uses `.tmp` inside the workspace for temporary files.
