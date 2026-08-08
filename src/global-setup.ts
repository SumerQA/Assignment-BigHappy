import { chromium } from '@playwright/test';
import { config as appConfig } from './config/env';
import { logger } from './utils/logger';
import { SessionStorageManager } from './utils/sessionStorageManager';
import { LoginPage } from './pages/Login/LoginPage';

/**
 * Runs once before the suite to create an authenticated browser state.
 *
 * The saved state contains Playwright's native cookies/localStorage plus a
 * custom sessionStorage snapshot handled by SessionStorageManager.
 */
async function globalSetup() {
  if (SessionStorageManager.sessionExists() && process.env.FORCE_SESSION_REFRESH !== 'true') {
    logger.info(`Reusing existing session state: ${SessionStorageManager.getStateFilePath()}`);
    logger.info('Set FORCE_SESSION_REFRESH=true or delete the session file to regenerate it');
    return;
  }

  logger.info('GLOBAL SETUP: Initializing session state');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    //viewport: { width: 1920, height: 1080 },
    acceptDownloads: true
  });

  try {
    const page = await context.newPage();

    logger.info(`Navigating to: ${appConfig.baseUrl}`);
    await page.goto(appConfig.baseUrl);
    await page.waitForLoadState('domcontentloaded');
    logger.info('Page loaded successfully');

    const loginPage = new LoginPage(page);

    logger.info('Attempting login with credentials from environment');
    await loginPage.loginWithValidCredentials();
    await page.waitForURL('**/inventory.html');

    logger.info('Login completed successfully');

    await SessionStorageManager.saveSessionState(context);

    logger.info('GLOBAL SETUP COMPLETE: Session state saved and ready for tests');
    logger.info(`Session file: ${SessionStorageManager.getStateFilePath()}`);
    logger.info(`Session size: ${SessionStorageManager.getSessionFileSize()} KB`);
  } catch (error) {
    logger.error('GLOBAL SETUP FAILED');
    logger.error(`Error: ${error}`);
    throw new Error(`Global setup failed to establish session state: ${error}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
