# NgRx at a Glance - Visual Quick Start

## The 4 Building Blocks

### 1️⃣ ACTIONS - What Happened?
```
export const login = createAction(
  '[Auth Page] Login',
  props<{ email: string; password: string }>()
);

// This action says: "User wants to login with email and password"
```

### 2️⃣ REDUCER - Update State
```
on(AuthActions.login, (state) => ({
  ...state,
  isLoading: true,      // Show spinner
  error: null           // Clear errors
}))

// This reducer says: "When login action happens, show loading"
```

### 3️⃣ EFFECT - Make API Calls
```
// Effects are initialized in the constructor
// This ensures injected dependencies are available

@Injectable()
export class AuthEffects {
  login$!: any;

  constructor(private actions$: Actions, private authService: AuthService) {
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
          this.authService.login({ email, password }).pipe(
            map(res => AuthActions.loginSuccess({...res})),
            catchError(err => of(AuthActions.loginFailure({error})))
          )
        )
      )
    );
  }
}

// This effect says: "When login happens, call API and dispatch success/failure"
```

### 4️⃣ SELECTOR - Get Data
```
export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

// This selector says: "Give me the user from the state"
```

---

## Component to Store Flow

```
┌─────────────────────────────────────────────────────┐
│                   COMPONENT                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Import what you need:                          │
│     import { Store } from '@ngrx/store'            │
│     import { login } from '../../store/auth/...'   │
│     import { selectUser } from '../../store/...'   │
│                                                     │
│  2. In component:                                  │
│     isLoading$ = this.store.select(selectIsLoading)│
│     user$ = this.store.select(selectUser)          │
│                                                     │
│  3. Dispatch actions:                              │
│     this.store.dispatch(login({email, password}))  │
│                                                     │
│  4. In template:                                   │
│     {{ (user$ | async)?.name }}                    │
│     [disabled]="(isLoading$ | async) || false"    │
│                                                     │
└────────────────┬──────────────────────────────────┘
                 │
      dispatch(login({...}))
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│                    STORE                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Action Received: login                            │
│                 ↓                                  │
│  Reducer: Sets isLoading = true                    │
│                 ↓                                  │
│  Effect: Calls API                                 │
│                 ↓                                  │
│  API Success/Failure                              │
│                 ↓                                  │
│  Dispatch: loginSuccess or loginFailure            │
│                 ↓                                  │
│  Reducer: Updates user & isLoading = false         │
│                 ↓                                  │
│  Selectors: Emit new values                        │
│                                                     │
└────────────────┬──────────────────────────────────┘
                 │
    selectUser emits new value
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│         COMPONENT TEMPLATE UPDATES                  │
├─────────────────────────────────────────────────────┤
│  async pipe detects new value                      │
│  Angular re-renders with new data                  │
│  User sees "Hello John!"                           │
└─────────────────────────────────────────────────────┘
```

---

## State Shape (What Gets Stored)

```javascript
Store = {
  auth: {
    user: {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "DOCTOR"
    },
    isLoading: false,
    isLoggedIn: true,
    error: null
  },
  patient: {
    patients: [
      {
        id: "p1",
        name: "Patient 1",
        email: "patient1@example.com",
        age: 30,
        gender: "MALE"
      },
      {
        id: "p2",
        name: "Patient 2",
        email: "patient2@example.com",
        age: 25,
        gender: "FEMALE"
      }
    ],
    isLoading: false,
    error: null
  }
}
```

---

## Selectors (Extract Data)

```typescript
// Get the entire auth feature
selectAuthState

// Get specific pieces
selectUser           → { id, name, email, role }
selectIsLoading      → true/false
selectIsLoggedIn     → true/false
selectAuthError      → null or error message
selectUserRole       → "ADMIN" | "DOCTOR" | "RECEPTIONIST"
selectUserId         → "123"

// Patient selectors
selectPatients       → Array of patients
selectPatientsLoading → true/false
selectPatientsError   → null or error message
```

---

## Common Actions

