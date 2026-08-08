import { Page, Locator, expect } from "@playwright/test";
import { config as appConfig } from  '../../config/env';
import { logger } from '../../utils/logger';


export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginBtn: Locator;
 

  constructor(page: Page) {
    this.page = page;    
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginBtn = page.locator('[data-test="login-button"]');
    }

  async navigate(url: string): Promise<void> {
    logger.info(`Navigating to URL: ${url}`);
    try {
      await this.page.goto(url);
      await this.page.waitForLoadState('domcontentloaded');
      logger.info('Navigation successful');
    } catch (error) {
      logger.error(`Navigation failed: ${error}`);
      throw error;
    }
  }

  async loginWithValidCredentials(): Promise<void> {
    logger.info(`Attempting login with username: ${appConfig.userName}`);
    try {
      await this.usernameInput.click();
      await this.usernameInput.fill(appConfig.userName);
      logger.info('Email filled');

      await this.passwordInput.click();
      await this.passwordInput.fill(appConfig.password);
      logger.info('Password filled');

      await this.loginBtn.click();
      logger.info('Login button clicked');
    } catch (error) {
      logger.error(`Login failed: ${error}`);
      throw error;
    }
  }

  async loginWithInvalidCredentials(username: string, password: string): Promise<void> {
    logger.info(`Attempting login with invalid credentials for username: ${username}`);
    try {
      await this.usernameInput.click();
      await this.usernameInput.fill(username);
      logger.info('Email filled');

      await this.passwordInput.click();
      await this.passwordInput.fill(password);
      logger.info('Password filled');

      await this.loginBtn.click();
      logger.info('Login button clicked');
    } catch (error) {
      logger.error(`Invalid login attempt failed: ${error}`);
      throw error;
    }
  }

  async verifyErrorMessage(expectedText: string): Promise<void> {
    logger.info(`Verifying login error message contains: ${expectedText}`);
    try {
      await expect(this.page.locator('[data-test="error"]')).toContainText(expectedText);
    } catch (error) {
      logger.error(`Error message verification failed: ${error}`);
      throw error;
    }
  }

  async verifyUserLoggedIn(): Promise<void> {
    logger.info('Verifying user is on Products Page...');
    try {
      await expect(this.page).toHaveURL(/SetSID|dashboard|joborders/);
    } catch (error) {
      logger.error(`User verification failed: ${error}`);
      throw error;
    }
  }
 
}
