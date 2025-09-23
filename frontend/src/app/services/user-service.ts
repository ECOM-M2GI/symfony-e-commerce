import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@app/common/environment';
import { LoginForm, RegisterForm, UserLoginRequestModel, UserLoginResponseModel, UserPurchasesResponseModel, UserRegisterResponseModel, UserRegistrationRequest, UserSalesResponseModel } from '@app/models/user-model';
import { Observable, tap } from 'rxjs';
import { LocalAuthService } from './local-auth-service';
import { UserProfileRequestModel, UserProfileResponseModel } from '@app/models/user-profile-model';
import { CartService } from './cart-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private router = inject(Router);
  private localAuth = inject(LocalAuthService);
  private cartService = inject(CartService);

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  public login(userForm: LoginForm): Observable<UserLoginResponseModel | HttpErrorResponse | any> {
    const body: UserLoginRequestModel = {
      username: userForm.username.value,
      password: userForm.password.value
    }
    return this.http.post<UserLoginResponseModel>(new URL('v1/accounts/login/', this.baseUrl).toString(), body).pipe(
      tap({
        next: (user) => {
          if (user.user_id) {
            this.localAuth.login(body.username, body.password);
            this.cartService.allProducts().subscribe();
          }
        },
      })
    )
  }

  public register(userForm: RegisterForm) {

    const body: UserRegistrationRequest = {
      username: userForm.username!.value,
      email: userForm.email?.value,
      password: userForm.password!.value,
      password_confirm: userForm.password_confirm!.value,
      first_name: userForm.first_name?.value,
      last_name: userForm.last_name?.value,
    }

    return this.http.post<UserRegisterResponseModel>(new URL('v1/accounts/register/', this.baseUrl).toString(), body).pipe(
      tap({
        next: (user) => {
          if (user.user_id) {
            this.localAuth.login(body.username, body.password);
            this.cartService.allProducts().subscribe();
          }
        }
      })
    )
  }

  public logout() {
    this.localAuth.logout();
    this.router.navigate(['/authentification']);
    this.cartService.cart.set(undefined);
    // return this.http.post<any>(new URL('v1/accounts/logout', this.baseUrl).toString(), {}).subscribe({
    //   next: () => {
    //     // todo clear login guard
    //   },
    //   error: (err) => {
    //     console.error('Logout error', err);
    //     this.router.navigate(['/login']).then();
    //   }
    // });
  }

  public getOwnProfile() {
    return this.http.get<UserProfileResponseModel>(new URL('v1/user/', this.baseUrl).toString())
  }

  public getUserProfile(id: number) {
    // todo
    return this.http.get<UserProfileResponseModel>(new URL(`v1/user/${id}`, this.baseUrl).toString())
  }

  public patchProfile(payload: UserProfileRequestModel) {
    return this.http.patch<UserProfileResponseModel>(new URL('v1/user/', this.baseUrl).toString(), payload)
  }

  public getPurchasesHistory() {
    return this.http.get<UserPurchasesResponseModel>(new URL('v1/user/purchases/', this.baseUrl).toString())
  }

  public getSalesHistory() {
    return this.http.get<UserSalesResponseModel>(new URL('v1/user/sales/', this.baseUrl).toString())
  }
}
