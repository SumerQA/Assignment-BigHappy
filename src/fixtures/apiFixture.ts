import { test as base, expect } from '@playwright/test';
import { BaseApi } from '../api/BaseApi';
import { logger } from '../utils/logger';

type ApiFixture = {
  apiClient: BaseApi;
};

export const test = base.extend<ApiFixture>({
  apiClient: async ({}, use) => {
    logger.info('[FIXTURE] Initializing API fixture for ReqRes requests.');

    const apiClient = new BaseApi(process.env.API_BASE_URL?.trim() || '');
    await use(apiClient);
  }
});

export { expect } from '@playwright/test';