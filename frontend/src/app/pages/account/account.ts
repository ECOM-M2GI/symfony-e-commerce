import { Component, inject, signal } from '@angular/core';
import {
  UserProfileForm,
  UserProfileRequestModel,
  UserProfileResponseModel,
} from '@app/models/user-profile-model';
import { UserService } from '@app/services/user-service';
import { AccountProfile } from '@app/components/account-profile/account-profile';
import { AccountPurchases } from '@app/components/account-product-line/account-product-line';
import { AccountSidebarSkeleton } from '@app/components/account-sidebar-skeleton/account-sidebar-skeleton';
import { AccountProfileSkeleton } from '@app/components/account-profile-skeleton/account-profile-skeleton';
import { FormHandler } from '@app/common/forms-handle';
import { UserPurchasesResponseModel, UserSalesResponseModel } from '@app/models/user-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  imports: [AccountProfile, AccountPurchases, AccountSidebarSkeleton, AccountProfileSkeleton, CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  private profileService = inject(UserService);
  private userService = inject(UserService);

  tabs: Tab[] = [
    { key: 'profile', value: 'Profil' },
    { key: 'purchases', value: 'Achats' },
    { key: 'sales', value: 'Ventes' },
  ];

  currentTab: Tab['key'] = 'profile';

  // Loading signals
  isInitialLoading = signal(true);

  setCurrentTab(tab: Tab['key']) {
    this.currentTab = tab;
  }

  ngOnInit() {
    this.displayProfile();
    this.displayPurchases();
    this.displaySales();
  }

  /* Profile Tab */
  userProfile = signal<UserProfileResponseModel | undefined>(undefined);

  displayProfile() {
    this.profileService.getOwnProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.checkInitialLoadingComplete();
      },
      error: () => {
        this.checkInitialLoadingComplete();
      }
    });
  }

  editProfilte(param: { user: UserProfileRequestModel; formHandle: FormHandler<UserProfileForm> }) {
    this.userProfile.set(undefined);
    this.profileService.patchProfile(param.user).subscribe({
      next: (profile) => {
        param.formHandle.clearsErrors();
        this.userProfile.set(profile);
        this.displayProfile();
      },
      error: (err) => {
        this.userProfile.set({} as UserProfileResponseModel);
        param.formHandle.handleErrors(err.error);
        param.formHandle.clearsErrors();
      },
    });
  }

  /* Purchases Tab */
  userPurchases = signal<UserPurchasesResponseModel | undefined>(undefined);

  displayPurchases() {
    this.profileService.getPurchasesHistory().subscribe({
      next: (purchases) => {
        this.userPurchases.set(purchases);
        this.checkInitialLoadingComplete();
      },
      error: () => {
        this.checkInitialLoadingComplete();
      }
    });
  }

  /* Sales Tab */
  userSales = signal<UserSalesResponseModel | undefined>(undefined);

  displaySales() {
    this.profileService.getSalesHistory().subscribe({
      next: (sales) => {
        this.userSales.set(sales);
        this.checkInitialLoadingComplete();
      },
      error: () => {
        this.checkInitialLoadingComplete();
      }
    });
  }

  private checkInitialLoadingComplete() {
    // Check if all initial data has been loaded
    if (this.userProfile() !== undefined &&
        this.userPurchases() !== undefined &&
        this.userSales() !== undefined) {
      this.isInitialLoading.set(false);
    }
  }

  logout() {
    this.userService.logout();
  }
}

interface Tab {
  key: 'profile' | 'purchases' | 'sales';
  value: 'Profil' | 'Achats' | 'Ventes';
}
