import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export interface CheckoutSummary {
  itemTotal: string;
  tax: string;
  total: string;
}

export class CheckoutPage {
  // Locators defined as private readonly fields
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  private readonly itemTotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;

  private readonly completeHeader: Locator;
  private readonly completeText: Locator;

  constructor(private readonly page: Page) {
    // Step 1 Locators (matching the SauceDemo checkout form attributes)
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');

    // Step 2 Locators
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');

    // Order Confirmation Locators
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
  }

  /**
   * Fills personal information and proceeds to the next step.
   */
  async checkoutStep1(firstName: string, lastName: string, postalCode: string): Promise<void> {
    try {
      logger.info('[CHECKOUT PAGE] Step 1: Filling customer information.');
      await this.firstNameInput.fill(firstName);
      logger.info(`[CHECKOUT PAGE] Entered first name: ${firstName}`);
      await this.lastNameInput.fill(lastName);
      logger.info(`[CHECKOUT PAGE] Entered last name: ${lastName}`);
      await this.postalCodeInput.fill(postalCode);
      logger.info(`[CHECKOUT PAGE] Entered postal code: ${postalCode}`);
      await this.continueButton.click();
      logger.info('[CHECKOUT PAGE] Clicked Continue to move to the next step.');
    } catch (error) {
      logger.error(`Failed to complete checkout step 1: ${error}`);
      throw error;
    }
  }

  /**
   * Reads summary amounts and completes the purchase order.
   */
  async checkoutStep2(): Promise<CheckoutSummary> {
    try {
      // Parallel extraction to speed up execution
      const [itemTotal, tax, total] = await Promise.all([
        this.itemTotalLabel.innerText(),
        this.taxLabel.innerText(),
        this.totalLabel.innerText()
      ]);

      logger.info(`[CHECKOUT PAGE] Summary - Item Total: ${itemTotal}, Tax: ${tax}, Total: ${total}`);
      logger.info('[CHECKOUT PAGE] Step 2: Clicking Finish to complete the order.');
      await this.finishButton.click();

      return { itemTotal, tax, total };
    } catch (error) {
      logger.error(`Failed to complete checkout step 2: ${error}`);
      throw error;
    }
  }

  /**
   * Asserts order confirmation messages.
   */
  async verifyOrderConfirmation(): Promise<void> {
    try {
      logger.info('[CHECKOUT PAGE] Verifying order confirmation messages.');
      await expect(this.completeHeader).toHaveText('Thank you for your order!');
      await expect(this.completeText).toHaveText(
        'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
      );

      logger.info('[CHECKOUT PAGE] Order confirmation verified successfully.');
    } catch (error) {
      logger.error(`Order confirmation verification failed: ${error}`);
      throw error;
    }
  }

  /**
   * Clicks the continue button directly if needed.
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}