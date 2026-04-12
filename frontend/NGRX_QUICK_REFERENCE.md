# NgRx Quick Reference - Healthcare App

## Quick Cheat Sheet

### Import Store & Dispatch Actions

```typescript
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { login, logout } from '../../store/auth/auth.actions';

export class MyComponent {
  constructor(private store: Store<AppState>) {}

  login() {
    this.store.dispatch(login({ email, password }));
  }

  logout() {
    this.store.dispatch(logout());
  }
}
```

---

## Auth Actions Dispatch Examples

### Login
```typescript
this.store.dispatch(login({ 
  email: 'user@example.com', 
  password: 'password123' 
}));
```

### Register
```typescript
this.store.dispatch(register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'DOCTOR'
}));
```

### Logout
```typescript
this.store.dispatch(logout());
```

### Refresh Token
```typescript
this.store.dispatch(refreshToken());
```

---

## Auth Selectors Usage

```typescript
import { selectUser, selectIsLoggedIn, selectIsLoading, selectAuthError, selectUserRole } from '../../store/auth/auth.selectors';

export class MyComponent {
  currentUser$ = this.store.select(selectUser);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError);
  userRole$ = this.store.select(selectUserRole);

  constructor(private store: Store<AppState>) {}
}
```

---

## Patient Actions Dispatch Examples

### Get All Patients
```typescript
this.store.dispatch(getPatients());
```

### Create Patient
```typescript
this.store.dispatch(createPatient({ 
  patientData: {
    name: 'John Smith',
    email: 'john@example.com',
    age: 30,
    gender: 'MALE'
  }
}));
```

---

## Patient Selectors Usage

```typescript
import { 
  selectPatients, 
  selectPatientsLoading, 
  selectPatientsError,
  selectPatientById 
} from '../../store/patient/patient.selectors';

export class DashboardComponent {
  patients$ = this.store.select(selectPatients);
  isLoading$ = this.store.select(selectPatientsLoading);
  error$ = this.store.select(selectPatientsError);
  
  // Get specific patient
  patient$ = this.store.select(selectPatientById('patient-id'));

  constructor(private store: Store<AppState>) {}
}
```

---

## Creating Effects (Advanced)

### Effects Pattern - Constructor Initialization
```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AuthEffects {
  // Declare effect properties
  login$!: any;
  loginSuccess$!: any;

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {
    // Initialize effects in constructor
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
          this.authService.login({ email, password }).pipe(
            map(response => AuthActions.loginSuccess({ ...response })),
            catchError(error => of(AuthActions.loginFailure({ error })))
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
  }
}
```

**Key Points:**
- Declare effects as class properties with `!` (non-null assertion)
- Initialize all effects inside the constructor
- This ensures injected dependencies are available before effects run

---

## Template Usage Patterns

### Show Data with async Pipe
```html
<!-- Loop through patients -->
@for (patient of (patients$ | async); track patient.id) {
  <div>{{ patient.name }}</div>
}

<!-- Show user info -->
@if ((currentUser$ | async) as user) {
  <p>Welcome {{ user.name }}!</p>
}
```

### Show Loading State
```html
@if (isLoading$ | async) {
  <div class="spinner">Loading...</div>
}
```

### Show Error
```html
@if (error$ | async as error) {
  <div class="alert alert-error">{{ error }}</div>
}
```

### Disable Button While Loading
```html
<button [disabled]="(isLoading$ | async) || false">
  {{ (isLoading$ | async) ? 'Loading...' : 'Submit' }}
</button>
```

### Role-based UI
```html
<!-- Show for ADMIN -->
@if ((selectUserRole$ | async) === 'ADMIN') {
  <button>Admin Only Button</button>
}

<!-- Show for DOCTOR or ADMIN -->
@if (('DOCTOR' || 'ADMIN') | async) {
  <button>Doctor Action</button>
}
```

---

