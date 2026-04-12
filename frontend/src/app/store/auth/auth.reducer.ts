import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isLoading: false,
  isLoggedIn: false,
  error: null
};

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { accessToken, user }) => ({
    ...state,
    user,
    isLoading: false,
    isLoggedIn: true,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoggedIn: false,
    error
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { accessToken, user }) => ({
    ...state,
    user,
    isLoading: false,
    isLoggedIn: true,
    error: null
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoggedIn: false,
    error
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    isLoading: false,
    isLoggedIn: false,
    error: null
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Refresh Token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.refreshTokenSuccess, (state, { accessToken }) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoggedIn: false,
    error
  })),

  // Load User from Storage
  on(AuthActions.loadUserFromStorage, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loadUserFromStorageSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    isLoggedIn: true,
    error: null
  })),

  on(AuthActions.loadUserFromStorageFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoggedIn: false,
    error,
    user: null
  })),

  // Clear state
  on(AuthActions.clearAuthState, (state) => ({
    ...initialAuthState
  }))
);
