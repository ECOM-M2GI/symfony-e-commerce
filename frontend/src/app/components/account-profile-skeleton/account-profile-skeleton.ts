import { Component } from '@angular/core';

@Component({
  selector: 'app-account-profile-skeleton',
  standalone: true,
  template: `
    <div class="card bg-white shadow-lg p-6 md:p-8 gap-x-4 max-w-3xl mx-auto rounded-2xl ml-4 mt-10">
      <!-- Header skeleton - matches the real header with avatar, username, logout -->
      <div class="flex justify-between items-center border-b border-base-300 pb-5">
        <div class="flex items-center gap-x-4">
          <div class="w-12 h-12 skeleton rounded-full"></div>
          <div class="skeleton h-6 w-32"></div>
        </div>
        <div class="skeleton h-10 w-32 rounded-lg"></div>
      </div>

      <!-- Form fields skeleton - matches the 2-column grid layout -->
      <div class="w-full profile-form space-y-6">
        <!-- First row - First name and Last name -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="skeleton h-4 w-16 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
          <div>
            <div class="skeleton h-4 w-12 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
        </div>

        <!-- Second row - Email and Phone -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="skeleton h-4 w-14 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
          <div>
            <div class="skeleton h-4 w-36 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
        </div>

        <!-- Third row - Address and Date of birth -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="skeleton h-4 w-16 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
          <div>
            <div class="skeleton h-4 w-32 mb-2"></div>
            <div class="skeleton h-12 w-full rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- Action buttons skeleton - matches the right-aligned buttons -->
      <div class="mt-8 w-full text-right space-x-2">
        <div class="skeleton h-12 w-40 rounded-lg inline-block"></div>
      </div>
    </div>
  `
})
export class AccountProfileSkeleton {}
