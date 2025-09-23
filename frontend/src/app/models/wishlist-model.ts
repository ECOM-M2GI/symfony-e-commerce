import { ProductModel } from "./product-model";

export type WishlistModel = ProductModel[]

export interface WishlistAddRequest{
    product: string;
}

export type WishlistRemoveRequest = WishlistAddRequest;

export type WishlistGetResponse = WishlistModel;

export type WishlistAddResponse = WishlistModel;
