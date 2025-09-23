import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@app/services/notification-service.service';
import { NgClass } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Category } from '@app/models/product-model';
import { CartService } from '@app/services/cart-service';
import { LocalAuthService } from '@app/services/local-auth-service';
import { WishlistService } from '@app/services/wishlist-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-2rem)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class Header implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private localAuth = inject(LocalAuthService);
  private wishlistService = inject(WishlistService);
  notify = inject(NotificationService);

  public category = Category;
  categoryKeys = Object.keys(Category);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  close() {
    this.notify.clear();
  }

  onSearch(name: string) {
    const name_trim = name.trim();
    if (name_trim.length === 0) {
      if (this.router.url.startsWith('/products')) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/products']);
        });
      } else {
        this.router.navigate(['/products']);
      }
      return;
    } else {
      this.router.navigate(['/products'], {
        queryParams: { name: name_trim },
        queryParamsHandling: 'merge',
      });
    }
  }

  onCategory(cat: string) {
    // clear the name from the search bar
    this.router.navigate(['/products'], {
      queryParams: { category: cat, name: null },
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  // if there is a name in the query params, it should be displayed in the search bar
  ngOnInit() {
    if (this.localAuth.isLoggedIn()) {
      this.cartService.allProducts().subscribe();
      this.wishlistService.getWishlist().subscribe();
      this.countCart;
      this.countWishlist;
    }

    // Subscribe to route changes to update search input
    this.router.events.subscribe(() => {
      this.updateSearchInput();
    });
  }

  private updateSearchInput() {
    const urlParams = this.router.parseUrl(this.router.url).queryParams;
    if (urlParams['name'] && this.searchInput) {
      this.searchInput.nativeElement.value = urlParams['name'];
    } else {
      if (this.searchInput) {
        this.searchInput.nativeElement.value = '';
      }
    }
  }
  countCart = this.cartService.unitsCount;
  countWishlist = this.wishlistService.itemsCountWishList;
}
