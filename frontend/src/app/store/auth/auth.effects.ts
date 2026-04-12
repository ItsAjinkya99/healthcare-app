import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  tap,
  exhaustMap,
  mergeMap
} from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$!: any;
  loginSuccess$!: any;
  register$!: any;
  registerSuccess$!: any;
  logout$!: any;
  logoutSuccess$!: any;
  refreshToken$!: any;
  refreshTokenSuccess$!: any;
  refreshTokenFailure$!: any;
  loadUserFromStorage$!: any;

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
          this.authService.login({ email, password }).pipe(
            map((response: any) =>
              AuthActions.loginSuccess({
                accessToken: response.accessToken,
                user: response.user
              })
            ),
            catchError((error) =>
              of(AuthActions.loginFailure({ error: error.error?.message || 'Login failed' }))
            )
          )
        )
      )
    );

    this.loginSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginSuccess),
          tap(({ accessToken }) => {
            this.authService.saveAccessToken(accessToken);
          })
        ),
      { dispatch: false }
    );

    this.register$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        switchMap(({ name, email, password, role }) =>
          this.authService.register({ name, email, password, role }).pipe(
            map((response: any) =>
              AuthActions.registerSuccess({
                accessToken: response.accessToken,
                user: response.user
              })
            ),
            catchError((error) =>
              of(AuthActions.registerFailure({ error: error.error?.message || 'Registration failed' }))
            )
          )
        )
      )
    );

    this.registerSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.registerSuccess),
          tap(({ accessToken }) => {
            this.authService.saveAccessToken(accessToken);
          })
        ),
      { dispatch: false }
    );

    this.logout$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        exhaustMap(() =>
          this.authService.logout().pipe(
            map(() => AuthActions.logoutSuccess()),
            catchError((error) =>
              of(AuthActions.logoutFailure({ error: error.error?.message || 'Logout failed' }))
            )
          )
        )
      )
    );

    this.logoutSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.logoutSuccess),
          tap(() => {
            this.authService.clearAccessToken();
          })
        ),
      { dispatch: false }
    );

    this.refreshToken$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.refreshToken),
        switchMap(() =>
          this.authService.refreshAccessToken().pipe(
            map((response: any) =>
              AuthActions.refreshTokenSuccess({ accessToken: response.accessToken })
            ),
            catchError((error) =>
              of(AuthActions.refreshTokenFailure({ error: error.error?.message || 'Token refresh failed' }))
            )
          )
        )
      )
    );

    this.refreshTokenSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.refreshTokenSuccess),
          tap(({ accessToken }) => {
            this.authService.saveAccessToken(accessToken);
          })
        ),
      { dispatch: false }
    );

    this.refreshTokenFailure$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.refreshTokenFailure),
          tap(() => {
            this.authService.clearAccessToken();
          })
        ),
      { dispatch: false }
    );

    this.loadUserFromStorage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.loadUserFromStorage),
        switchMap(() => {
          try {
            const user = this.authService.getUser();
            if (user) {
              return of(AuthActions.loadUserFromStorageSuccess({ user }));
            } else {
              return of(AuthActions.loadUserFromStorageFailure({ 
                error: 'No user found in storage' 
              }));
            }
          } catch (error: any) {
            return of(AuthActions.loadUserFromStorageFailure({ 
              error: error.message || 'Failed to load user from storage' 
            }));
          }
        })
      )
    );
  }
}
