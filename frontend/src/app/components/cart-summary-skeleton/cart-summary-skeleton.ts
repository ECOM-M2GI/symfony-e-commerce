import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-summary-skeleton',
  standalone: true,
  template: `
    <div class="card bg-white rounded-3xl shadow-lg lg:sticky lg:top-6">
      <div class="card-body p-5">
        <dl class="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
          <dt class="text-neutral-700">Objet</dt>
          <dd class="skeleton h-4 w-20"></dd>

          <dt class="text-neutral-700">Livraison</dt>
          <dd class="skeleton h-4 w-16"></dd>

          <dt class="mt-3 text-lg font-semibold">Total</dt>
          <dd class="mt-3 skeleton h-8 w-28"></dd>
        </dl>

        <div class="skeleton h-12 w-full mt-4 rounded-lg"></div>
      </div>
    </div>

    <!-- Free shipping info skeleton -->
    <div class="mt-4 p-4 rounded-2xl shadow-lg bg-white flex items-center gap-2">
      <div class="skeleton w-5 h-5 rounded"></div>
      <div class="skeleton h-4 flex-1"></div>
    </div>
  `
})
export class CartSummarySkeleton {}
