import { test, expect } from '@playwright/test';
import { logger } from '../../utils/logger';
import { BaseApi } from '../../api/BaseApi';

test.describe('Assignment- ReqRes API CRUD tests', () => {
  const api = new BaseApi();

  test('@smoke @regression GET list users returns success', async () => {
    logger.info('Starting ReqRes GET list users test');

    // Verify the public endpoint returns the expected list response.
    const response = await api.get('/users?page=2');
    logger.info(`GET /users?page=2 responded with status ${response.status()}`);
    expect(response.status()).toBe(200);
    const body = await response.json() as { page: number; data: unknown[] };
    expect(body).toHaveProperty('page', 2);
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('@regression POST create user returns created user', async () => {
    logger.info('Starting ReqRes POST create user test');

    // Create a new user payload and confirm the API returns the created resource.
    const payload = {
      name: 'morpheus',
      job: 'leader'
    };

    const response = await api.post('/users', payload);    
    logger.info(`POST /users responded with status ${response.status()}`);
    expect(response.status()).toBe(201);
    const body = await response.json() as { name: string; job: string };
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
  });

  test('@regression PUT update user returns updated user', async () => {
    logger.info('Starting ReqRes PUT update user test');

    // Update an existing user and validate that the returned values match.
    const payload = {
      name: 'morpheus',
      job: 'zion resident'
    };

    const response = await api.put('/users/2', payload);
    logger.info(`PUT /users/2 responded with status ${response.status()}`);
    expect(response.status()).toBe(200);

    const body = await response.json() as { name: string; job: string };
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
  });

  test('@regression DELETE user returns success', async () => {
    logger.info('Starting ReqRes DELETE user test');

    // Confirm the delete endpoint responds successfully.
    const response = await api.delete('/users/2');
    logger.info(`DELETE /users/2 responded with status ${response.status()}`);
    expect(response.status()).toBe(204);
  });
});
