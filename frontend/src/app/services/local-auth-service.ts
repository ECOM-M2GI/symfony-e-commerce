import { Injectable } from '@angular/core';
import { isTokenExpired, parseUsernameFromJwt } from '@app/common/api-helpers';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {

  login(token: string): void {
    localStorage.setItem('user', token);
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  public get currentUserValue(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      return user;
    }
    return null;
  }

  public get username(): string | null {
    if (this.isLoggedIn()) {
      return parseUsernameFromJwt(this.currentUserValue!);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    if(isTokenExpired(this.currentUserValue)){
      this.logout();
      return false;
    }

    return this.currentUserValue !== null;
  }
}
