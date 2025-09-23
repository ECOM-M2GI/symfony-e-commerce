import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  effect,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { Condition, DeliveryMode, ProductModel } from '@app/models/product-model';
import { AppErrorHandlerService } from '@app/services/app-error-handler.service';
import { CartService } from '@app/services/cart-service';
import { LocalAuthService } from '@app/services/local-auth-service';
import { NotificationService } from '@app/services/notification-service.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class ProductCard {
  public constructor() {
    effect(() => {
      this.isInCart.set(
        this.cartService
          .cart()
          ?.items.some((item) => item.product_id.toString() === this.product().id) ?? false
      );
    });
  }

  private router = inject(Router);
  private cartService = inject(CartService);
  private notify = inject(NotificationService);
  private errorHandler = inject(AppErrorHandlerService);
  private authService = inject(LocalAuthService);

  isInCart = signal<boolean>(false);
  product = input.required<ProductModel>();
  productClick = output<ProductModel>();
  viewDetails = output<ProductModel>();
  isLoading = signal<boolean>(false);
  isInWishlist = input<boolean | undefined>(undefined);

  toggleWishlist = output<string>();

  isUserProduct = computed(() => {
    const user = this.authService.username;
    const product = this.product();
    if (this.authService.isLoggedIn()) {
      return product.created_by_username === user;
    } else {
      return false;
    }
  });

  onProductClick() {
    this.productClick.emit(this.product());
  }

  onAddToCart(event: Event) {
    this.isLoading.set(true);
    event.stopPropagation();
    this.cartService.addProduct(this.product().id, 1).subscribe({
      next: () => {
        this.notify.showSuccess('Produit ajouté au panier !');
        setTimeout(() => {
          this.notify.clear();
        }, 2000);
      },
      complete: () => this.isLoading.set(false),
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handleError(err);
      },
    });
  }

  toCart() {
    this.router.navigate(['/cart']);
  }

  toVendor() {
    this.router.navigate(['/sell']);
  }

  onViewDetails(event: Event) {
    event.stopPropagation();
    this.viewDetails.emit(this.product());
  }

  getConditionLabel(condition: string): string {
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

  readonly DELIVERY_MODE = DeliveryMode;
}
