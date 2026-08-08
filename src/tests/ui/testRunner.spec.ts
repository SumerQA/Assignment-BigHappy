import { test, expect } from '../../fixtures/pageFixtures';
import { logger } from '../../utils/logger';

test.describe('Assignment  Tests', () => {

  test('@smoke @regression Add specified product to cart', async ({ productsPage }) => {
    const targetProduct = 'Sauce Labs Backpack';

    logger.info('[TEST STEP 1] Verifying that the products page is ready.');
    await productsPage.CheckProductsList();

    logger.info(`[TEST STEP 2] Adding product to cart: ${targetProduct}`);
    const price = await productsPage.addProductToCart(targetProduct);
    expect(price).toBeTruthy();

    logger.info(`[TEST STEP 3] Verifying the button state for ${targetProduct} changed to Remove.`);
    await productsPage.verifyProductButtonState(targetProduct, 'Remove');
    logger.info('[TEST STEP 4] Single-product cart flow completed successfully.');
  });

  test('@smoke Login with invalid credentials shows error', async ({ loginPage }) => {
    logger.info('[TEST STEP 1] Attempting login with invalid credentials.');
    await loginPage.loginWithInvalidCredentials('locked_out_user', 'wrong_password');

    logger.info('[TEST STEP 2] Verifying the error message is displayed.');
    await loginPage.verifyErrorMessage('do not match any user');
  });

  test('@smoke Add multiple selected products to cart and checkout', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    const productsToAdd = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
    ];

    logger.info('[TEST STEP 1] Verifying that the products inventory is available.');
    await productsPage.CheckProductsList();

    logger.info(`[TEST STEP 2] Adding multiple products to cart: ${productsToAdd.join(', ')}`);
    await productsPage.addMultipleProductsToCart(productsToAdd);

    logger.info(`[TEST STEP 3] Verifying the cart badge count is ${productsToAdd.length}.`);
    await productsPage.verifyCartBadgeCount(productsToAdd.length);

    logger.info('[TEST STEP 4] Opening the cart view.');
    const isCartOpened = await cartPage.clickCartIfAvailable();
    expect(isCartOpened).toBe(true);

    logger.info('[TEST STEP 5] Reviewing cart items and proceeding to checkout.');
    await cartPage.checkItemsAddedAndProceedToCheckout();

    logger.info('[TEST STEP 6] Filling checkout customer information.');
    await checkoutPage.checkoutStep1('John', 'Doe', '12345');

    logger.info('[TEST STEP 7] Reviewing the order summary and finishing the order.');
    await checkoutPage.checkoutStep2();

    logger.info('[TEST STEP 8] Verifying the order confirmation message.');
    await checkoutPage.verifyOrderConfirmation();
    logger.info('[TEST STEP 9] Multi-product checkout flow completed successfully.');
  });

});