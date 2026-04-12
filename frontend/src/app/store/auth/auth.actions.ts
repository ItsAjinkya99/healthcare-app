import { createAction, props } from '@ngrx/store';

// Login
export const login = createAction(
  '[Auth Page] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ accessToken: string; user: { id: string; name: string; email: string; role: string } }>()
);

export const loginFailure = createAction(
  '[Auth API] Login Failure',
  props<{ error: string }>()
);

// Register
export const register = createAction(
  '[Auth Page] Register',
  props<{ name: string; email: string; password: string; role: string }>()
);

export const registerSuccess = createAction(
  '[Auth API] Register Success',
  props<{ accessToken: string; user: { id: string; name: string; email: string; role: string } }>()
);

export const registerFailure = createAction(
  '[Auth API] Register Failure',
  props<{ error: string }>()
);

// Logout
export const logout = createAction(
  '[Auth] Logout'
);

export const logoutSuccess = createAction(
  '[Auth API] Logout Success'
);

export const logoutFailure = createAction(
  '[Auth API] Logout Failure',
  props<{ error: string }>()
);

// Refresh Token
export const refreshToken = createAction(
  '[Auth] Refresh Token'
);

export const refreshTokenSuccess = createAction(
  '[Auth API] Refresh Token Success',
  props<{ accessToken: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth API] Refresh Token Failure',
  props<{ error: string }>()
);

// Load User from storage (on app init)
export const loadUserFromStorage = createAction(
  '[App] Load User From Storage'
);

export const loadUserFromStorageSuccess = createAction(
  '[Auth] Load User From Storage Success',
  props<{ user: { id: string; name: string; email: string; role: string } }>()
);

export const loadUserFromStorageFailure = createAction(
  '[Auth] Load User From Storage Failure',
  props<{ error: string }>()
);

// Clear auth state
export const clearAuthState = createAction(
  '[Auth] Clear Auth State'
);