### Auth Actions
```
login               → Dispatched when user clicks Login
loginSuccess        → Dispatched when API responds successfully
loginFailure        → Dispatched when API fails
register            → User wants to create account
registerSuccess     → Account created successfully
registerFailure     → Registration failed
logout              → User logged out
logoutSuccess       → Logout confirmed
refreshToken        → Auto-refresh access token
```

### Patient Actions
```
getPatients         → Fetch all patients
getPatientsSuccess  → Patients loaded
getPatientsFailure  → Failed to load
createPatient       → Create new patient
createPatientSuccess→ Patient created
createPatientFailure→ Creation failed
```

---

## Component Templates (Copy & Paste)

### Show Loading Spinner
```html
@if (isLoading$ | async) {
  <div class="spinner">Loading...</div>
}
```

### Show Error Message
```html
@if (error$ | async as error) {
  <div class="alert alert-error">{{ error }}</div>
}
```

### Show User Name
```html
@if (currentUser$ | async as user) {
  <p>Welcome, {{ user.name }}!</p>
}
```

### List All Patients
```html
@for (patient of (patients$ | async); track patient.id) {
  <div>
    <p>Name: {{ patient.name }}</p>
    <p>Email: {{ patient.email }}</p>
    <p>Age: {{ patient.age }}</p>
  </div>
}
```

### Disable Button While Loading
```html
<button [disabled]="(isLoading$ | async) || false">
  {{ (isLoading$ | async) ? 'Loading...' : 'Submit' }}
</button>
```

### Role-Based Visibility
```html
@if ((userRole$ | async) === 'ADMIN') {
  <button>Admin Panel</button>
}

@if ((userRole$ | async) === 'DOCTOR') {
  <button>Doctor Dashboard</button>
}
```

---

## Component TypeScript (Copy & Paste)

### Basic Component Setup
```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectUser, selectIsLoading } from '../../store/auth/auth.selectors';
import { login, logout } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class DashboardComponent implements OnInit {
  // Select state slices
  user$ = this.store.select(selectUser);
  isLoading$ = this.store.select(selectIsLoading);

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    // Dispatch initial actions
    this.store.dispatch(getPatients());
  }

  // Dispatch actions on user interaction
  saveChanges() {
    this.store.dispatch(updateUser(newData));
  }

  logout() {
    this.store.dispatch(logout());
  }
}
```

---

## The 3 Golden Rules

### Rule 1: Dispatch Actions
```typescript
// When user does something, dispatch an action
this.store.dispatch(login({ email, password }));
this.store.dispatch(logout());
this.store.dispatch(createPatient(data));
```

### Rule 2: Subscribe to Selectors
```typescript
// To show data in template, select from store
user$ = this.store.select(selectUser);
patients$ = this.store.select(selectPatients);
isLoading$ = this.store.select(selectIsLoading);
```

### Rule 3: Use Async Pipe
```html
<!-- Always use async pipe to avoid memory leaks -->
{{ (user$ | async)?.name }}
<!-- NOT: {{ user.name }} (this doesn't work) -->
```

---

## Checklist: Before Each Feature

- [ ] Created actions (what can happen)
- [ ] Created reducer (how state updates)
- [ ] Created selectors (what data components need)
- [ ] Created effects (what API calls to make)
- [ ] Updated component to dispatch actions
- [ ] Updated component to select state
- [ ] Updated template to use async pipe
- [ ] Tested in Redux DevTools

---

## Files Quick Reference

| What | Where | Why |
|------|-------|-----|
| **Dispatch actions** | Component | Tells store something happened |
| **Receive actions** | Reducer | Updates state based on action |
| **Make API calls** | Effect | Fetch data asynchronously |
| **Get data** | Selector | Extract pieces for template |
| **Show data** | Template | Display with async pipe |

---

## Real Example: Login Feature

### 1. User Action
```html
<!-- In login.component.html -->
<form (ngSubmit)="login()">
  <input [(ngModel)]="email" name="email">
  <input [(ngModel)]="password" name="password">
  <button type="submit">Login</button>
</form>
```

### 2. Dispatch Action
```typescript
// In login.component.ts
login() {
  this.store.dispatch(login({
    email: this.email,
    password: this.password
  }));
}
```

