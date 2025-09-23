import { Routes } from '@angular/router';
import { Home } from '@app/pages/home/home';
import { Cart } from '@app/pages/cart/cart';
import { Authentification } from '@app/pages/authentification/authentification';
import { Payment } from '@app/pages/payment/payment';
import { authInGuard, authOutGuard } from './guards/auth-guard';
import { Account } from './pages/account/account';
import { ProductList } from '@app/pages/product-list/product-list';
import { VendorComponent } from '@app/pages/vendor/vendor';
import { ProductDetailsComponent } from '@app/pages/product-details/product-details';
import { Checkout } from './pages/checkout/checkout';
import { CheckoutSuccess } from './pages/checkout-success/checkout-success';
import { Wishlist } from './pages/wishlist/wishlist';
import { Policy } from './pages/footer/policy/policy';
import { Shipping } from './pages/footer/shipping/shipping';
import { Terms } from './pages/footer/terms/terms';
import { InventoryConflict } from './pages/inventory-conflict/inventory-conflict';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'policy', component: Policy },
  { path: 'shipping', component: Shipping },
  { path: 'terms', component: Terms },
  { path: 'cart', component: Cart, canActivate: [authInGuard] },
  { path: 'authentification', component: Authentification, canActivate: [authOutGuard] },
  { path: 'account', component: Account, canActivate: [authInGuard] },
  { path: 'payment', component: Payment, canActivate: [authInGuard] },
  { path: 'inventory-conflict', component: InventoryConflict, canActivate: [authInGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authInGuard] },
  { path: 'checkout-success', component: CheckoutSuccess, canActivate: [authInGuard] },
  { path: 'wishlist', component: Wishlist, canActivate: [authInGuard] },
  { path: 'products', component: ProductList },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'sell', component: VendorComponent, canActivate: [authInGuard] },
  // {path: "**", redirectTo: ""}
];
