import { Component } from '@angular/core';

@Component({
  selector: 'app-vendor-product-card-skeleton',
  standalone: true,
  template: `
    <div class="card bg-base-100 shadow-md border border-gray-200">
      <!-- Product Image Skeleton -->
      <figure class="relative">
        <div class="skeleton w-full h-48"></div>
        <!-- Status Badge Skeleton -->
        <div class="absolute top-2 right-2">
          <div class="skeleton h-5 w-12 rounded-full"></div>
        </div>
        <!-- Condition Badge Skeleton -->
        <div class="absolute top-2 left-2">
          <div class="skeleton h-5 w-20 rounded-full"></div>
        </div>
      </figure>

      <div class="card-body p-4">
        <!-- Product Title Skeleton -->
        <div class="skeleton h-5 w-full mb-2"></div>

        <!-- Description Skeleton -->
        <div class="skeleton h-4 w-full mb-1"></div>

        <!-- Price and Stock Section -->
        <div class="flex justify-between items-center mb-3">
          <div>
            <div class="skeleton h-6 w-16 mb-1"></div>
            <div class="skeleton h-3 w-20"></div>
          </div>
          <div class="text-right">
            <div class="skeleton h-4 w-12 mb-1"></div>
            <div class="skeleton h-3 w-16"></div>
          </div>
        </div>

        <!-- Action Buttons Skeleton -->
        <div class="space-y-2 w-full">
          <div class="grid grid-cols-2 gap-2">
            <div class="skeleton h-8 w-full rounded"></div>
            <div class="skeleton h-8 w-full rounded"></div>
          </div>
          <div>
            <div class="skeleton h-8 w-full rounded"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorProductCardSkeleton {}
