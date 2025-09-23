import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { LocalAuthService } from '@app/services/local-auth-service';

export const authInGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(LocalAuthService);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    return new RedirectCommand(router.parseUrl('/authentification?returnUrl=' + state.url));
  }
};

export const authOutGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(LocalAuthService);

  if (!authService.isLoggedIn()) {
    return true;
  } else {
    return new RedirectCommand(router.parseUrl('/'));
  }
}
