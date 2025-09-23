import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-item-skeleton',
  standalone: true,
  template: `
    <article class="card bg-white rounded-3xl shadow-lg mb-5">
      <!-- Seller skeleton -->
      <div class="border-b border-base-300 flex justify-between items-center p-4 md:px-6">
        <div class="text-sm flex items-center gap-2">
          <span class="font-medium">Vendu par :</span>
          <div class="skeleton h-4 w-24"></div>
        </div>
        <div class="skeleton h-4 w-16"></div>
      </div>

      <div class="card-body p-4 md:p-6">
        <div class="flex gap-4">
          <!-- Product photo skeleton -->
          <div class="shrink-0">
            <div class="w-24 h-24 md:w-28 md:h-28 skeleton"></div>
          </div>

          <!-- Product details skeleton -->
          <div class="flex flex-col justify-between flex-grow">
            <div class="space-y-2">
              <div class="skeleton h-6 w-48"></div>
              <div class="skeleton h-4 w-20"></div>
            </div>

            <div class="hidden md:flex md:gap-1 md:flex-col md:items-start md:mb-2 space-y-1">
              <div class="skeleton h-4 w-24"></div>
              <div class="skeleton h-4 w-20"></div>
            </div>
          </div>

          <!-- Quantity and price skeleton -->
          <div class="text-right items-end justify-between">
            <div class="flex items-center gap-3 md:justify-end mb-2">
              <div class="text-sm text-neutral-600">Qté</div>
              <div class="flex items-center gap-2">
                <div class="skeleton h-8 w-8"></div>
                <div class="skeleton h-8 w-16"></div>
                <div class="skeleton h-8 w-8"></div>
              </div>
            </div>

            <div class="mt-2 md:mt-3 flex flex-col items-end space-y-2">
              <div class="skeleton h-8 w-32"></div>
              <div class="skeleton h-4 w-28"></div>
              <div class="skeleton h-4 w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `
})
export class CartItemSkeleton {}
