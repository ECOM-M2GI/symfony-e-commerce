import { inject, Injectable } from '@angular/core';
import {
  PatchProductRequestModel,
  ProductModel,
  ProductModelRequest,
  ProductQueryParams,
  ProductListResponse,
} from '@app/models/product-model';
import { environment } from '@app/common/environment';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalAuthService } from './local-auth-service';
import { Router } from '@angular/router';
import { NotificationService } from './notification-service.service';
import { formDataToJson, normalizeProduct } from '@app/common/api-helpers';

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

  public getProduct(productId: string): Observable<ProductModel> {
    const url = new URL(`v1/products/${productId}`, this.baseUrl).toString();
    return this.http.get<ProductModel>(url).pipe(
      map((p) => normalizeProduct(p)),
    );
  }

  public myProducts(): Observable<ProductModel[]> {
    const url = new URL('v1/products/from-owner', this.baseUrl).toString();
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

  public searchProducts(query: ProductQueryParams): Observable<ProductListResponse> {
    const url = new URL('v1/products', this.baseUrl);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });
    return this.http
      .get<ProductListResponse>(url.toString())
      .pipe(map((res) => {
        return {
          data: res.data.map((p) => normalizeProduct(p)),
          isLastPage: res.isLastPage
        };
      }));
  }

  public getLastProducts(): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl);
    url.searchParams.set('ordering', '-created_at');
    return this.http
      .get<ProductListResponse>(url.toString())
      .pipe(map((res) => res.data.map((p) => normalizeProduct(p))));
  }

  public getMostFamous(): Observable<ProductModel[]> {
    const url = new URL('v1/products', this.baseUrl);
    url.searchParams.set('popular', '10');
    return this.http
      .get<ProductListResponse>(url.toString())
      .pipe(map((res) => res.data.map((p) => normalizeProduct(p))));
  }

  public addProduct(payload: ProductModelRequest): Observable<ProductModel> {

    if (this.localAuth.isLoggedIn()) {
      return this.http.post<ProductModel>(
        new URL('v1/products', this.baseUrl).toString(),
        this.productPayload(payload)
      );
    } else {
      this.router.navigate(['/login']);
      this.notificationService.showWarning('Vous devez être connecté pour ajouter un produit.');
      return EMPTY;
    }
  }

  public deleteProduct(productId: string): Observable<ProductModel> {
    return this.http.delete<ProductModel>(
      new URL(`v1/products/${productId}`, this.baseUrl).toString()
    );
  }

  public patchProduct(
    product_id: string,
    payload: PatchProductRequestModel,
    oldProduct?: ProductModel
  ): Observable<ProductModel> {
    if (payload.image) {
      delete payload.image;
    }

    return this.http.patch<ProductModel>(
      new URL(`v1/products/${product_id}`, this.baseUrl).toString(),
      this.productPayload(payload)
    );
  }

  public putProduct(productId: string, payload: ProductModelRequest): Observable<ProductModel> {
    return this.http.put<ProductModel>(
      new URL(`v1/products/${productId}`, this.baseUrl).toString(),
      this.productPayload(payload)
    );
  }

  productPayload(payload: Partial<ProductModelRequest>): ProductModelRequest {
    const transformedPayload: any = {};

    if (payload.image !== undefined) {
      delete transformedPayload.image;

      transformedPayload.image_url = "https://placehold.co/600x400";
    }

    console.log("payload: ");
    Object.keys(payload).forEach(key => {
      console.log(key, ': ', payload[key as keyof typeof payload]);
    });


    // Append all fields to FormData
    if (payload.name !== undefined) {
      transformedPayload.name = payload.name;
    }
    if (payload.description !== undefined) {
      transformedPayload.description = payload.description;
    }
    if (payload.price !== undefined) {
      transformedPayload.price = payload.price.toString();
    }
    if (payload.stock_quantity !== undefined) {
      transformedPayload.stock_quantity = payload.stock_quantity;
    }
    if (payload.is_active !== undefined) {
      transformedPayload.is_active = payload.is_active;
    }
    if (payload.shipping_fee !== undefined) {
      transformedPayload.shipping_fee = payload.shipping_fee.toString();
    }
    if (payload.delivery_mode !== undefined) {
      transformedPayload.delivery_mode = payload.delivery_mode;
    }
    if (payload.condition !== undefined) {
      transformedPayload.condition = payload.condition;
    }
    if (payload.category !== undefined) {
      transformedPayload.category = payload.category;
    }

    return transformedPayload;
  }
}
