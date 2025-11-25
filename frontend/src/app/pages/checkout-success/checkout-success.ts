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
export class CheckoutSuccess implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);

  isLoading = signal(true);
  paymentStatus = signal<'complete' | 'processing' | 'requires_payment_method'>('processing');

  ngOnInit() {
    this.cartService.pay().subscribe({
        next: (cart) => {
          if (cart.status === 'PAID') {
            this.paymentStatus.set('complete');
          }
        },
        error: (error) => {
            console.error('Error fetching session status:', error);
            this.isLoading.set(false);
        },
        complete: ()  =>{
            this.isLoading.set(false);
        },
      });
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
