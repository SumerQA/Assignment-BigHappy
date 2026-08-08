import { test as baseTest } from './baseFixture';
import { LoginPage      } from '../pages/Login/LoginPage';
import { ProductsPage } from '../pages/Product/ProductsPage';
import { CartPage} from '../pages/Cart/CartPage';
import { CheckoutPage } from '../pages/Checkout/CheckoutPage';


type Pages = {
  loginPage      : LoginPage;
  productsPage : ProductsPage;
  cartPage       : CartPage; 
  checkoutPage   : CheckoutPage;
};


export const test = baseTest.extend<Pages>({

  loginPage: async ({ appPage }, use) => {
    await use(new LoginPage(appPage));
  },

  productsPage: async ({ appPage }, use) => {
    await use(new ProductsPage(appPage));
  },

  cartPage: async ({ appPage }, use) => {
    await use(new CartPage(appPage));
  },  

 checkoutPage: async ({ appPage }, use) => {
    await use(new CheckoutPage(appPage));
  },
});

export { expect } from '@playwright/test';
