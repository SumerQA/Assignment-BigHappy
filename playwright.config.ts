import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  timeout: 60000,
  testDir: './src/tests',
  retries: 2,
  fullyParallel: false,
  
  // Global setup runs once before all tests to establish authenticated session
  globalSetup: require.resolve('./src/global-setup.ts'),
 
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['./src/utils/emailReporter.ts'],
    ['allure-playwright'],
    ['list']
  ],
  use: {
    headless: false,
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { 
      name: 'Chromium',
      use: { 
        ...devices['Desktop Chrome']
      }
    },
    //{ name: 'Firefox', use: { ...devices['Desktop Firefox'] }},
   // { name: 'WebKit', use: { ...devices['Desktop Safari'] }}
  ],
 // globalTeardown: './globalTeardown.ts'
});
