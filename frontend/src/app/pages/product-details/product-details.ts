import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category, Condition, DeliveryMode, ProductModel } from '@app/models/product-model';
import { ProductsService } from '@app/services/products-service';
import { NotificationService } from '@app/services/notification-service.service';
import { CartService } from '@app/services/cart-service';
import { WishlistService } from '@app/services/wishlist-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { take } from 'rxjs/internal/operators/take';
import { LocalAuthService } from '@app/services/local-auth-service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
})
export class ProductDetailsComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private notify = inject(NotificationService);
  private cartService = inject(CartService);
  private localAuth = inject(LocalAuthService)

  wishlisted = signal<boolean|undefined>(undefined);

  // Add loading signals for different actions
  isAddingToCart = signal(false);
  isBuyingNow = signal(false);
  isTogglingWishlist = signal(false);

  product = signal<ProductModel | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  quantity = signal(1);
  totalPrice = computed(() => {
    const currentProduct = this.product();
    if (currentProduct === null) return 0;
    return currentProduct.price * this.quantity();
  });

  isUserProductOwner = computed(() => {
    if (!this.localAuth.isLoggedIn() || !this.product()) {
      return false;
    }
    return this.localAuth.username === this.product()!.created_by_username;
  });

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  loadProduct(productId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // For now, we'll use the allProducts method and filter
    // In a real app, you'd have a getProductById method
    this.productsService.getProduct(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.wishlistService.getWishlist().subscribe({
          next: (wishlist) => {
            const product_id = this.product()?.id;
            this.wishlisted.set(wishlist ? wishlist.some((p) => p.id === product_id) : false);
          },
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erreur lors du chargement du produit');
        this.isLoading.set(false);
        console.error('Error loading product:', error);
      },
    });
  }

  increaseQuantity() {
    const currentProduct = this.product();
    if (currentProduct && this.quantity() < currentProduct.stock_quantity) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  onQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    const currentProduct = this.product();

    if (currentProduct && !isNaN(value)) {
      // Ensure quantity is within valid bounds
      const clampedValue = Math.max(1, Math.min(value, currentProduct.stock_quantity));
      this.quantity.set(clampedValue);

      // Update the input field to reflect the clamped value if it was out of bounds
      if (value !== clampedValue) {
        target.value = clampedValue.toString();
      }
    } else if (isNaN(value) || value < 1) {
      // Reset to 1 if invalid input
      this.quantity.set(1);
      target.value = '1';
    }
  }

  addToCart() {
    const currentProduct = this.product();
    if (currentProduct) {
      this.isAddingToCart.set(true);
      this.cartService.addProduct(currentProduct.id, this.quantity()).subscribe({
        next: () => {
          this.notify.showSuccess('Ajouté au panier !');
          setTimeout(() => {
            this.notify.clear();
          }, 3000);
        },
        complete: () => this.isAddingToCart.set(false),
        error: (error) => {
          this.isAddingToCart.set(false);
          console.error('Error adding to cart:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  getConditionText(condition: string): string {

    return Condition[condition] || 'Inconnu';
  }

  getConditionClasses(condition: string): string {
    switch (condition) {
      case 'new':
        return 'badge-success';
      case 'like_new':
        return 'badge-info';
      case 'good':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }

  getDeliveryModeText(deliveryMode: string): string {
    return DeliveryMode[deliveryMode] || 'Inconnu';
  }

  toggleWishlist() {
    this.isTogglingWishlist.set(true);
    if (this.wishlisted()) {
      this.wishlistService.removeFromWishlist(this.product()?.id || '').subscribe({
        next: () => {
          this.notify.showInfo('Retiré de la wishlist !');
          this.wishlisted.set(false);
        },
        complete: () => this.isTogglingWishlist.set(false),
        error: (error) => {
          this.isTogglingWishlist.set(false);
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.product()?.id || '').subscribe({
        next: () => {
          this.notify.showSuccess('Ajouté à la wishlist !');
          this.wishlisted.set(true);
        },
        complete: () => this.isTogglingWishlist.set(false),
        error: (error) => {
          this.isTogglingWishlist.set(false);
          console.error('Error adding to wishlist:', error);
        }
      });
    }
    setTimeout(() => {
      this.notify.clear();
    }, 5000);
  }

  buyNow() {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const productId = String(currentProduct.id);
    const qty = Math.max(1, Number(this.quantity()) || 1);

    this.isBuyingNow.set(true);
    this.cartService
      .clear()
      .pipe(
        switchMap(() => this.cartService.addProduct(productId, qty)),
        take(1)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/payment']);
        },
        complete: () => this.isBuyingNow.set(false),
        error: (err) => {
          this.isBuyingNow.set(false);
          console.error('buyNow failed:', err);
          this.notify.showWarning('Vous devez être connecté pour acheter ce produit.');
        },
      });
  }

  goCategory(cat: string) {
    this.router.navigate(['/products'], { queryParams: { category: cat } });
  }

  getCategoryDisplayName(cat: string) {
    return Category[cat] || 'Inconnu';
  }
}
