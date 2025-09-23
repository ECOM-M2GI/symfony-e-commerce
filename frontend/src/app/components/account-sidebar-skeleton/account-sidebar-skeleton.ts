import { Component } from '@angular/core';

@Component({
  selector: 'app-account-sidebar-skeleton',
  standalone: true,
  template: `
    <div class="card bg-white rounded-2xl p-5 shadow-lg border-b border-base-300 mt-10">
      <!-- Title skeleton -->
      <div class="skeleton h-6 w-40 mb-5"></div>

      <!-- Navigation buttons skeleton -->
      <nav class="mt-5 space-y-1">
        @for (_ of [1, 2, 3]; track $index) {
        <div class="skeleton h-10 w-full rounded-lg"></div>
        }
      </nav>
    </div>
  `
})
export class AccountSidebarSkeleton {}
