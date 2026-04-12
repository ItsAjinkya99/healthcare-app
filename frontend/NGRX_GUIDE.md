# NgRx Store Implementation Guide

## Overview

This document explains the complete NgRx store implementation for the Healthcare Management System, including authentication and patient management features. NgRx is a state management library for Angular that uses Redux-inspired patterns.

---

## Table of Contents

1. [What is NgRx?](#what-is-ngrx)
2. [Core Concepts](#core-concepts)
3. [Project Structure](#project-structure)
4. [Auth Store](#auth-store)
5. [Patient Store](#patient-store)
6. [How Everything Works Together](#how-everything-works-together)
7. [Best Practices Used](#best-practices-used)

---

## What is NgRx?

NgRx is a state management library that helps manage application state in a predictable, centralized way. It's based on the Redux pattern, which is a proven architecture for managing complex application state.

### Benefits:
- **Centralized State**: All app state is in one place (Redux store)
- **Predictable Updates**: State can only be modified through actions
- **Debugging**: Every state change is traceable
- **Reactivity**: Everything is observable-based (RxJS)
- **Better Performance**: ChangeDetection optimization, less re-renders

---

## Core Concepts

### 1. **Actions**
- Description of events that occur in the application
- Dispatched when user interacts with UI or when API calls complete
- Pure functions that carry data (state change instructions)

**Example:**
```typescript
login = createAction(
  '[Auth Page] Login',
  props<{ email: string; password: string }>()
);
```

### 2. **Reducers**
- Pure functions that take current state and an action
- Return a new state based on the action
- Must be synchronous and have no side effects
- Always return a new state object (immutability)

**Example:**
```typescript
on(AuthActions.loginSuccess, (state, { user, accessToken }) => ({
  ...state,
  user,
  isLoggedIn: true
}))
```

### 3. **Selectors**
- Functions that extract/select pieces of state
- Memoized (cached) for performance
- Used to subscribe to specific state slices
- Prevent unnecessary component re-renders

**Example:**
```typescript
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);
```

### 4. **Effects**
- Handle side effects (API calls, navigation, local storage)
```

**Why Constructor-Based Pattern?**

Effects must be initialized in the constructor to ensure injected dependencies (like `this.actions$`) are available before the effect observable is created. This prevents runtime errors like "Cannot read properties of undefined".
```

---

## Project Structure

```
src/app/
├── store/
│   ├── auth/
│   │   ├── auth.actions.ts      # Login, Register, Logout actions
│   │   ├── auth.reducer.ts      # Auth state & reducer logic
│   │   ├── auth.selectors.ts    # Selectors for auth state
│   │   └── auth.effects.ts      # Side effects (API calls)
│   ├── patient/
│   │   ├── patient.actions.ts   # Get Patients, Create Patient actions
│   │   ├── patient.reducer.ts   # Patient state & reducer logic
│   │   ├── patient.selectors.ts # Selectors for patient state
│   │   └── patient.effects.ts   # Side effects (API calls)
│   └── app.state.ts             # Root state interface
├── app.config.ts                # Store providers configuration
└── pages/
    ├── login/                   # Login component (uses auth store)
    ├── register/                # Register component (uses auth store)
    └── dashboard/               # Dashboard (uses auth & patient store)
```

---

## Auth Store

### State Structure

```typescript
export interface AuthState {
  user: User | null;           // Currently logged-in user
  isLoading: boolean;           // Loading state (for UI spinners)
  isLoggedIn: boolean;          // Is user authenticated?
  error: string | null;         // Error messages from failed actions
}
```

### Actions

#### Login
1. **Dispatch Action**: User clicks login button
   ```typescript
   this.store.dispatch(login({ email, password }));
   ```

2. **Reducer**: Sets `isLoading = true`
3. **Effect**: Makes API call to backend
4. **Result**: 
   - Success: `loginSuccess` action dispatches
   - Failure: `loginFailure` action dispatches

#### Login Success Flow
```
User Enters Credentials
         ↓
dispatch(login({email, password}))
         ↓
Reducer: isLoading = true, error = null
         ↓
Effect: Calls authService.login()
         ↓
API Response Successful
         ↓
dispatch(loginSuccess({accessToken, user}))
         ↓
Reducer: user = response.user, isLoggedIn = true, isLoading = false
         ↓
loginSuccess$ Effect: Saves token to localStorage
         ↓
Components Automatically Update (observables emit new values)
```

### Auth Selectors

```typescript
// Get the logged-in user
selectUser$ = this.store.select(selectUser);

// Get login status
selectIsLoggedIn$ = this.store.select(selectIsLoggedIn);

// Get loading state
selectIsLoading$ = this.store.select(selectIsLoading);

// Get error messages
selectAuthError$ = this.store.select(selectAuthError);

// Get user's role
selectUserRole$ = this.store.select(selectUserRole);
```

---

## Patient Store

### State Structure

```typescript
export interface PatientState {
  patients: any[];        // Array of all patients
  isLoading: boolean;     // Loading state
  error: string | null;   // Error messages
}
```

### Actions

#### Get Patients
```typescript
// Dispatch to load patients
this.store.dispatch(getPatients());
```

#### Create Patient
```typescript
// Dispatch to create new patient
this.store.dispatch(createPatient({ patientData: {...} }));
```

### Flow: Get Patients

```
Component loads (ngOnInit)
         ↓
dispatch(getPatients())
         ↓
Reducer: isLoading = true, error = null
         ↓
Effect: Calls patientService.getPatients()
         ↓
API Response Successful
         ↓
dispatch(getPatientsSuccess({patients: [...]})
         ↓
Reducer: patients = response, isLoading = false
         ↓
Component's patients$ observable emits
         ↓
Template updates with new patients (async pipe)
```

### Patient Selectors

```typescript
// Get all patients
selectPatients$ = this.store.select(selectPatients);

// Check if loading
selectPatientsLoading$ = this.store.select(selectPatientsLoading);

// Get errors
selectPatientsError$ = this.store.select(selectPatientsError);

// Get single patient by ID
selectPatientById(id)$ = this.store.select(selectPatientById(id));
```

---

## How Everything Works Together

### Example: Login Component

```typescript
export class LoginComponent {
  // Observables from store
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  constructor(private store: Store<AppState>) {}

  login() {
    // Dispatch login action
    this.store.dispatch(login({
      email: this.email,
      password: this.password
    }));
  }
}
```

### Example: Template Usage

```html
<!-- Show error if exists -->
@if (error$ | async as error) {
  <div class="error">{{ error }}</div>
}

<!-- Disable button while loading -->
<button [disabled]="(isLoading$ | async) || false">
  {{ (isLoading$ | async) ? 'Logging in...' : 'Login' }}
</button>
```

### Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN COMPONENT                         │
│  • Displays form                                           │
│  • User enters email, password                            │
│  • Clicks Login button                                    │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ dispatch(login({email, password}))
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGRx ACTION                             │
│  • Describes what happened                                │
│  • login = createAction('[Auth] Login', props<{...}>())  │
└────────────────┬──────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ↓                ↓
    ┌─────────┐      ┌──────────┐
    │ REDUCER │      │ EFFECTS  │
    └─────────┘      └──────────┘
         │                │
    • Sets         • Watches for
      isLoading      login action
      = true         • Calls API
         │           • Watches for
         │             response
         │                │
         └────────┬───────┘
                  ↓
         ┌──────────────────┐
         │ API CALL RESULT  │
         │ Success/Failure  │
         └────────┬─────────┘
                  │
         dispatch(loginSuccess or loginFailure)
                  │
                  ↓
         ┌──────────────────┐
         │    REDUCER       │
         │  Updates state:  │
         │• user = response │
         │• isLoggedIn=true │
         │• isLoading=false │
         └────────┬─────────┘
                  │
                  ↓
         ┌──────────────────┐
         │ STORE STATE      │
         │ UPDATED          │
         └────────┬─────────┘
                  │
                  ↓
      ┌────────────────────────┐
      │ SELECTOR EMITS NEW     │
      │ VALUE TO COMPONENT     │
      │• isLoading$ = false    │
      │• user$ = {name, ...}  │
      └────────┬───────────────┘
               │
               ↓
      ┌──────────────────┐
      │ COMPONENT DETECTS│
      │ NEW VALUES       │
      │ (async pipe)     │
      └────────┬─────────┘
               │
               ↓
      ┌──────────────────┐
      │ TEMPLATE UPDATES │
      │ • Hide spinner   │
      │ • Redirect user  │
      └──────────────────┘
```

---

## Best Practices Used

### 1. **Immutability**
State is never modified directly. Always return new objects:
```typescript
// ✅ Good
on(loginSuccess, (state, {user}) => ({
  ...state,
  user,
  isLoggedIn: true
}))

// ❌ Bad
on(loginSuccess, (state, {user}) => {
  state.user = user;  // Don't modify directly!
  return state;
})
```

### 2. **Single Responsibility**
- **Actions**: Describe what happened
- **Reducers**: Calculate new state
- **Effects**: Handle side effects
- **Selectors**: Extract state

### 3. **Error Handling**
All async operations have error handlers:
```typescript
catchError((error) =>
  of(AuthActions.loginFailure({ 
    error: error.error?.message || 'Unknown error' 
  }))
)
```

### 4. **Entity Tracking**
Use track functions in `@for` loops:
```html
@for (patient of patients; track patient.id || $index) {
  <tr>{{ patient.name }}</tr>
}
```

### 5. **Memory Management**
Unsubscribe from observables to prevent memory leaks:
```typescript
private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 6. **Type Safety**
Everything is properly typed with TypeScript interfaces:
```typescript
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}
```

### 7. **Memoization**
Selectors are memoized for performance:
```typescript
// Only recalculates when dependency changes
export const selectUserRole = createSelector(
  selectUser,
  (user: User | null) => user?.role || null
);
```

---

## Usage in Components

### Dashboard Component Example

```typescript
export class DashboardComponent implements OnInit {
  // Select slices of state
  currentUser$ = this.store.select(selectUser);
  patients$ = this.store.select(selectPatients);
  isLoading$ = this.store.select(selectPatientsLoading);
  error$ = this.store.select(selectPatientsError);

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    // Dispatch action to load patients
    this.store.dispatch(getPatients());
  }

  logout() {
    this.store.dispatch(logout());
  }
}
```

### Template Usage

```html
<!-- Subscribe using async pipe -->
@if (currentUser$ | async as user) {
  <span>Welcome, {{ user.name }}!</span>
}

<!-- Show loading state -->
@if (isLoading$ | async) {
  <div class="spinner">Loading...</div>
}

<!-- Show error -->
@if (error$ | async as error) {
  <div class="error">{{ error }}</div>
}

<!-- Display data -->
@for (patient of (patients$ | async); track patient.id) {
  <div>{{ patient.name }}</div>
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `auth.actions.ts` | Defines all auth-related actions |
| `auth.reducer.ts` | Handles auth state updates |
| `auth.effects.ts` | Handles auth side effects (API calls) |
| `auth.selectors.ts` | Provides functions to select auth state |
| `patient.actions.ts` | Defines all patient-related actions |
| `patient.reducer.ts` | Handles patient state updates |
| `patient.effects.ts` | Handles patient side effects (API calls) |
| `patient.selectors.ts` | Provides functions to select patient state |
| `app.config.ts` | Configures NgRx store in app |
| `app.state.ts` | Defines root state interface |

---

## Summary

### What Happens When User Logs In:

1. **User Action**: User enters email/password and clicks Login
2. **Dispatch Action**: Component dispatches `login` action
3. **Reducer Runs**: Sets `isLoading = true`
4. **Effect Triggered**: Listens for `login` action, calls backend API
5. **API Response**: 
   - Success → Dispatches `loginSuccess`
   - Failure → Dispatches `loginFailure`
6. **Reducer Updates**: Receives success/failure action, updates state
7. **Selectors Emit**: Components subscribed to selectors get new values
8. **UI Updates**: Template updates automatically (async pipe detects changes)
9. **Effects Run**: Additional effects may run (save token, navigate, etc.)

### Benefits You Get:

✅ **Single source of truth** - All state in one store  
✅ **Predictable** - Actions → Reducers → New State  
✅ **Traceable** - Every state change is logged and debuggable  
✅ **Reactive** - Components automatically update when state changes  
✅ **Type-safe** - Full TypeScript support  
✅ **Testable** - Pure functions (actions, reducers, selectors)  
✅ **Performance** - Memoized selectors, OnPush change detection  

---

## Next Steps

To extend this implementation:

1. **Add More Models**: Follow the same pattern for appointments, doctors, etc.
2. **Add Devtools**: Use @ngrx/store-devtools to debug state changes
3. **Add Routing**: Use @ngrx/router-store to manage router state
4. **Add Entity**: Use @ngrx/entity for managing collections more easily
5. **Add Facades**: Create facades to simplify component interactions with store
