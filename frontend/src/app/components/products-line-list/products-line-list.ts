import { Component, inject, OnInit, OnChanges, SimpleChanges, Input, signal, computed, effect } from '@angular/core';
import { ProductsService } from '@app/services/products-service';
import { ProductModel } from '@app/models/product-model';
import { ProductCard } from '@app/components/product-card/product-card';
import { Router } from '@angular/router';
import { CartService } from '@app/services/cart-service';
import { ProductCardSkeleton } from '../product-card/product-card-skeleton/product-card-skeleton';
import { WishlistService } from '@app/services/wishlist-service';
import { WishlistModel } from '@app/models/wishlist-model';
import { NotificationService } from '@app/services/notification-service.service';

@Component({
  selector: 'app-products-line-list',
  imports: [ProductCard, ProductCardSkeleton],
  templateUrl: './products-line-list.html',
  styleUrl: './products-line-list.css',
})
export class ProductsLineList implements OnInit, OnChanges {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private notify = inject(NotificationService);

  constructor() {
    effect(() => {
      this.wishlist.set(this.wishlistService.wishlist());
    });
  }

  allProducts = signal<ProductModel[] | undefined>(undefined);
  wishlist = signal<WishlistModel | undefined>(undefined);
  private router = inject(Router);

  @Input() feed: 'latest' | 'popular' = 'latest';

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feed'] && !changes['feed'].firstChange) {
      this.loadProducts();
    }
  }

  loadProducts() {
    const src$ =
      this.feed === 'popular'
        ? this.productsService.getMostFamous()
        : this.productsService.getLastProducts();

    src$.subscribe({
      next: (data) => this.allProducts.set(data),
    });
  }

  viewProduct(product: ProductModel) {
    this.router.navigate(['/products', product.id]);
  }

  isInWishlist = computed(() => {
    return (productId: string) =>
      this.wishlist()?.some(item => item.id === productId) ?? undefined;
  });


  toggleWishlist(productId: string) {
    if (this.isInWishlist()(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.wishlist.set(this.wishlist()?.filter(item => item.id !== productId));
          this.notify.showSuccess('Produit supprimé de la liste de souhaits');
          setTimeout(() => {
            this.notify.clear();
          }, 5000);
        }
      })
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: (wishlist) => {
          this.wishlist.set(wishlist);
          this.notify.showSuccess('Produit ajouté à la liste de souhaits');
          setTimeout(() => {
            this.notify.clear();
          }, 5000);
        }
      })
    }
  }
}
