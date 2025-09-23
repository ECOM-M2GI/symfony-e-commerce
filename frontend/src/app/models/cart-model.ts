export interface CartModelResponse {
  id: number;
  status: string;
  items: CartLineResponse[];
  shipping_total: number;
  free_shipping_threshold: number;
  updated_at: string;
  created_at: string;
  subtotal: number;
  total: number;
  grand_total: number;
}

export interface CartLineResponse {
  product_id: string;
  product_name: string;
  condition: string;
  product_image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  current_stock: number;
  seller_id: number;
  seller_username: string;
  product_shipping_fee: string;
  product_category: string;
  delivery_mode: string;
}
