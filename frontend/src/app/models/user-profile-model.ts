import { UserRegistrationRequest } from '@app/models/user-model';
import { FormControlsOf } from './form-model';
import { FormGroup } from '@angular/forms';

export interface UserProfileResponseModel {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
}

export type UserProfileRequestModel = Omit<Partial<UserProfileResponseModel>, 'id'>

export type UserProfileForm = FormControlsOf<UserProfileRequestModel>