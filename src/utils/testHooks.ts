import { test } from '@playwright/test';
import { logger } from './logger';

/**
 * Hook: Run after each test for cleanup and reporting
 */
export const attachTestTeardown = () => {
  test.afterEach(async ({ page }, testInfo) => {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`Test: ${testInfo.title} | Status: ${testInfo.status}`);
    logger.info(`Duration: ${testInfo.duration}ms`);

    if (testInfo.status !== 'passed') {
      logger.warn(`Test failed or skipped`);

      // Capture screenshot on failure
      if (page && !page.isClosed()) {
        try {
          const screenshot = await page.screenshot();
          await testInfo.attach(`failure-screenshot-${Date.now()}`, {
            body: screenshot,
            contentType: 'image/png'
          });
          logger.info('✓ Failure screenshot attached to report');
        } catch (error) {
          logger.error(`Failed to capture screenshot: ${error}`);
        }
      }
    }

    logger.info(`${'='.repeat(60)}\n`);
  });
};

/**
 * Hook: Run before each test for initialization
 */
export const attachTestSetup = () => {
  test.beforeEach(async ({ page }, testInfo) => {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`Starting Test: ${testInfo.title}`);
    logger.info(`${'='.repeat(60)}\n`);
  });
};
