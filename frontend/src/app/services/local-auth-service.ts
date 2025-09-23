import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {

  login(username: string, password: string): void {
    const authdata = window.btoa(username + ':' + password);
    localStorage.setItem('user', JSON.stringify(authdata));
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  public get currentUserValue(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public get username(): string | null {
    if (this.isLoggedIn()) {
      return window.atob(this.currentUserValue!).split(':')[0];
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }
}
