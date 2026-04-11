
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard - Checks if user has the required role
 * Use this AFTER authGuard to verify user has proper permissions
 * 
 * Usage: canActivate: [authGuard, roleGuard]
 *        data: { roles: ['ADMIN', 'DOCTOR'] }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const userRole = auth.getRole() || '';
  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles) {
    // If no roles specified, allow access (only check auth)
    return true;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to login if role not authorized
  console.warn(`Access denied for role: ${userRole}`);
  router.navigate(['/']);
  return false;
};
