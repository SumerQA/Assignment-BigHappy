import { test as base, request, APIRequestContext } from '@playwright/test';
import { logger } from '../utils/logger';

type ApiFixture = {
  apiContext: APIRequestContext;
  authToken: string;
};

export const test = base.extend<ApiFixture>({

  authToken: async ({}, use) => {
    logger.info('Generating OAuth Token...');

    const authContext = await request.newContext();

    const response = await authContext.post(
      `${process.env.AUTH_BASE_URL}/oauth/token`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      }
    );

    if (!response.ok()) {
      throw new Error(
        `Token generation failed. Status: ${response.status()}`
      );
    }

    const tokenResponse = await response.json();
    const token = tokenResponse.access_token;

    logger.info('OAuth Token generated successfully');

    await authContext.dispose();
    await use(token);
  },

  apiContext: async ({ authToken }, use) => {
    logger.info(
      `Initializing API Context with base URL: ${process.env.API_BASE_URL}`
    );

    const apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    await use(apiContext);

    await apiContext.dispose();
  }
});

export { expect } from '@playwright/test';