### 3. Reducer Updates
```typescript
// In auth.reducer.ts
on(AuthActions.login, state => ({
  ...state,
  isLoading: true,
  error: null
}))
```

### 4. Effect Makes API Call
```typescript
// In auth.effects.ts
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.login),
    switchMap(({email, password}) =>
      this.authService.login({email, password}).pipe(
        map(res => AuthActions.loginSuccess(res)),
        catchError(err => of(AuthActions.loginFailure({error: err})))
      )
    )
  )
);
```

### 5. Reducer Updates Again
```typescript
// In auth.reducer.ts
on(AuthActions.loginSuccess, (state, {user}) => ({
  ...state,
  user,
  isLoggedIn: true,
  isLoading: false,
  error: null
}))
```

### 6. Effect Saves Token
```typescript
// In auth.effects.ts
loginSuccess$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({accessToken}) => {
        this.authService.saveAccessToken(accessToken);
      })
    ),
  { dispatch: false }
);
```

### 7. Selectors Emit
```
selectIsLoading → false
selectUser → { id, name, email, role }
selectIsLoggedIn → true
```

### 8. Template Updates
```html
{{ (user$ | async)?.name }}                    <!-- Shows "John Doe" -->
{{ (isLoading$ | async) ? 'Loading...' : 'Login' }}  <!-- Shows "Login" -->
@if ((isLoggedIn$ | async)) {
  <!-- Show dashboard -->
}
```

---

## Speed Test: Can You Trace This?

```typescript
// User clicks button
<button (click)="addPatient(formData)">Add Patient</button>

// Component method
addPatient(data) {
  this.store.dispatch(createPatient({ patientData: data }));
}

// What happens?
// 1. Action: createPatient
// 2. Reducer: isLoading = true
// 3. Effect: Calls patientService.createPatient(data)
// 4a. If success: Dispatch createPatientSuccess
// 4b. If fail: Dispatch createPatientFailure
// 5. Reducer: 
//    - Success: patients array gets new patient, isLoading = false
//    - Failure: error message, isLoading = false
// 6. Selectors: selectPatients emits new array
// 7. Template: @for Updates with new patient in list
```

Can you trace it? If yes, you understand NgRx! ✅

---

## Remember These Keywords

- **Action**: What happened (user clicked, API responded)
- **Dispatcher**: Tells store to do something
- **Reducer**: Pure function that calculates new state
- **State**: Current data in the store
- **Selector**: Gets specific data from state
- **Effect**: Handles side effects (API calls, storage, navigation)
- **Observable**: Stream of values (async pipe subscribes to it)
- **Async Pipe**: Shows values in template, auto-unsubscribes

---

## Bonus: Debugging

### See Current State
```typescript
this.store.select(state => state).subscribe(console.log);
```

### See All Actions
Install Redux DevTools browser extension, then:
- Open DevTools
- Click Redux tab
- See all actions and state changes

### Test a Selector
```typescript
this.store.select(selectUser).subscribe(user => {
  console.log('User:', user);
});
```

---

## Next Level: Advanced Patterns

Once you master basics, try:
- **@ngrx/entity** - Manage collections of entities
- **@ngrx/router-store** - Manage router state
- **@ngrx/store-devtools** - Time-travel debugging
- **Facades** - Simplify component interactions
- **@ngrx/data** - Reduce boilerplate for CRUD operations

---

## You Now Know NgRx! 🎉

**Summary**:
1. ✅ Actions describe events
2. ✅ Reducers update state
3. ✅ Effects handle API calls  
4. ✅ Selectors extract data
5. ✅ Components dispatch & subscribe
6. ✅ Templates use async pipe

**Start using it**:
1. Read [NGRX_QUICK_REFERENCE.md](./NGRX_QUICK_REFERENCE.md) for copy-paste code
2. Read [NGRX_GUIDE.md](./NGRX_GUIDE.md) for deep understanding
3. Read [NGRX_FILE_STRUCTURE.md](./NGRX_FILE_STRUCTURE.md) for architecture

**Questions?** Check the docs! 📚
