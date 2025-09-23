import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@app/services/cart-service';
import { CartModelResponse } from '@app/models/cart-model';
import { CommonModule } from '@angular/common';
import { Loading } from '@app/components/loading/loading';

@Component({
  selector: 'app-inventory-conflict',
  imports: [CommonModule, Loading],
  templateUrl: './inventory-conflict.html',
  styleUrl: './inventory-conflict.css'
})
export class InventoryConflict implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  cart = signal<CartModelResponse | undefined>(undefined);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.cartService.allProducts().subscribe({
      next: (cart: CartModelResponse) => {
        this.cart.set(cart);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading cart:', error);
        this.isLoading.set(false);
      }
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  refreshAndRetry(): void {
    this.isLoading.set(true);
    this.loadCart();
  }
}
