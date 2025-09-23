import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ProductModel, QueryParams, Category } from '@app/models/product-model';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService } from '@app/services/products-service';
import { ProductCard } from '@app/components/product-card/product-card';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ProductCardSkeleton } from '@app/components/product-card/product-card-skeleton/product-card-skeleton';
import { WishlistService } from '@app/services/wishlist-service';
import { NotificationService } from '@app/services/notification-service.service';

interface FilterState {
  category: string;
  price_min: number | null;
  price_max: number | null;
  condition: string;
  deliveryMode: string;
  searchQuery: string;
  in_stock: boolean;
  ordering: 'price' | '-price' | 'created_at' | '-created_at' | 'name' | '-name' | 'stock_quantity' | '-stock_quantity' | '';
}

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, ProductCard, CommonModule, ProductCardSkeleton, KeyValuePipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly wishlistService = inject(WishlistService);
  private readonly notify = inject(NotificationService);

  // helper
  private normalizeString(s?: string) {
    if (typeof s === 'boolean') s = (s as boolean).toString();
    return (s ?? '').replace(/\s+/g, ' ').trim();
  }

  // Constants
  private readonly DEFAULT_FILTERS: FilterState = {
    category: '',
    price_min: null,
    price_max: null,
    condition: '',
    deliveryMode: '',
    searchQuery: '',
    in_stock: false,
    ordering: ''
  };

  // Parameter mapping for URL to filter conversion
  private readonly URL_TO_FILTER_MAP = {
    name: 'searchQuery',
    price_min: 'priceMin',
    max_price: 'maxPrice',
    condition: 'condition',
    delivery_mode: 'deliveryMode',
    category: 'category',
    in_stock: 'inStock',
    ordering: 'ordering'
  } as const;

  // Filter state
  filters = signal<FilterState>(this.DEFAULT_FILTERS);
  allProducts = signal<ProductModel[]>([]);
  isLoading = signal(true);

  // Computed filtered and sorted products
  filteredProducts = computed(() => {
    return [...this.allProducts()];
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.performSearch(params);
    });
  }

  private pushFiltersToUrl() {
    const qp = this.buildSearchQuery();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qp,
    });
  }

  private performSearch(params: Record<string, any>) {
    const isCategoryOnlyNavigation = params['category'] && Object.keys(params).length === 1;

    if (isCategoryOnlyNavigation) {
      this.resetFiltersForCategory(params['category']);
    } else {
      this.updateFiltersFromParams(params);
    }

    this.executeSearch();
  }

  private resetFiltersForCategory(category: string) {
    this.filters.set({
      ...this.DEFAULT_FILTERS,
      category,
    });
  }

  private updateFiltersFromParams(params: Record<string, any>) {
    Object.entries(this.URL_TO_FILTER_MAP).forEach(([urlKey, filterKey]) => {
      if (params[urlKey]) {
        const value = this.parseParamValue(urlKey, params[urlKey]);
        this.updateFilter(filterKey as keyof FilterState, value);
      }
    });
  }

  private parseParamValue(key: string, value: string): string | number | null {
    if (key === 'price_min' || key === 'max_price') {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    return value;
  }

  private executeSearch() {
    this.isLoading.set(true);
    const searchQuery = this.buildSearchQuery();
    const hasSearchParams = Object.keys(searchQuery).length > 0;

    const searchObservable = hasSearchParams
      ? this.productsService.searchProducts(searchQuery)
      : this.productsService.allProducts();

    searchObservable.subscribe((products) => {
      this.allProducts.set(products);
      this.isLoading.set(false);
    });
  }

  private buildSearchQuery(): QueryParams {
    const currentFilters = this.filters();
    const searchQuery: QueryParams = {};

    // Mapping from FilterState to QueryParams
    const filterToQueryMap: [keyof FilterState, keyof QueryParams][] = [
      ['searchQuery', 'name'],
      ['price_min', 'price_min'],
      ['price_max', 'price_max'],
      ['condition', 'condition'],
      ['deliveryMode', 'delivery_mode'],
      ['category', 'category'],
      ['in_stock', 'in_stock'],
      ['ordering', 'ordering']
    ];

    for (const [filterKey, queryParamKey] of filterToQueryMap) {
      let filterValue = currentFilters[filterKey] as unknown;

      // Normalizuj stringi: redukuj wielokrotne spacje i przytnij brzegi
      if (typeof filterValue === 'string') {
        filterValue = this.normalizeString(filterValue as string);
      }

      // Dodaj tylko znaczące wartości (nie puste stringi, nie null/undefined)
      const isMeaningful =
        filterValue !== null &&
        filterValue !== undefined &&
        !(typeof filterValue === 'string' && filterValue.length === 0);

      if (isMeaningful) {
        (searchQuery as any)[queryParamKey] = filterValue;
      }
    }

    return searchQuery;
  }

  updateFilter(key: keyof FilterState, value: any) {
    this.filters.update((current) => ({
      ...current,
      [key]: value,
    }));
    this.pushFiltersToUrl();
  }

  clearFilters() {
    this.filters.set(this.DEFAULT_FILTERS);
    this.router.navigate(['/products']);
  }

  viewProduct(product: ProductModel) {
    this.router.navigate(['/products', product.id]);
  }

  onPriceInput(type: 'price_min' | 'price_max', event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const val = raw === '' ? null : Number(raw);
    this.updateFilter(type, val);
  }

  searchBanner = computed(() => {
    const q = (this.filters().searchQuery ?? '').replace(/\s+/g, ' ').trim();
    return { q, count: this.filteredProducts().length };
  });

  private filtersEqual(
    a: FilterState,
    b: FilterState,
    ignore: (keyof FilterState)[] = [] // domyślnie ignorujemy sort
  ): boolean {
    const keys = Object.keys(a) as (keyof FilterState)[];
    for (const k of keys) {
      if (ignore.includes(k)) continue;

      if (k === 'price_min' || k === 'price_max') {
        const av = (a[k] ?? null) as number | null;
        const bv = (b[k] ?? null) as number | null;
        if (av !== bv) return false;
      } else {
        const av = this.normalizeString(a[k] as string);
        const bv = this.normalizeString(b[k] as string);
        if (av !== bv) return false;
      }
    }
    return true;
  }

  isDefaultFilters = computed(
    () => this.filtersEqual(this.filters(), this.DEFAULT_FILTERS) // sortBy ignorowany
  );

  hasActiveFilters = computed(() => !this.isDefaultFilters());

  goBack() {
    this.updateFilter('category', '');
    this.pushFiltersToUrl();
  }

  getCategoryDisplayName(cat?: string): string {
    const key = (cat ?? '').trim();
    if (!key) return 'Toutes les catégories';
    // próbuj z mapy Category; jeśli nie ma — zrób ładny fallback
    return Category[key] ?? this.prettyCategoryKey(key);
  }

  private prettyCategoryKey(key: string): string {
    // clothes -> Clothes, like_new -> Like New
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  isInWishlist(productId: string): boolean | undefined {
    if (this.wishlistService.wishlist()) {
      return this.wishlistService.wishlist()!.some((item) => item.id === productId);
    } else {
      return undefined
    }
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.notify.showSuccess('Produit retiré de la liste de souhaits');
          setTimeout(() => {
            this.notify.clear();
          }, 5000);
        }
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.notify.showSuccess('Produit ajouté à la liste de souhaits');
          setTimeout(() => {
            this.notify.clear();
          }, 5000);
        }
      });
    }
  }

  readonly ORDERING_OPTIONS = {
    "Le plus récent": "-created_at",
    "Le plus ancien": "created_at",
    "Prix décroissant": "-price",
    "Prix croissant": "price",
    "Nom A à Z": "name",
    "Nom Z à A": "-name",
    "Grande quantité": "stock_quantity",
    "Basse quantité": "-stock_quantity"
  };
}
