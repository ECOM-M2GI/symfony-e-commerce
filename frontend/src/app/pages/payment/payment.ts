import { Component, ElementRef, inject, signal, viewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { StripeService } from '@app/services/stripe.service';
import { Loading } from "@app/components/loading/loading";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  imports: [Loading, CommonModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit, OnDestroy {
  private stripeService = inject(StripeService);
  private router = inject(Router);

  checkoutContainer = viewChild.required<ElementRef>('checkoutContainer');

  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  checkout: StripeEmbeddedCheckout | null = null;

  ngOnInit(): void {
    this.initializeStripeCheckout().then(() => {});
  }

  ngOnDestroy(): void {
    if (this.checkout) {
      this.checkout.destroy();
    }
  }

  public async initializeStripeCheckout(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Create checkout session
      this.stripeService.createCheckoutSession({}).subscribe({
        next: async (session) => {
          if (!session?.client_secret) {
            this.error.set('Failed to create checkout session');
            this.isLoading.set(false);
            return;
          }

          // Initialize embedded checkout
          this.checkout = await this.stripeService.createEmbeddedCheckout(session.client_secret);

          if (!this.checkout) {
            this.error.set('Failed to initialize Stripe checkout');
            this.isLoading.set(false);
            return;
          }

          // Set loading to false first to make the container available
          this.isLoading.set(false);

          // Use setTimeout to ensure the DOM has updated and the container is available
          setTimeout(() => {
            try {
              const containerElement = this.checkoutContainer();


              if (containerElement?.nativeElement) {
                // Mount the checkout to the container
                this.checkout!.mount(containerElement.nativeElement);
              } else {
                this.error.set('Checkout container not found');
              }
            } catch (mountError) {
              console.error('Error mounting Stripe checkout:', mountError);
              this.error.set('Failed to mount Stripe checkout');
            }
          }, 0);
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);

          // Handle 409 Conflict error - items unavailable
          if (error.status === 409) {
            this.router.navigate(['/inventory-conflict']);
            return;
          }

          // Handle other errors with user-friendly messages
          this.error.set(
            error.status === 400
              ? 'Invalid cart data. Please review your cart and try again.'
              : error.status === 401
              ? 'Please log in to continue with payment.'
              : error.status >= 500
              ? 'Payment service is temporarily unavailable. Please try again later.'
              : error.error?.message || 'Failed to initialize payment. Please try again.'
          );
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('Error initializing Stripe checkout:', error);
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Failed to initialize payment. Please check your Stripe configuration.'
      );
      this.isLoading.set(false);
    }
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
