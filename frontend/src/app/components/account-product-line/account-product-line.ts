import { Component, inject, input } from '@angular/core';
import { UserPurchasesResponseModel, UserSalesResponseModel } from '@app/models/user-model';
import { Loading } from '../loading/loading';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-account-product-line',
  imports: [Loading, DatePipe],
  templateUrl: './account-product-line.html',
  styleUrl: './account-product-line.css',
})
export class AccountPurchases {
  productsList = input.required<UserPurchasesResponseModel | UserSalesResponseModel | undefined>();
  salesOrPurchases = input.required<'sales' | 'purchases'>();
  private router = inject(Router);

  orderStatusColor: Record<UserPurchasesResponseModel[number]['status'], [string, string]> = {
    CART: ['Dans le panier', 'badge-info'],
    PAID: ['Payé', 'badge-warning'],
    SHIPPED: ['En cours de livraison', 'badege-success'],
    CANCELED: ['Annulé', 'badge-error'],
  };
  viewProduct(id: string) {
    this.router.navigate(['/products', id]);
  }
}
