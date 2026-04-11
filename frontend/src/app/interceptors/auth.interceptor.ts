
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get access token
  const accessToken = authService.getAccessToken();

  // Add access token to header if available
  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken }
    });
  }

  // Allow cookies to be sent with every request
  req = req.clone({
    withCredentials: true
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 error and it's not a refresh token request, try to refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap((response: any) => {
            // Save new access token
            authService.saveAccessToken(response.accessToken);
            // Refresh token is in cookie (no need to save it)

            // Retry original request with new access token
            const newReq = req.clone({
              setHeaders: { Authorization: 'Bearer ' + response.accessToken },
              withCredentials: true
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout user
            authService.clearAccessToken();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
