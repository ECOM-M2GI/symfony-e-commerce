import { FormControlsOf } from '@app/models/form-model';

export interface UserLoginRequestModel {
  username: string;
  password: string;
}

export type LoginForm = FormControlsOf<UserLoginRequestModel>;

export interface UserLoginResponseModel {
  token: string;
}

export interface UserRegistrationRequest {
  /**
   * Max length 150
   */
  username: string;
  email?: string;
  password: string;
  password_confirm: string;
  /**
   * Max length 150
   */
  first_name?: string;
  /**
   * Max length 150
   */
  last_name?: string;
}

export type UserRegisterResponseModel = UserLoginResponseModel;

export type RegisterForm = FormControlsOf<UserRegistrationRequest>;

export interface UserModel {
  username: string;
  password: string;
}

export interface UserProductsModel {
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  status: 'CART' | 'PAID' | 'SHIPPED' | 'CANCELED';
  /**
   * ISO 8601 date string
   */
  updated_at: string;
  product_image_url: string | null;
}

export type UserPurchasesResponseModel = (UserProductsModel & { seller_username: string })[];

export type UserSalesResponseModel = (UserProductsModel & { buyer_username: string })[];
