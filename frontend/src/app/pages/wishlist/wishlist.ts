import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModel } from '@app/models/product-model';
import { ProductCard } from '@app/components/product-card/product-card';
import { ProductCardSkeleton } from '@app/components/product-card/product-card-skeleton/product-card-skeleton';
import { WishlistService } from '@app/services/wishlist-service';

@Component({
  selector: 'app-wishlist',
  imports: [ProductCard, ProductCardSkeleton],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  private wishlistService = inject(WishlistService);
  private router = inject(Router);

  wishlist = signal<ProductModel[] | undefined>(undefined);
  isLoading = signal(true);

  ngOnInit(): void {
    this.isLoading.set(true);
    // TODO change to get the wishlist from the user profile
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        if (wishlist !== undefined) {
          if (wishlist.length === 0) {
            this.wishlist.set([])
          } else {
            this.wishlist.set(wishlist);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    })
  }
  viewProduct(product: ProductModel) {
    this.router.navigate(['/products', product.id]);
  }

  toggleWishlist(productId: string) {
    const tempWishlist = this.wishlist();
    this.wishlist.set(undefined);
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlist.set(tempWishlist?.filter(item => item.id !== productId) || []);
      }
    })
  }
}
