# NgRx Store File Structure & Architecture

## Complete Store Folder Organization

```
src/app/
│
├── store/                                  # NgRx Store Root
│   │
│   ├── auth/                              # Auth Feature Store
│   │   ├── auth.actions.ts                # 💪 Login, Register, Logout actions
│   │   ├── auth.reducer.ts                # 🔄 State updates logic
│   │   ├── auth.selectors.ts              # 📍 Extract state slices
│   │   └── auth.effects.ts                # ⚙️ Handle API calls & side effects
│   │
│   ├── patient/                           # Patient Feature Store
│   │   ├── patient.actions.ts             # 💪 GetPatients, CreatePatient actions
│   │   ├── patient.reducer.ts             # 🔄 State updates logic
│   │   ├── patient.selectors.ts           # 📍 Extract state slices
│   │   └── patient.effects.ts             # ⚙️ Handle API calls & side effects
│   │
│   └── app.state.ts                       # 🏛️ Root state interface
│
├── app.config.ts                          # 🔧 Store configuration & setup
│
├── services/
│   ├── auth.service.ts                    # HTTP calls for auth
│   └── patient.service.ts                 # HTTP calls for patients
│
├── pages/
│   ├── login/
│   │   ├── login.component.ts             # ✅ Uses store (dispatch)
│   │   ├── login.component.html           # Modified to use async pipe
│   │   └── login.component.scss
│   │
│   ├── register/
│   │   ├── register.component.ts          # ✅ Uses store (dispatch)
│   │   ├── register.component.html        # Modified to use async pipe
│   │   └── register.component.scss
│   │
│   └── dashboard/
│       ├── dashboard.component.ts         # ✅ Uses store (dispatch & select)
│       ├── dashboard.component.html       # Modified to use async pipe
│       ├── dashboard.component.scss
│       └── add-patient/
│           ├── add-patient.component.ts   # ✅ Uses store (dispatch)
│           ├── add-patient.component.html # Modified to use async pipe
│           └── add-patient.component.scss
│
└── interceptors/
    └── auth.interceptor.ts                # Adds token to requests (uses service)

```

---

## File Purposes & Responsibilities

### 🎯 Auth Store Files

#### `auth.actions.ts`
**Purpose**: Define all auth-related events/actions

**What it Contains**:
- `login()` - User initiates login
- `loginSuccess()` - Server confirmed login
- `loginFailure()` - Login failed
- `register()` - User initiates registration
- `registerSuccess()` - Registration succeeded
- `registerFailure()` - Registration failed
- `logout()` - User logs out
- `logoutSuccess()` - Logout confirmed
- `logoutFailure()` - Logout failed
- `refreshToken()` - Auto-refresh access token
- `refreshTokenSuccess()` - Token refreshed
- `refreshTokenFailure()` - Refresh failed

**How to Use**:
```typescript
import { login, logout } from '../../store/auth/auth.actions';
this.store.dispatch(login({ email, password }));
```

---

#### `auth.reducer.ts`
**Purpose**: Calculate new state based on actions

**What it Contains**:
- `AuthState` interface (defines state shape)
- `initialAuthState` (starting state)
- `authReducer` function (processes actions)

**State Structure**:
```typescript
{
  user: { id, name, email, role },  // Current user
  isLoading: false,                  // Loading indicator
  isLoggedIn: false,                 // Auth status
  error: null                        // Error messages
}
```

**How it Works**:
```
Action Type          → Reducer Logic           → New State
─────────────────────────────────────────────────────────
login               → isLoading = true        → State with spinner
loginSuccess        → user = data,            → State with logged-in user
                      isLoggedIn = true
loginFailure        → error = message         → State with error message
logout              → isLoading = true        → State clearing
logoutSuccess       → user = null,            → State with no user
                      isLoggedIn = false
```

---

#### `auth.selectors.ts`
**Purpose**: Extract specific pieces of auth state

**What it Contains**:
```typescript
selectAuthState          // The whole auth feature state
selectUser               // Just the user object
selectIsLoggedIn         // Just the logged-in flag
selectIsLoading          // Just the loading flag
selectAuthError          // Just error messages
selectUserRole           // User's role (computed)
selectUserId             // User's ID (computed)
```

**How to Use**:
```typescript
user$ = this.store.select(selectUser);         // Observable<User>
isLoading$ = this.store.select(selectIsLoading); // Observable<boolean>
role$ = this.store.select(selectUserRole);     // Observable<string>
```

---

#### `auth.effects.ts`
**Purpose**: Handle authentication side effects (API calls, storage)

**What it Contains**:
- `login$` - Listens for login action, calls API
- `loginSuccess$` - Saves token when login succeeds
- `register$` - Listens for register action, calls API
- `registerSuccess$` - Saves token when registration succeeds
- `logout$` - Calls logout API
- `logoutSuccess$` - Clears token from storage
- `refreshToken$` - Calls refresh token API
- `refreshTokenSuccess$` - Updates token in storage
- `refreshTokenFailure$` - Clears token on failure

