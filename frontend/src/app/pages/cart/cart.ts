import { Component, signal, inject, computed } from '@angular/core';
import { CartService } from '@app/services/cart-service';
import { CartModelResponse } from '@app/models/cart-model';
import {Condition, ProductModel} from '@app/models/product-model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@app/services/notification-service.service';
import {WishlistService} from '@app/services/wishlist-service';
import { CartItemSkeleton } from '@app/components/cart-item-skeleton/cart-item-skeleton';
import { CartSummarySkeleton } from '@app/components/cart-summary-skeleton/cart-summary-skeleton';

type BadgeMeta = { text: string; color: string };

@Component({
  selector: 'app-cart',
  imports: [CommonModule, CartItemSkeleton, CartSummarySkeleton],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private wishlist = inject(WishlistService);

  cart = signal<CartModelResponse | undefined>(undefined);
  isLoading = signal(true);

  // Computed signal for sorted cart items
  sortedCartItems = computed(() => {
    const cartItems = this.cart()?.items || [];
    return [...cartItems].sort((a, b) => {
      // product name (alphabetically)
      const nameComparison = (a.product_name || '').localeCompare(b.product_name || '');
      if (nameComparison !== 0) {
        return nameComparison;
      }

      // seller username
      const sellerComparison = (a.seller_username || '').localeCompare(b.seller_username || '');
      if (sellerComparison !== 0) {
        return sellerComparison;
      }

      // product_id (last_resort)
      return (a.product_id || '').localeCompare(b.product_id || '');
    });
  });

  // Debouncing system
  private updateTimeouts = new Map<string, any>();
  pendingQuantities = signal<Record<string, number>>({});
  updatingProducts = signal<Set<string>>(new Set());

  /**
   * First number is product id, second number is new quantity
   */
  modifyingProduct = signal<[number, number]>([-1, -1]);
  customQtyMode = signal<Record<number, boolean>>({});

  toNumber = (v: any) => Number(v ?? 1);

  ngOnInit(): void {
    this.loadProducts();
  }

  removeFromCart(productId: string) {
    this.isLoading.set(true);
    this.cartService.removeItem(productId).subscribe({
      next: () => {
        this.cart()?.items.splice(
          this.cart()!.items.findIndex((i) => i.product_id === productId),
          1
        );
        this.loadProducts();
      },
    });
  }

  addToWishlist(productId: string) {
    this.wishlist.addToWishlist(productId).subscribe({
      next: () => {
        this.notify.showSuccess('Produit ajouté à la liste de souhaits');
        setTimeout(() => this.notify.clear(), 3000);
      },
      error: () => {
        this.notify.showError('Erreur lors de l\'ajout à la liste de souhaits');
        setTimeout(() => this.notify.clear(), 3000);
      }
    });
    this.removeFromCart(productId);
  }

  setNewQuantity(productId: string, newQuantity: number) {
    this.isLoading.set(true);
    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.cartService.setCart(cart); // sync cart in service for header
        this.modifyingProduct.set([-1, -1]);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onQuantityInputChange(event: Event, productId: string, stock: number) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);

    // Immediately show skeleton when input changes
    const updating = new Set(this.updatingProducts());
    updating.add(productId);
    this.updatingProducts.set(updating);

    if (!isNaN(value)) {
      // Ensure quantity is within valid bounds
      const clampedValue = Math.max(1, Math.min(value, stock || 999));

      // Update the input field to reflect the clamped value if it was out of bounds
      if (value !== clampedValue) {
        target.value = clampedValue.toString();
      }

      // Use debounced update
      this.debouncedQuantityUpdate(productId, clampedValue);
    } else if (isNaN(value) || value < 1) {
      // Reset to 1 if invalid input
      target.value = '1';
      this.debouncedQuantityUpdate(productId, 1);
    }
  }

  increaseQuantity(productId: string, stock: number) {
    const currentQuantity = this.getCurrentQuantity(productId);
    const maxStock = stock || 999;
    if (currentQuantity < maxStock) {
      // Immediately show skeleton when button is clicked
      const updating = new Set(this.updatingProducts());
      updating.add(productId);
      this.updatingProducts.set(updating);

      this.debouncedQuantityUpdate(productId, currentQuantity + 1);
    }
  }

  decreaseQuantity(productId: string) {
    const currentQuantity = this.getCurrentQuantity(productId);
    if (currentQuantity > 1) {
      // Immediately show skeleton when button is clicked
      const updating = new Set(this.updatingProducts());
      updating.add(productId);
      this.updatingProducts.set(updating);

      this.debouncedQuantityUpdate(productId, currentQuantity - 1);
    }
  }

  // Debounced quantity update system
  private debouncedQuantityUpdate(productId: string, newQuantity: number) {
    // Update pending quantity immediately for UI responsiveness
    const currentPending = { ...this.pendingQuantities() };
    currentPending[productId] = newQuantity;
    this.pendingQuantities.set(currentPending);

    // Clear existing timeout for this product
    const existingTimeout = this.updateTimeouts.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout - but don't capture the quantity, get it fresh when executing
    const timeout = setTimeout(() => {
      // Get the latest pending quantity at execution time, not when timeout was set
      const latestPending = this.pendingQuantities()[productId];
      if (latestPending !== undefined) {
        this.executeQuantityUpdate(productId, latestPending);
      }
    }, 800); // debounce delay

    this.updateTimeouts.set(productId, timeout);
  }

  private executeQuantityUpdate(productId: string, quantity: number) {
    // Verify we still have this quantity as pending
    const currentPending = this.pendingQuantities()[productId];
    if (currentPending === undefined || currentPending !== quantity) {
      // Remove from updating products if we're not going to update
      const updatingAfter = new Set(this.updatingProducts());
      updatingAfter.delete(productId);
      this.updatingProducts.set(updatingAfter);
      return;
    }

    // Ensure product is in updating set (it should already be there from button/input actions)
    const updating = new Set(this.updatingProducts());
    updating.add(productId);
    this.updatingProducts.set(updating);

    this.cartService.updateQuantity(productId, quantity).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.cartService.setCart(cart);

        // Clear pending quantity for this product only if it matches what we just sent
        const pending = { ...this.pendingQuantities() };
        if (pending[productId] === quantity) {
          delete pending[productId];
          this.pendingQuantities.set(pending);
        }

        // Remove from updating products
        const updatingAfter = new Set(this.updatingProducts());
        updatingAfter.delete(productId);
        this.updatingProducts.set(updatingAfter);

        // Clear timeout
        this.updateTimeouts.delete(productId);
      },
      error: (error) => {
        console.error('Error updating quantity:', error);

        // Remove from updating products on error
        const updatingAfter = new Set(this.updatingProducts());
        updatingAfter.delete(productId);
        this.updatingProducts.set(updatingAfter);

        // Don't clear pending quantity on error - let user retry
        // const pending = { ...this.pendingQuantities() };
        // delete pending[productId];
        // this.pendingQuantities.set(pending);

        this.updateTimeouts.delete(productId);

        // Show error notification
        this.notify.showError('Erreur lors de la mise à jour de la quantité');
        setTimeout(() => this.notify.clear(), 3000);
      }
    });
  }

  // Helper methods
  getCurrentQuantity(productId: string): number {
    // Return pending quantity if exists, otherwise current cart quantity
    const pending = this.pendingQuantities()[productId];
    if (pending !== undefined) {
      return pending;
    }

    const currentItem = this.cart()?.items?.find(item => item.product_id === productId);
    return currentItem ? this.toNumber(currentItem.quantity) : 1;
  }

  isProductUpdating(productId: string): boolean {
    return this.updatingProducts().has(productId);
  }

  getDisplayQuantity(productId: string): number {
    return this.getCurrentQuantity(productId);
  }

  hasUpdatingProducts(): boolean {
    return this.updatingProducts().size > 0;
  }

  loadProducts() {
    this.cartService.allProducts().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.cartService.setCart(cart); // sync cart in service for header
        this.syncCustomQtyMode(cart.items || []);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  optionsFor(stock: number, cap = 10): number[] {
    const s = Math.max(1, Number(stock ?? 1));
    return Array.from({ length: Math.min(s, cap) }, (_, i) => i + 1);
  }

  itemsCount(): number {
    return this.cart()?.items?.length ?? 0;
  }

  isFreeShipping(): boolean {
    return this.cart()?.shipping_total == 0.0;
  }

  goCheckout() {
    this.router.navigate(['/payment']);
  }
  viewProduct(id: string) {
    this.router.navigate(['/products', id]);
  }

  // custom number input for quantity
  private syncCustomQtyMode(items: CartModelResponse['items'] = []) {
    const map: Record<number, boolean> = {};
    for (const it of items ?? []) {
      if ((it.quantity ?? 0) > 10) {
        map[Number(it.product_id)] = true;
      }
    }
    this.customQtyMode.set(map);
  }
  isCustomQty(productId: string): boolean {
    return this.customQtyMode()[Number(productId)];
  }

  setCustomQtyMode(productId: string, on: boolean): void {
    const next = { ...this.customQtyMode() };
    next[Number(productId)] = on;
    this.customQtyMode.set(next);
  }

  submitCustomQty(productId: string, value: string | number, stock: number): void {
    const max = Number(stock ?? Infinity);
    let n = this.toNumber(value);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (Number.isFinite(max)) n = Math.min(n, max);

    this.setNewQuantity(productId, n);
    this.setCustomQtyMode(productId, n > 10); // ← ZOSTAŃ W INPUT, JEŚLI > 10
  }
  // end custom number input for quantity
  displayCondition(condition: string) {
    return Condition[condition] || 'inconnu';
  }
}
