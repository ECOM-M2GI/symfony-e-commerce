import { Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { Loading } from '../loading/loading';
import { UserProfileForm, UserProfileRequestModel, UserProfileResponseModel } from '@app/models/user-profile-model';
import { LocalAuthService } from '@app/services/local-auth-service';
import { Router } from '@angular/router';
import { FormHandler } from '@app/common/forms-handle';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-profile',
  imports: [Loading, ReactiveFormsModule],
  templateUrl: './account-profile.html',
  styleUrl: './account-profile.css'
})
export class AccountProfile {
  private localAuthService = inject(LocalAuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.userProfile()) {

        for (const key in this.profileForm?.controls) {
          this.profileForm!.controls[key as keyof UserProfileForm]!.setValue(this.userProfile()![key as keyof UserProfileResponseModel]?.toString() !== 'string' ? this.userProfile()![key as keyof UserProfileResponseModel]?.toString() : '');
        }
      }

      this.formHandler = new FormHandler<UserProfileForm>('edit-profile', this.profileForm, this.formEl().nativeElement);
      this.fieldNames = this.formHandler.fieldNames;
    })
  }

  isEditing = signal<boolean>(false);

  formEl = viewChild.required<ElementRef>('profileFormEl');
  formHandler!: FormHandler<UserProfileForm>;
  fieldNames!: { [K in keyof UserProfileForm]?: string };

  profileForm = new FormGroup<UserProfileForm>({
    username: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    first_name: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    last_name: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    address: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    phone_number: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    date_of_birth: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
  })

  userProfile = input.required<UserProfileResponseModel | undefined>()
  outputEditProfile = output<{ user: UserProfileRequestModel, formHandle: FormHandler<UserProfileForm> }>();
  logoutEvent = output<void>();

  triggerEdit() {
    if (this.formEl()) {
      for (const key in this.profileForm?.controls) {
        this.profileForm?.controls[key as keyof UserProfileForm]?.enable();
      }
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    if (this.formEl()) {
      for (const key in this.profileForm?.controls) {
        this.profileForm?.controls[key as keyof UserProfileForm]?.disable();
      }
      this.isEditing.set(false);
    }
  }

  editProfile() {
    const user: UserProfileRequestModel = {};
    for (const key in this.profileForm?.controls) {
      const control = this.profileForm?.controls[key as keyof UserProfileForm];
      if (control && control.value !== '') {
        user[key as keyof UserProfileRequestModel] = control.value;
      }
    }
    if (Object.keys(user).length > 0 && JSON.stringify(user) !== JSON.stringify(this.userProfile())) {

      this.outputEditProfile.emit({ user: user, formHandle: this.formHandler });
      this.cancelEdit();
    } else {
      this.cancelEdit();
    }
  }

  logout() {
    this.logoutEvent.emit();
  }
}