**How it Works**:
```
Action Dispatched (login)
         ↓
Effect Detects (ofType(login))
         ↓
Async Operation (this.authService.login())
         ↓
Wait for Response
         ↓
Success? → dispatch(loginSuccess)
          → This triggers another effect to save token
Failure? → dispatch(loginFailure)
```

---

### 👥 Patient Store Files

#### `patient.actions.ts`
**Purpose**: Define all patient-related events

**What it Contains**:
- `getPatients()` - Fetch all patients
- `getPatientsSuccess()` - Patients fetched
- `getPatientsFailure()` - Fetch failed
- `createPatient()` - Create new patient
- `createPatientSuccess()` - Patient created
- `createPatientFailure()` - Creation failed

---

#### `patient.reducer.ts`
**Purpose**: Update patient state based on actions

**State Structure**:
```typescript
{
  patients: [],        // Array of patient objects
  isLoading: false,    // Loading indicator
  error: null          // Error messages
}
```

**How it Works**:
```
getPatients          → isLoading = true
getPatientsSuccess   → patients = data, isLoading = false
createPatientSuccess → Add new patient to array
```

---

#### `patient.selectors.ts`
**Purpose**: Extract patient data

**What it Contains**:
```typescript
selectPatients               // Array of all patients
selectPatientsLoading        // Loading state
selectPatientsError          // Error message
selectPatientCount           // Number of patients
selectPatientById(id)        // Specific patient by ID
```

---

#### `patient.effects.ts`
**Purpose**: Handle patient API calls

**What it Contains**:
- `getPatients$` - Fetch patients from API
- `createPatient$` - Post new patient to API

**Implementation Pattern** (All effects use this pattern):
```typescript
@Injectable()
export class PatientEffects {
  getPatients$!: any;    // Declare effect properties
  createPatient$!: any;
  
  constructor(
    private actions$: Actions,
    private patientService: PatientService
  ) {
    // Initialize effects in constructor
    this.getPatients$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PatientActions.getPatients),
        switchMap(() =>
          this.patientService.getPatients().pipe(
            map(patients => PatientActions.getPatientsSuccess({ patients })),
            catchError(error => of(PatientActions.getPatientsFailure({ error })))
          )
        )
      )
    );
  }
}
```

---

### 🏛️ Root Store Files

#### `app.state.ts`
**Purpose**: Define the complete application state shape

**Content**:
```typescript
export interface AppState {
  auth: AuthState;
  patient: PatientState;
}
```

Represents:
```
Store = {
  auth: {
    user: {...},
    isLoading: false,
    isLoggedIn: true,
    error: null
  },
  patient: {
    patients: [{...}, {...}],
    isLoading: false,
    error: null
  }
}
```

---

#### `app.config.ts`
**Purpose**: Configure NgRx in the application

**What it Does**:
1. Registers the auth reducer
2. Registers the patient reducer
3. Sets up effects (auth, patient)
4. Enables Redux DevTools for debugging
5. Provides everything to the Angular app

**Content**:
```typescript
provideStore({
  auth: authReducer,
  patient: patientReducer
}),
provideEffects([AuthEffects, PatientEffects]),
provideStoreDevtools({ maxAge: 25, logOnly: false })
```

---

## Integration Points

### 1️⃣ Login Component Integration

**Before (No Store)**:
```typescript
login() {
  this.auth.login({email, password}).subscribe(...);
}
```

**After (With Store)**:
```typescript
login() {
  this.store.dispatch(login({email, password}));  // Just dispatch!
}
```

**Template Before**:
```html
<button [disabled]="isLoading">{{ isLoading ? 'Loading...' : 'Login' }}</button>
```

**Template After**:
```html
<button [disabled]="(isLoading$ | async) || false">
  {{ (isLoading$ | async) ? 'Loading...' : 'Login' }}
</button>
```

---

### 2️⃣ Dashboard Component Integration

**Before (No Store)**:
```typescript
ngOnInit() {
  this.currentUser = this.auth.getUser();
  this.patientService.getPatients().subscribe(res => {
    this.patients = res;
  });
}
```

**After (With Store)**:
```typescript
ngOnInit() {
  this.store.dispatch(getPatients());
}

currentUser$ = this.store.select(selectUser);
patients$ = this.store.select(selectPatients);
```

**Template Before**:
```html
<div *ngIf="currentUser">{{ currentUser.name }}</div>
<div *ngFor="let p of patients">{{ p.name }}</div>
```

**Template After**:
```html
<div *ngIf="(currentUser$ | async) as user">{{ user.name }}</div>
<div *ngFor="let p of (patients$ | async); track p.id">{{ p.name }}</div>
```

---

## Data Flow Diagram

### Login Flow

