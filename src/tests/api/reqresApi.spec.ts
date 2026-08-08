import { test, expect } from '../../fixtures/apiFixture';
import { logger } from '../../utils/logger';

test.describe('Assignment - ReqRes API CRUD tests', () => {
  test('@smoke @regression GET list users returns success', async ({ apiClient }) => {
    logger.info('[TEST STEP 1] Starting ReqRes GET list users test.');
    logger.info('[TEST STEP 2] Sending GET request to retrieve the users list.');

    const response = await apiClient.get('/users?page=2');
    logger.info(`[TEST STEP 3] Received response with status ${response.status()} for GET /users?page=2.`);

    expect(response.status()).toBe(200);

    logger.info('[TEST STEP 4] Validating the response payload structure.');
    const body = await response.json() as { page: number; data: unknown[] };
    expect(body).toHaveProperty('page', 2);
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('@regression POST create user returns created user', async ({ apiClient }) => {
    logger.info('[TEST STEP 1] Starting ReqRes POST create user test.');
    logger.info('[TEST STEP 2] Preparing the payload for user creation.');

    const payload = {
      name: 'morpheus',
      job: 'leader'
    };

    logger.info('[TEST STEP 3] Sending POST request to create the user.');
    const response = await apiClient.post('/users', payload);
    logger.info(`[TEST STEP 4] Received response with status ${response.status()} for POST /users.`);

    expect(response.status()).toBe(201);

    logger.info('[TEST STEP 5] Validating the created user response body.');
    const body = await response.json() as { name: string; job: string };
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
  });

  test('@regression PUT update user returns updated user', async ({ apiClient }) => {
    logger.info('[TEST STEP 1] Starting ReqRes PUT update user test.');
    logger.info('[TEST STEP 2] Preparing the payload for user update.');

    const payload = {
      name: 'morpheus',
      job: 'zion resident'
    };

    logger.info('[TEST STEP 3] Sending PUT request to update the user.');
    const response = await apiClient.put('/users/2', payload);
    logger.info(`[TEST STEP 4] Received response with status ${response.status()} for PUT /users/2.`);

    expect(response.status()).toBe(200);

    logger.info('[TEST STEP 5] Validating the updated user response body.');
    const body = await response.json() as { name: string; job: string };
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
  });

  test('@regression DELETE user returns success', async ({ apiClient }) => {
    logger.info('[TEST STEP 1] Starting ReqRes DELETE user test.');
    logger.info('[TEST STEP 2] Sending DELETE request to remove the user.');

    const response = await apiClient.delete('/users/2');
    logger.info(`[TEST STEP 3] Received response with status ${response.status()} for DELETE /users/2.`);

    expect(response.status()).toBe(204);
  });
});
