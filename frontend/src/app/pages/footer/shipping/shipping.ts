import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-shipping',
  imports: [CommonModule],
  templateUrl: './shipping.html',
})

export class Shipping {
  private router = inject(Router);
  continueShopping() {
    this.router.navigate(['/']);
  }
}
