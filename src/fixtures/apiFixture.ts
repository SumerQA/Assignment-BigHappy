import { test as base, expect } from '@playwright/test';
import { BaseApi } from '../api/BaseApi';
import { logger } from '../utils/logger';

type ApiFixture = {
  apiClient: BaseApi;
};

export const test = base.extend<ApiFixture>({
  apiClient: async ({}, use) => {
    const baseUrl = process.env.API_BASE_URL?.trim() || 'not configured';
    logger.info(`[FIXTURE] Initializing API fixture for ReqRes requests using base URL: ${baseUrl}.`);

    const apiClient = new BaseApi(baseUrl === 'not configured' ? '' : baseUrl);
    await use(apiClient);
  }
});

export { expect } from '@playwright/test';