```
┌──────────────────┐
│  Login Component │
│                  │
│  user clicks →   │
│  Login button    │
└────────┬─────────┘
         │
         │ dispatch(login({email, password}))
         ↓
┌──────────────────────────────────────────────┐
│         Auth Feature Store                   │
├──────────────────────────────────────────────┤
│                                              │
│  1. auth.actions.ts receives action          │
│     └─→ login = createAction(...)            │
│                                              │
│  2. auth.reducer.ts processes                │
│     └─→ sets isLoading = true               │
│     └─→ returns new state                   │
│                                              │
│  3. auth.effects.ts listens                  │
│     └─→ detects login action                │
│     └─→ calls authService.login()           │
│     └─→ waits for API response              │
│                                              │
│  4. On success                               │
│     └─→ dispatch(loginSuccess)              │
│     └─→ reducer sets user, isLoggedIn       │
│     └─→ effect saves token                  │
│                                              │
│  5. Selectors detect change                  │
│     └─→ selectIsLoading emits false         │
│     └─→ selectUser emits user object        │
│     └─→ selectIsLoggedIn emits true         │
│                                              │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────┐
│   Login Template │
│                  │
│  • Hide spinner  │
│  • Show user     │
│  • Redirect to   │
│    dashboard     │
└──────────────────┘
```

### Get Patients Flow

```
┌──────────────────┐
│ Dashboard Loads  │
│                  │
│ ngOnInit()       │
│ called           │
└────────┬─────────┘
         │
         │ dispatch(getPatients())
         ↓
┌──────────────────────────────────────────────┐
│         Patient Feature Store                │
├──────────────────────────────────────────────┤
│                                              │
│  1. patient.actions.ts receives action       │
│     └─→ getPatients = createAction(...)      │
│                                              │
│  2. patient.reducer.ts processes             │
│     └─→ sets isLoading = true               │
│                                              │
│  3. patient.effects.ts listens               │
│     └─→ detects getPatients action          │
│     └─→ calls patientService.getPatients()  │
│     └─→ waits for API response              │
│                                              │
│  4. On success                               │
│     └─→ dispatch(getPatientsSuccess)        │
│     └─→ reducer sets patients array         │
│     └─→ reducer sets isLoading = false      │
│                                              │
│  5. Selectors detect change                  │
│     └─→ selectPatients emits array          │
│     └─→ selectPatientsLoading emits false   │
│                                              │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────┐
│ Dashboard Template   │
│                      │
│ • Show patients list │
│ • Hide spinner       │
│ • Loop with @for     │
└──────────────────────┘
```

---

## State Tree Visualization

```
Redux Store
│
├── auth (Feature)
│   ├── user
│   │   ├── id: "123"
│   │   ├── name: "John Doe"
│   │   ├── email: "john@example.com"
│   │   └── role: "DOCTOR"
│   ├── isLoading: false
│   ├── isLoggedIn: true
│   └── error: null
│
└── patient (Feature)
    ├── patients[]
    │   ├── [0]
    │   │   ├── id: "p1"
    │   │   ├── name: "Patient 1"
    │   │   ├── email: "patient1@example.com"
    │   │   ├── age: 30
    │   │   └── gender: "MALE"
    │   ├── [1]
    │   │   ├── id: "p2"
    │   │   ├── name: "Patient 2"
    │   │   └── ...
    │   └── ...
    ├── isLoading: false
    └── error: null
```

---

## How Components Connect to Store

### Pattern: Component → Store → API → Store → Component

```
Component
   │
   ├─ Imports store, selectors, actions
   │
   ├─ In ngOnInit:
   │  └─ Dispatch actions: this.store.dispatch(action)
   │
   ├─ Subscribes to selectors:
   │  └─ this.store.select(selector) → Observable
   │
   └─ In template:
      └─ Use async pipe: (selector$ | async)


Store
   │
   ├─ Receives dispatched action
   │
   ├─ Reducer processes action
   │  └─ Returns new state
   │
   ├─ Effects (if side effect needed)
   │  └─ Calls API/Service
   │  └─ Dispatches new action with result
   │
   ├─ Selectors extract state
   │
   └─ Emits new values to subscribers


Services
   └─ Make HTTP requests
      └─ Return Observable<Response>


Component Template
   └─ Detects emission from selector
      └─ Re-renders with new data
```

---

## Summary

**Each feature (auth, patient) has 4 files**:

| File | Role | Used By |
|------|------|---------|
| `.actions.ts` | Define events | Components (dispatch) |
| `.reducer.ts` | Calculate state | Store (auto) |
| `.selectors.ts` | Extract state | Components (subscribe) |
| `.effects.ts` | Handle side effects | Store (auto) |

**Used together**:
1. Component dispatches action
2. Reducer updates state
3. Effects handle async operations
4. Selectors extract slices
5. Component receives updates
6. Template renders new data

See [NGRX_GUIDE.md](./NGRX_GUIDE.md) for detailed explanations!
