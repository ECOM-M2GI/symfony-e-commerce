import { inject, Injectable } from '@angular/core';
import {
  PatchProductRequestModel,
  ProductModel,
  ProductModelRequest,
  QueryParams,
} from '@app/models/product-model';
import { environment } from '@app/common/environment';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalAuthService } from './local-auth-service';
import { Router } from '@angular/router';
import { NotificationService } from './notification-service.service';
import { normalizeProduct } from '@app/common/api-helpers';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private localAuth = inject(LocalAuthService);
  private baseUrl = environment.apiUrl;
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // helpers
  private styleString(s: string): string {
    if (!s) return '';
    let new_s = s;
    new_s = s.charAt(0).toUpperCase() + s.slice(1);
    new_s = new_s.replace(/\s+/g, ' ').trim();
    return new_s;
  }
  private normalizeProduct(p: ProductModel): ProductModel {
    return {
      ...p,
      name: p.name ? this.styleString(p.name) : p.name,
      description: p.description ? this.styleString(p.description) : p.description,
    };
  }
  // end helpers

  public allProducts(): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl).toString();
    return this.http.get<ProductModel[]>(url).pipe(
      map((res) => {
        res = res.map((p) => normalizeProduct(p));
        return res;
      })
    );
  }

  public getProduct(productId: string): Observable<ProductModel> {
    const url = new URL(`v1/products/${productId}/`, this.baseUrl).toString();
    return this.http.get<ProductModel>(url).pipe(
      map((p) => normalizeProduct(p)),
    );
  }

  public myProducts(): Observable<ProductModel[]> {
    const url = new URL('v1/user/products', this.baseUrl).toString();
    if (this.localAuth.isLoggedIn()) {
      return this.http
        .get<ProductModel[]>(url)
        .pipe(map((res) => res.map((p) => this.normalizeProduct(p))));
    } else {
      this.router.navigate(['/login']);
      this.notificationService.showWarning('Vous devez être connecté pour voir vos produits.');
      return EMPTY;
    }
  }

  public searchProducts(query: QueryParams): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });
    return this.http
      .get<ProductModel[]>(url.toString())
      .pipe(map((res) => res.map((p) => normalizeProduct(p))));
  }

  public getLastProducts(): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl);
    url.searchParams.set('ordering', '-created_at');
    return this.http
      .get<ProductModel[]>(url.toString())
      .pipe(map((res) => res.map((p) => normalizeProduct(p))));
  }

  public getMostFamous(): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl);
    url.searchParams.set('popular', '10');
    return this.http
      .get<ProductModel[]>(url.toString())
      .pipe(map((res) => res.map((p) => normalizeProduct(p))));
  }

  public addProduct(payload: ProductModelRequest): Observable<ProductModel> {
    // Create FormData for multipart/form-data upload
    const formData = this.productFormData(payload);

    if (this.localAuth.isLoggedIn()) {
      return this.http.post<ProductModel>(
        new URL('v1/products', this.baseUrl).toString(),
        formData
      );
    } else {
      this.router.navigate(['/login']);
      this.notificationService.showWarning('Vous devez être connecté pour ajouter un produit.');
      return EMPTY;
    }
  }

  public deleteProduct(productId: string): Observable<ProductModel> {
    return this.http.delete<ProductModel>(
      new URL(`v1/products/${productId}/`, this.baseUrl).toString()
    );
  }

  public patchProduct(
    product_id: string,
    payload: PatchProductRequestModel,
    oldProduct?: ProductModel
  ): Observable<ProductModel> {
    const formData = new FormData();
    for (const key in payload) {
      if (key === 'image') {
        if (payload.image) {
          formData.append('image_url', payload.image, payload.image.name);
        }
      } else if (oldProduct) {
        if (
          oldProduct[key as keyof ProductModel] !== payload[key as keyof PatchProductRequestModel]
        ) {
          formData.append(key, payload[key as keyof PatchProductRequestModel] as any);
        } else {
          continue;
        }
      } else if (payload[key as keyof PatchProductRequestModel] !== undefined) {
        formData.append(key, payload[key as keyof PatchProductRequestModel] as any);
      }
    }

    return this.http.patch<ProductModel>(
      new URL(`v1/products/${product_id}/`, this.baseUrl).toString(),
      formData
    );
  }

  public putProduct(productId: string, payload: ProductModelRequest): Observable<ProductModel> {
    const formData = this.productFormData(payload);

    return this.http.put<ProductModel>(
      new URL(`v1/products/${productId}/`, this.baseUrl).toString(),
      formData
    );
  }

  productFormData(payload: ProductModelRequest): FormData {
    const formData = new FormData();

    // Append all fields to FormData
    formData.append('name', payload.name);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    formData.append('price', payload.price.toString());
    formData.append('stock_quantity', payload.stock_quantity.toString());
    formData.append('is_active', payload.is_active.toString());
    formData.append('shipping_fee', payload.shipping_fee.toString());
    formData.append('delivery_mode', payload.delivery_mode);
    formData.append('condition', payload.condition);
    formData.append('category', payload.category);

    formData.append('image_url', "https://placehold.co/600x400");

    return formData;
  }
}
