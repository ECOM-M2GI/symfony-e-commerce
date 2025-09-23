import { FormControlsOf } from "@app/models/form-model";

export interface PaymentRequestModel {
    paymentMethod: string;
    shippingOption: string;
}

export type PaymentForm = FormControlsOf<PaymentRequestModel>

export interface PaymentResponseModel {
    message: string;
}

