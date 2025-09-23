export interface ProductModel {
  id: string;
  /**
   * Max length 200 chars
   */
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  shipping_fee: number;
  delivery_mode: string;
  condition: string;
  image_url: string;
  created_by_username: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface QueryParams {
  name?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  delivery_mode?: string;
  ordering?: SortBy;
  category?: string;
  in_stock?: boolean;
  seller_id?: string;
}

enum SortBy {
  Newest = '-created_at',
  Oldest = 'created_at',
  PriceHighToLow = '-price',
  PriceLowToHigh = 'price',
  NameAToZ = 'name',
  NameZToA = '-name',
  StockHighToLow = '-stock_quantity',
  StockLowToHigh = 'stock_quantity',
}

export const DeliveryMode: Record<string, string> = {
  hand_to_hand: 'Remise en main propre',
  by_mail: 'Par courrier',
};

export const Condition: Record<string, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  good: 'Bon état',
  acceptable: 'Acceptable',
};

export const Category: Record<string, string> = {
  clothes: 'Vêtements',
  books: 'Livres',
  cars: 'Voitures',
  video_games: 'Jeux vidéo',
  sport: 'Sport',
  home: 'Maison',
  appliances: 'Électroménager',
};

// {
//   "id": "b9310883-4735-41bd-b0bf-fb02de3324e2",
//   "name": "string",
//   "description": "string",
//   "price": "345.00",
//   "stock_quantity": 3,
//   "is_active": true,
//   "shipping_fee": "45.00",
//   "delivery_mode": "main_propre",
//   "category": "vetements",
//   "condition": "neuf",
//   "image_url": "https://dwnazphq75jed.cloudfront.net/images/products/ok.png",
//   "created_at": "2025-09-08T15:04:24.943613Z",
//   "updated_at": "2025-09-08T15:04:24.943623Z",
//   "created_by_username": "test"
// }

export interface ProductModelRequest {
  id: number;
  /**
   * Max length 200 chars
   */
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  shipping_fee: number;
  delivery_mode: string;
  condition: string;
  category: string;
  image: File;
}

export type PatchProductRequestModel = Partial<Omit<ProductModelRequest, 'id'>>;

export interface CartUpdateItemRequest {
  product: string;
  quantity: number;
}
