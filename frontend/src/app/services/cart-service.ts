import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, Observable, EMPTY } from 'rxjs';
import { environment } from '@app/common/environment';
import { CartModelResponse } from '../models/cart-model';
import { CartUpdateItemRequest } from '@app/models/product-model';
import { LocalAuthService } from './local-auth-service';
import { NotificationService } from './notification-service.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private localAuth = inject(LocalAuthService);
  private notificationService = inject(NotificationService);

  cart = signal<CartModelResponse | undefined>(undefined);

  itemsCount = computed(() => this.cart()?.items?.length ?? 0);
  unitsCount = computed(() =>
    (this.cart()?.items ?? []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
  );

  setCart(c: CartModelResponse | undefined) {
    this.cart.set(c);
  }

  // helpers
  private normalizeName(name: string | null | undefined): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private normalizeNames(cart: CartModelResponse): CartModelResponse {
    const items = (cart.items ?? []).map((item) => ({
      ...item,
      product_name: this.normalizeName(item.product_name),
    }));
    return { ...cart, items };
  }

  public allProducts(): Observable<CartModelResponse> {
    const url = new URL('v1/cart/', this.baseUrl).toString();
    return this.http.get<CartModelResponse>(url).pipe(
      map((cart) => this.normalizeNames(cart)),
      tap((cart) => this.setCart(cart))
    );
  }

  public clear(): Observable<any> {
    const url = new URL('v1/cart/', this.baseUrl).toString();
    return this.http.delete<any>(url).pipe(tap(() => this.clearCart()));
  }

  public removeItem(itemId: string): Observable<void> {
    const url = new URL(`v1/cart/items/${itemId}/`, this.baseUrl).toString();
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const current = this.cart();
        if (!current?.items) return;
        this.setCart({
          ...current,
          items: current.items.filter((i) => i.product_id !== itemId),
        });
      })
    );
  }

  public addProduct(productId: string, quantity: number): Observable<CartModelResponse> {
    const payload: CartUpdateItemRequest = { product: productId, quantity };
    return this.addItem(payload);
  }

  public addItem(payload: CartUpdateItemRequest): Observable<CartModelResponse> {
    if (this.localAuth.isLoggedIn()) {
      const url = new URL('v1/cart/', this.baseUrl).toString();
      return this.http.post<CartModelResponse>(url, payload).pipe(
        map((cart) => this.normalizeNames(cart)),
        tap((cart) => this.setCart(cart))
      );
    } else {
      this.notificationService.showWarning('Vous devez être connecté pour utiliser le panier');
      setTimeout(() => {
        this.notificationService.clear();
      }, 10000);
      return EMPTY;
    }
  }

  public updateQuantity(itemId: string, quantity: number): Observable<CartModelResponse> {
    const url = new URL(`v1/cart/items/${itemId}/`, this.baseUrl).toString();
    return this.http.patch<CartModelResponse>(url, { quantity }).pipe(
      map((cart) => this.normalizeNames(cart)),
      tap((cart) => this.setCart(cart))
    );
  }

  public pay(): Observable<CartModelResponse> {
    const url = new URL('v1/cart/pay/', this.baseUrl).toString();
    return this.http.post<CartModelResponse>(url, {}).pipe(tap((cart) => this.setCart(undefined)));
  }
  public clearCart(): void {
    this.setCart(undefined);
  }
}