## Component Setup Template

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppState } from '../../store/app.state';
import { selectUser, selectIsLoading } from '../../store/auth/auth.selectors';
import { login, logout } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class MyComponent implements OnInit, OnDestroy {
  // Selectors
  user$ = this.store.select(selectUser);
  isLoading$ = this.store.select(selectIsLoading);

  // Memory management
  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    // Subscribe if needed for other logic (not just UI)
    this.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      // Do something with user
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Dispatch actions
  login() {
    this.store.dispatch(login({ email: 'test@example.com', password: '123' }));
  }

  logout() {
    this.store.dispatch(logout());
  }
}
```

---

## Common Patterns

### Pattern 1: Load Data on Component Init
```typescript
ngOnInit() {
  this.store.dispatch(getPatients());
}
```

### Pattern 2: Wait for Action Result
```typescript
logout() {
  this.store.dispatch(logout());
  this.isLoggedIn$.pipe(
    filter(isLoggedIn => !isLoggedIn),
    take(1)
  ).subscribe(() => {
    this.router.navigate(['/login']);
  });
}
```

### Pattern 3: Handle Errors
```html
@if (error$ | async as error) {
  <div class="error-banner">
    <p>{{ error }}</p>
    <button (click)="retryAction()">Retry</button>
  </div>
}
```

### Pattern 4: Combine Multiple Selectors
```typescript
userWithRole$ = combineLatest([
  this.store.select(selectUser),
  this.store.select(selectUserRole)
]).pipe(
  map(([user, role]) => ({ user, role }))
);
```

---

## File Locations

| Action | Import From |
|--------|-------------|
| Auth login/register/logout | `../../store/auth/auth.actions` |
| Auth selectors | `../../store/auth/auth.selectors` |
| Patient getPatients/createPatient | `../../store/patient/patient.actions` |
| Patient selectors | `../../store/patient/patient.selectors` |
| AppState type | `../../store/app.state` |
| Store instance | `@ngrx/store` |

---

## Subscribe vs Async Pipe

### ❌ Don't Subscribe in Component (Memory Leak)
```typescript
// BAD - Memory leak if not unsubscribed
this.store.select(selectUser).subscribe(user => {
  this.currentUser = user;
});
```

### ✅ Use Async Pipe in Template (Auto Unsubscribe)
```typescript
// GOOD - Automatically handles unsubscribe
currentUser$ = this.store.select(selectUser);

// In template:
// {{ (currentUser$ | async)?.name }}
```

### ✅ Subscribe with takeUntil (Manual Cleanup)
```typescript
// If you MUST subscribe in component:
private destroy$ = new Subject<void>();

ngOnInit() {
  this.store.select(selectUser).pipe(
    takeUntil(this.destroy$)  // Unsubscribe on destroy
  ).subscribe(user => {
    this.currentUser = user;
  });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Debugging

### Enable DevTools (Already Configured)
- Open Redux DevTools browser extension (if installed)
- See all dispatched actions and state changes
- Time-travel debug: replay actions

### Console Logging
```typescript
// Watch specific selector
this.store.select(selectUser).subscribe(user => {
  console.log('Current user:', user);
});

// Log all actions
scan((action, i) => action, {})
  .subscribe(action => console.log('Action:', action));
```

---

## Common Mistakes

❌ **Modifying state directly in reducer**
```typescript
on(action, state => {
  state.user = newUser;  // DON'T DO THIS
  return state;
})
```

✅ **Return new state object**
```typescript
on(action, state => ({
  ...state,                    // Copy existing state
  user: newUser               // Override specific property
}))
```

---

❌ **Subscribing without unsubscribe**
```typescript
ngOnInit() {
  this.store.select(selectUser).subscribe(...);  // Memory leak!
}
```

✅ **Using async pipe or takeUntil**
```typescript
user$ = this.store.select(selectUser);  // In template: {{ (user$ | async)?.name }}

// OR

ngOnInit() {
  this.store.select(selectUser).pipe(
    takeUntil(this.destroy$)
  ).subscribe(...);
}
```

---

## State Flow Diagram

```
User Action (Click Button)
         ↓
dispatch(action)
         ↓
action$ observable (Effects)
         ↓
Reducer receives action
         ↓
Reducer returns new state
         ↓
Store updates state tree
         ↓
Selectors detect change
         ↓
Component observables emit new value
         ↓
async pipe in template subscribes
         ↓
Template re-renders with new data
```

---

## Tips & Tricks

**Tip 1**: Use track in @for loops to improve performance
```html
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

**Tip 2**: Use helper observables for complex logic
```typescript
isAdmin$ = this.store.select(selectUserRole).pipe(
  map(role => role === 'ADMIN')
);

// In template: @if (isAdmin$ | async)
```

**Tip 3**: Always provide initialAuthState and initialPatientState
```typescript
export const initialAuthState: AuthState = {
  user: null,
  isLoading: false,
  isLoggedIn: false,
  error: null
};
```

**Tip 4**: Use combineLatest for multiple dependencies
```typescript
isReady$ = combineLatest([
  this.store.select(selectUser),
  this.store.select(selectPatients)
]).pipe(
  map(([user, patients]) => !!user && patients.length > 0)
);
```

---

For detailed explanations, see [NGRX_GUIDE.md](./NGRX_GUIDE.md)
