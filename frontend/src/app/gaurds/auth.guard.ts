import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Checks if user is authenticated (has valid token)
 * Use this to protect any route that requires login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Redirect to login if not authenticated
  router.navigate(['/'], { queryParams: { returnUrl: state.url } });
  return false;
};
