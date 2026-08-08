import { test as base, BrowserContext, Page } from '@playwright/test';
import { config } from '../config/env';
import { LoginPage } from '../pages/Login/LoginPage';
import { logger } from '../utils/logger';
import { SessionStorageManager } from '../utils/sessionStorageManager';

type BaseFixtures = {
  context: BrowserContext;
  appPage: Page;
};

const SUPPRESSED_BROWSER_ERROR_PATTERNS = [
  /Failed to load resource: the server responded with a status of 401 \(Unauthorized\)/i,
  /events\.backtrace\.io/i,
];

const shouldSuppressBrowserConsoleError = (message: string): boolean => {
  return SUPPRESSED_BROWSER_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

export const test = base.extend<BaseFixtures>({
  context: async ({ browser }, use) => {
    const storageState = SessionStorageManager.loadSessionState();

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      acceptDownloads: true,
      ...(storageState && { storageState })
    });

    if (storageState) {
      await SessionStorageManager.applySessionStorage(context);
      logger.debug('Context initialized with saved session state');
    } else {
      logger.warn('No saved session state found - context created without authentication');
    }

    await use(context);
    await context.close();
  },

  appPage: async ({ context }, use) => {
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!shouldSuppressBrowserConsoleError(message)) {
          logger.warn(`Browser console error: ${message}`);
        }
      }
    });

    page.on('pageerror', (error) => {
      logger.error(`Page error: ${error.message}`);
    });

    const login = new LoginPage(page);
    await login.navigate(config.baseUrl);

    await use(page);
  }
});

export { expect } from '@playwright/test';
