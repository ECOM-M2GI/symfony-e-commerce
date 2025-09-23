import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StripeService } from '@app/services/stripe.service';
import { finalize, switchMap, takeWhile, timer, Subject, takeUntil, Subscription } from 'rxjs';
import { CartService } from '@app/services/cart-service';

@Component({
  selector: 'app-checkout-success',
  imports: [CommonModule],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.css',
})
export class CheckoutSuccess implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private cartService = inject(CartService);

  private destroy$ = new Subject<void>();
  private statusSubscription?: Subscription;
  private isComponentDestroyed = false;

  isLoading = signal(true);
  paymentStatus = signal<'complete' | 'processing' | 'requires_payment_method'>('processing');

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParams['session_id'];

    if (sessionId) {
      this.statusSubscription = timer(0, 3000)
        .pipe(
          switchMap(() => {
            // Check if component is destroyed before making request
            if (this.isComponentDestroyed) {
              return [];
            }
            return this.stripeService.getSessionStatus(sessionId);
          }),
          takeWhile((status) => !this.isComponentDestroyed && status?.status === 'processing', true),
          takeUntil(this.destroy$),
          finalize(() => {
            if (!this.isComponentDestroyed) {
              this.isLoading.set(false);
            }
          })
        )
        .subscribe({
          next: (status) => {
            if (this.isComponentDestroyed || !status) return;
            if (status.status === 'paid') {
              this.paymentStatus.set('complete');
              this.cartService.clearCart();
            }
          },
          error: (error) => {
            if (!this.isComponentDestroyed) {
              console.error('Error fetching session status:', error);
              this.isLoading.set(false);
            }
          },
        });
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy() {

    // Mark component as destroyed to prevent any further operations
    this.isComponentDestroyed = true;

    // Complete the destroy subject to stop the timer
    this.destroy$.next();
    this.destroy$.complete();

    // Explicitly unsubscribe from the status subscription
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
