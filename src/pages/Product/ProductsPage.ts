import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";
import { LoginPage } from "../Login/LoginPage";

export class ProductsPage{
  page: Page;
  private readonly loadingOverlay: Locator; 
  
  constructor(page: Page) {
    this.page = page;
    this.loadingOverlay = page.locator(".ag-overlay-loading-wrapper");    
  }
  
  async CheckProductsList(): Promise<void> {
    try {
      logger.info('[PRODUCT PAGE] Checking whether the Products page is visible.');
      const isMatching = await this.page.getByText('Products', { exact: true }).isVisible();
      if (!isMatching) {
        logger.info('[PRODUCT PAGE] Products page not visible; logging in with valid credentials.');
        const loginPage = new LoginPage(this.page);
        await loginPage.loginWithValidCredentials();
      }
      const count = await this.page.locator('div.inventory_item').count();
      logger.info(`[PRODUCT PAGE] Total inventory items found: ${count}`);
    } catch (error) {
      logger.error(`Failed to select product(s): ${error}`);
      throw error;
    }  
  }

  async addProductToCart(productName: string): Promise<string> {
    logger.info(`[PRODUCT PAGE] Locating product card for: ${productName}`);
    const productCard = await this.page.locator('.inventory_item').filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });

    const priceText = await productCard.locator('.inventory_item_price').innerText();
    logger.info(`[PRODUCT PAGE] Product: "${productName}" | Price: ${priceText}`);

    await productCard.getByRole('button', { name: 'Add to cart' }).click();
    logger.info(`[PRODUCT PAGE] Clicked Add to cart for: ${productName}`);

    return priceText;
  }

  async addProductsToCart(page: Page, productName: string): Promise<string> {
  logger.info(`[PRODUCT PAGE] Adding product to cart: ${productName}`);
  const productCard = await page.locator('.inventory_item').filter({
    has: page.locator('.inventory_item_name', { hasText: productName })
  });

  const priceText = await productCard.locator('.inventory_item_price').innerText();
  logger.info(`[PRODUCT PAGE] Product: "${productName}" | Price: ${priceText}`);

  await productCard.getByRole('button', { name: 'Add to cart' }).click();
  logger.info(`[PRODUCT PAGE] Clicked Add to cart for: ${productName}`);

  await expect(productCard.getByRole('button')).toHaveText('Remove');
  logger.info(`[PRODUCT PAGE] Verified button state for ${productName} is Remove.`);

  return priceText;
}

  async verifyProductButtonState(productName: string, expectedState: string): Promise<void> {
    logger.info(`[PRODUCT PAGE] Verifying button state for ${productName} is ${expectedState}.`);
    const productCard = this.page.locator('.inventory_item').filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });

    await expect(productCard.getByRole('button')).toHaveText(expectedState);
  }

  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    logger.info(`[PRODUCT PAGE] Verifying cart badge count is ${expectedCount}.`);
    if (expectedCount > 0) {
      await expect(this.page.locator('.shopping_cart_badge')).toHaveText(String(expectedCount));
    } else {
      await expect(this.page.locator('.shopping_cart_badge')).toHaveCount(0);
    }
  }

  async addMultipleProductsToCart(productNames: string[], page?: Page): Promise<void> {
    const targetPage = page ?? this.page;
    logger.info(`[PRODUCT PAGE] Starting batch add for ${productNames.length} products.`);
    for (const productName of productNames) {
      await this.addProductsToCart(targetPage, productName);
    }
    logger.info('[PRODUCT PAGE] Finished batch add for all selected products.');
  }
}

   