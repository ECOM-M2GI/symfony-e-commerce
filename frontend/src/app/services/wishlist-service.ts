import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@app/common/environment';
import {
  WishlistAddRequest,
  WishlistAddResponse,
  WishlistGetResponse,
} from '@app/models/wishlist-model';
import { EMPTY, Observable, of, tap } from 'rxjs';
import { LocalAuthService } from './local-auth-service';
import { NotificationService } from './notification-service.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private localAuth = inject(LocalAuthService);
  private baseUrl = environment.apiUrl;
  private notify = inject(NotificationService);

  wishlist = signal<WishlistGetResponse | undefined>(undefined);

  setWishlist(w: WishlistGetResponse | undefined) {
    this.wishlist.set(w);
  }

  itemsCountWishList = computed(() => this.wishlist()?.length ?? 0);

  public getWishlist(): Observable<WishlistGetResponse | undefined> {
    if (this.localAuth.isLoggedIn()) {
      const url = new URL('v1/wishlist/', this.baseUrl).toString();
      return this.http
        .get<WishlistGetResponse>(url)
        .pipe(tap((wishlist) => this.setWishlist(wishlist)));
    } else {
      return of(undefined);
    }
  }

  public addToWishlist(product_id: string): Observable<WishlistAddResponse> {
    if (this.localAuth.isLoggedIn()) {
      const payload: WishlistAddRequest = { product: product_id };
      const url = new URL('v1/wishlist/', this.baseUrl).toString();
      return this.http
        .post<WishlistAddResponse>(url, payload)
        .pipe(tap((wishlist) => this.setWishlist(wishlist)));
    } else {
      this.notify.showWarning('Vous devez être connecté pour utiliser la wishlist.');
      return EMPTY;
    }
  }

  public removeFromWishlist(product_id: string): Observable<void> {
    if (this.localAuth.isLoggedIn()) {
      const url = new URL('v1/wishlist/', this.baseUrl).toString();
      return this.http.delete<void>(new URL(`?product=${product_id}`, url).toString()).pipe(
        tap(() => {
          const current = this.wishlist();
          if (!current) return;
          this.setWishlist(current.filter((item) => item.id !== product_id));
        })
      );
    } else {
      this.notify.showWarning('Vous devez être connecté pour utiliser la wishlist.');
      return EMPTY;
    }
  }
}
