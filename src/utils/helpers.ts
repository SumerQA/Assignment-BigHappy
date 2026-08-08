import { Page, Locator } from "@playwright/test";
import { TIMEOUTS } from "../config/timeouts";
import { logger } from "./logger";

export class Helpers {

  /**
   * Random wait between 500ms and 2500ms
   */
  static async randomWait(page: Page): Promise<void> {
    const delay = Math.floor(Math.random() * 2000) + 5000;
    logger.info(`Random wait: ${delay}ms`);
    await page.evaluate((ms) => new Promise(resolve => setTimeout(resolve, ms)), delay);
  }

  /**
   * Drag element horizontally by specified offset
   */
  static async dragHorizontally(
    locator: Locator,
    offset: number,
    page: Page
  ): Promise<void> {
    logger.info(`Dragging element horizontally by ${offset}px`);

    const box = await locator.boundingBox();
    if (!box) {
      logger.error('Element bounding box not found');
      return;
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + offset, box.y);
    await page.mouse.up();
    logger.info('✓ Horizontal drag completed');
  }

  /**
   * Select value from dropdown by text
   */
  static async selectByTextDDList(
    page: Page,
    dropdown: Locator,
    value: string
  ): Promise<void> {
    logger.info(`Selecting dropdown value: "${value}"`);

    await dropdown.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await dropdown.click();

    const option = page.getByRole('option', { name: value }).first();
    await option.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await option.click();
    logger.info(`✓ Selected "${value}" from dropdown`);
  }

  /**
   * Fill form input field with value
   */
  static async fillInput(
    locator: Locator,
    value: string,
    fieldName: string = 'Input'
  ): Promise<void> {
    logger.info(`Filling ${fieldName} with value: "${value}"`);
    try {
      await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
      await locator.clear();
      await locator.fill(value);
      logger.info(`✓ ${fieldName} filled successfully`);
    } catch (error) {
      logger.error(`Failed to fill ${fieldName}: ${error}`);
      throw error;
    }
  }

  /**
   * Click element and wait for navigation
   */
  static async clickAndWaitForNavigation(
    page: Page,
    locator: Locator,
    urlPattern?: RegExp
  ): Promise<void> {
    logger.info('Clicking element and waiting for navigation');
    try {
      // Use Promise.all to handle click and navigation simultaneously
      await Promise.all([
        page.waitForLoadState('networkidle'),
        locator.click()
      ]);

      if (urlPattern) {
        await page.waitForURL(urlPattern, { timeout: TIMEOUTS.URL_WAIT });
      }
      logger.info('✓ Navigation completed');
    } catch (error) {
      logger.error(`Navigation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get text content from element
   */
  static async getElementText(locator: Locator, elementName: string = 'Element'): Promise<string> {
    logger.info(`Getting text from ${elementName}`);
    try {
      await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
      const text = await locator.textContent();
      logger.info(`✓ Got text: "${text}"`);
      return text || '';
    } catch (error) {
      logger.error(`Failed to get text from ${elementName}: ${error}`);
      throw error;
    }
  }

  /**
   * Get attribute value from element
   */
  static async getElementAttribute(
    locator: Locator,
    attributeName: string,
    elementName: string = 'Element'
  ): Promise<string | null> {
    logger.info(`Getting attribute "${attributeName}" from ${elementName}`);
    try {
      await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
      const value = await locator.getAttribute(attributeName);
      logger.info(`✓ Got attribute value: "${value}"`);
      return value;
    } catch (error) {
      logger.error(`Failed to get attribute from ${elementName}: ${error}`);
      throw error;
    }
  }

  /**
   * Switch to iframe and return frame object
   */
  static async switchToFrame(page: Page, frameSelector: string): Promise<any> {
    logger.info(`Switching to iframe: ${frameSelector}`);
    try {
      const frameLocator = page.frameLocator(frameSelector);
      logger.info(' Switched to iframe');
      return frameLocator;
    } catch (error) {
      logger.error(`Failed to switch to iframe: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for element to be enabled
   */
  static async waitForEnabled(
    locator: Locator,
    elementName: string = 'Element'
  ): Promise<void> {
    logger.info(`Waiting for ${elementName} to be enabled`);
    try {
      await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_ENABLED });
      await locator.isEnabled();
      logger.info(`✓ ${elementName} is enabled`);
    } catch (error) {
      logger.error(`${elementName} did not become enabled: ${error}`);
      throw error;
    }
  }

  /**
   * Upload file to input
   */
  static async uploadFile(locator: Locator, filePath: string): Promise<void> {
    logger.info(`Uploading file: ${filePath}`);
    try {
      await locator.setInputFiles(filePath);
      logger.info('✓ File uploaded successfully');
    } catch (error) {
      logger.error(`File upload failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get count of elements matching selector
   */
  static async getElementCount(locator: Locator): Promise<number> {
    logger.info('Getting element count');
    try {
      const count = await locator.count();
      logger.info(`✓ Found ${count} elements`);
      return count;
    } catch (error) {
      logger.error(`Failed to get element count: ${error}`);
      throw error;
    }
  }

  /**
   * Scroll element into view
   */
  static async scrollIntoView(locator: Locator, elementName: string = 'Element'): Promise<void> {
    logger.info(`Scrolling ${elementName} into view`);
    try {
      await locator.scrollIntoViewIfNeeded();
      logger.info(`✓ ${elementName} scrolled into view`);
    } catch (error) {
      logger.error(`Failed to scroll ${elementName}: ${error}`);
      throw error;
    }
  }

  /**
   * Hover over element
   */
  static async hover(locator: Locator, elementName: string = 'Element'): Promise<void> {
    logger.info(`Hovering over ${elementName}`);
    try {
      await locator.hover();
      logger.info(`✓ Hovered over ${elementName}`);
    } catch (error) {
      logger.error(`Failed to hover over ${elementName}: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for specific time (in milliseconds)
   */
  static async wait(milliseconds: number): Promise<void> {
    logger.info(`Waiting ${milliseconds}ms`);
    const delay = milliseconds || TIMEOUTS.MEDIUM_WAIT;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Take screenshot for debugging
   */
  static async takeScreenshot(page: Page, fileName: string): Promise<void> {
    logger.info(`Taking screenshot: ${fileName}`);
    try {
      await page.screenshot({ path: `reports/screenshots/${fileName}.png` });
      logger.info('✓ Screenshot saved');
    } catch (error) {
      logger.error(`Screenshot failed: ${error}`);
    }
  }
}