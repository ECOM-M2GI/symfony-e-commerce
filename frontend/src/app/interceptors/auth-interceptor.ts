import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalAuthService } from '@app/services/local-auth-service';
import { EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localAuth = inject(LocalAuthService)

  if (localAuth.isLoggedIn()) {
    const newReq = req.clone({
      setHeaders: {
        Authorization: `Basic ${localAuth.currentUserValue || ''}`
      }
    });

    return next(newReq);
  } else {
    return next(req);
  }
};
