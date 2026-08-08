import { Page, Locator } from "@playwright/test";
import { logger } from "../../utils/logger";

export interface CartItem {
  name: string;
  price: string;
}

export class CartPage {
  private readonly page: Page;

  // 1. Declare locators as private readonly fields (Page Object Model Pattern)
  private readonly cartLink: Locator;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /**
   * Opens/clicks the shopping cart icon if it is visible.
   * @param timeout Optional timeout in ms (default: 5000ms)
   */
  async clickCartIfAvailable(timeout = 5000): Promise<boolean> {
    try {
      logger.info('[CART PAGE] Waiting for the shopping cart link to become visible.');
      await this.cartLink.waitFor({ state: 'visible', timeout });
      logger.info('[CART PAGE] Clicking the shopping cart link.');
      await this.cartLink.click();
      logger.info('[CART PAGE] Shopping cart link clicked successfully.');
      return true;
    } catch (error) {
      logger.warn('Shopping cart link was not available or visible within the timeout period.');
      return false;
    }
  }

  /**
   * Verifies, logs, and returns all items currently present in the cart.
   * Proceeds to click checkout if items exist.
   */
  async checkItemsAddedAndProceedToCheckout(): Promise<CartItem[]> {
    logger.info('[CART PAGE] Inspecting the cart contents.');
    const items = await this.cartItems.all();
    const itemCount = items.length;

    logger.info(`[CART PAGE] Total items found in cart: ${itemCount}`);

    if (itemCount === 0) {
      logger.warn('Shopping cart is empty. No items to verify.');
      return [];
    }

    const cartDetails: CartItem[] = [];

    // Parallel extraction for better performance instead of sequential awaits in a for-loop
    for (const [index, item] of items.entries()) {
      const name = await item.locator('.inventory_item_name').innerText();
      const price = await item.locator('.inventory_item_price').innerText();

      cartDetails.push({ name, price });
      logger.info(`Item ${index + 1}: Name - "${name}", Price - "${price}"`);
    }

    logger.info('[CART PAGE] Proceeding to checkout from the cart view.');
    await this.clickCheckoutButton();
    return cartDetails;
  }

  /**
   * Clicks the checkout button on the cart page.
   */
  async clickCheckoutButton(): Promise<void> {
    try {
      await this.checkoutButton.click();
      logger.info('Checkout button clicked successfully.');
    } catch (error) {
      logger.error(`Failed to click the checkout button: ${error}`);
      throw error;
    }
  }
}