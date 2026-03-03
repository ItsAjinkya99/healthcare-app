# Angular Guards - Auth Guard vs Role Guard

## Overview

Angular guards protect routes by controlling access. This app now has **two complementary guards**:

---

## 1. **Auth Guard** ✅ Authentication Check

**File:** `src/gaurds/auth.guard.ts`

**Purpose:** Verifies user is **logged in** (has valid token)

**Checks:**
- Does user have a token?
- Is token still valid?

**Returns:**
- `true` → User is authenticated, allow access
- `false` → User not authenticated, redirect to login

**Usage:**
```typescript
canActivate: [authGuard]
```

**Example - Protect simple routes:**
```typescript
{ 
  path: 'profile', 
  component: ProfileComponent,
  canActivate: [authGuard]
}
```

---

## 2. **Role Guard** 🔐 Authorization Check

**File:** `src/gaurds/role.guard.ts`

**Purpose:** Verifies user has **correct role** for the route

**Checks:**
- What is user's role?
- Is role in allowed list?

**Returns:**
- `true` → User has correct role, allow access
- `false` → User role not authorized, redirect

**Usage:**
```typescript
canActivate: [roleGuard],
data: { roles: ['ADMIN', 'DOCTOR'] }
```

**Example - Admin only routes:**
```typescript
{ 
  path: 'admin', 
  component: AdminComponent,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
}
```

---

## 3. **Both Guards Together** 🛡️ Best Practice

**Usage:**
```typescript
canActivate: [authGuard, roleGuard]
```

**Flow:**
```
User tries to access /dashboard
    ↓
1. authGuard - "Is user logged in?"
    → NO → Redirect to /login
    → YES → Continue
    ↓
2. roleGuard - "Does user have right role?"
    → NO → Redirect to /login
    → YES → Allow access ✓
    ↓
Dashboard loads successfully
```

---

## When to Use Each

### Use **authGuard ONLY**
For routes that any authenticated user can access:
```typescript
{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [authGuard]
}
```

### Use **roleGuard ONLY**
Not recommended - always use **authGuard first!**

### Use **BOTH Guards**
For role-restricted routes (RECOMMENDED):
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }
}
```

---

## Current Implementation

### App Routes (`app.routes.ts`)

```typescript
export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected route - requires authentication AND correct role
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }
  },
  
  { path: '**', redirectTo: '' }
];
```

---

## Guard Execution Order

Guards execute in the order they're listed:

```typescript
canActivate: [authGuard, roleGuard]
```

1. **First:** `authGuard` runs
2. **If authGuard returns true** → `roleGuard` runs
3. **If roleGuard returns true** → Route is accessed
4. **If either returns false** → Route is blocked

---

## Real-World Example Scenarios

### Scenario 1: User Not Logged In
```
User: Not authenticated (no token)
Route: /dashboard (canActivate: [authGuard, roleGuard])

→ authGuard checks token → null → false
→ Redirect to /login
→ roleGuard never runs
```

### Scenario 2: Logged In But Wrong Role
```
User: Authenticated, Role: RECEPTIONIST
Route: /admin (canActivate: [authGuard, roleGuard], roles: ['ADMIN'])

→ authGuard checks token → valid → true
→ roleGuard checks role → RECEPTIONIST not in ['ADMIN'] → false
→ Redirect to /login
```

### Scenario 3: Correct Authentication & Role
```
User: Authenticated, Role: ADMIN
Route: /admin (canActivate: [authGuard, roleGuard], roles: ['ADMIN'])

→ authGuard checks token → valid → true
→ roleGuard checks role → ADMIN in ['ADMIN'] → true
→ Load Admin Component ✓
```

---

## Common Routes Setup

### Public Routes (No Guard)
```typescript
{
  path: 'login',
  component: LoginComponent
  // No canActivate - accessible to everyone
}
```

### Authenticated Users Only
```typescript
{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [authGuard]
  // data: not needed
}
```

### Specific Role Required
```typescript
{
  path: 'admin',
  component: AdminPanelComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN'] }
}

{
  path: 'doctor-portal',
  component: DoctorPortalComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['DOCTOR'] }
}

{
  path: 'reception',
  component: ReceptionComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['RECEPTIONIST'] }
}
```

### Multiple Roles Allowed
```typescript
{
  path: 'patients',
  component: PatientsComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'DOCTOR'] }
}
```

---

## Behind the Scenes

### Auth Guard Logic
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;  // ✓ Allow access
  }

  // Redirect to login if not authenticated
  router.navigate(['/'], { queryParams: { returnUrl: state.url } });
  return false;  // ✗ Block access
};
```

### Role Guard Logic
```typescript
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const userRole = auth.getRole();
  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles) {
    return true;  // No roles specified, allow access
  }

  if (allowedRoles.includes(userRole)) {
    return true;  // ✓ User has allowed role
  }

  console.warn(`Access denied for role: ${userRole}`);
  router.navigate(['/']);
  return false;  // ✗ User role not authorized
};
```

---

## Testing Guards

### Test Auth Guard
```typescript
// Scenario: Access protected route without token
// Expected: Redirected to login
localStorage.removeItem('token');
navigate('/dashboard');
// Result: Should redirect to /
```

### Test Role Guard
```typescript
// Scenario: Admin tries to access doctor-only route
// Expected: Redirected to login
// First: Auth passes (user logged in)
// Second: Role fails (ADMIN not in ['DOCTOR'] roles)
navigate('/doctor-portal');
// Result: Should redirect to /
```

---

## Summary Table

| Guard | Purpose | Checks | Use Cases |
|-------|---------|--------|-----------|
| **authGuard** | Authentication | Has valid token? | All protected routes |
| **roleGuard** | Authorization | Has required role? | Role-specific routes |
| **Both** | Full Protection | Token + Role | Most routes |

---

## Key Takeaway

✅ **Always use `authGuard` first** - ensures user is logged in  
✅ **Then use `roleGuard`** - ensures user has correct role  
✅ **Order matters** - guards execute sequentially  
✅ **Both together** - provides complete route protection  

---

## Code Locations

- **AuthGuard:** `src/gaurds/auth.guard.ts`
- **RoleGuard:** `src/gaurds/role.guard.ts`
- **Routes:** `src/app.routes.ts`
- **AuthService:** `src/services/auth.service.ts`
