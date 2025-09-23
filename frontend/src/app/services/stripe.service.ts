import { Injectable, inject } from '@angular/core';
import { loadStripe, Stripe, StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '@app/common/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private readonly stripePromise: Promise<Stripe | null>;
  private baserUrl = environment.apiUrl;

  constructor() {
    // TODO: Add your Stripe publishable key here
    // Get your key from: https://dashboard.stripe.com/apikeys
    const stripePublishableKey = environment.stripePublishableKey;

    if (!stripePublishableKey || stripePublishableKey === 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE') {
      throw new Error(
        'Stripe publishable key is missing! Please add your actual Stripe publishable key to the environment configuration.'
      );
    }

    this.stripePromise = loadStripe(stripePublishableKey);
  }

  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  createCheckoutSession(cartData: any): Observable<{ client_secret: string }> {
    return this.http.post<{ client_secret: string }>(new URL('v1/payments/create-checkout-session/', this.baserUrl).toString(), cartData);
  }

  getSessionStatus(sessionId: string): Observable<{ status: string }> {
    const url = new URL('v1/payments/session-status/', this.baserUrl);
    url.searchParams.append('session_id', sessionId);
    return this.http.get<{ status: string }>(url.toString());
  }

  async createEmbeddedCheckout(clientSecret: string): Promise<StripeEmbeddedCheckout | null> {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error('Stripe could not be loaded');
    }

    return stripe.initEmbeddedCheckout({
      clientSecret: clientSecret
    });
  }
}
