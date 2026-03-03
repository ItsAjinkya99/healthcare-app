# BehaviorSubject vs Observable: currentUserSubject vs currentUser$

## Quick Summary

| Property | Type | Access | Purpose |
|----------|------|--------|---------|
| **currentUserSubject** | BehaviorSubject | Private | Internal state management |
| **currentUser$** | Observable | Public | Components subscribe to get updates |

---

## Deep Dive Explanation

### 1. **currentUserSubject** (Private)

```typescript
private currentUserSubject: BehaviorSubject<any>;
```

**What it is:**
- A private BehaviorSubject that holds the current user data
- Starts with initial value from `getUserFromToken()`
- Emits new values whenever user login/logout happens

**How it works:**
```typescript
constructor(private http: HttpClient) {
  // Initialize with current user from token (if exists)
  this.currentUserSubject = new BehaviorSubject<any>(
    this.getUserFromToken()
  );
  this.currentUser$ = this.currentUserSubject.asObservable();
}
```

**Key methods:**
- `.next(value)` → Update the subject value and notify all subscribers
- `.getValue()` → Get current value without subscribing
- `.asObservable()` → Convert to Observable

**Why private?**
- Prevents components from accessing it directly
- Ensures controlled updates through service methods only
- Encapsulation - internal details hidden

---

### 2. **currentUser$** (Public Observable)

```typescript
public currentUser$: Observable<any>;
```

**What it is:**
- A public Observable derived from currentUserSubject
- Components subscribe to this to get real-time updates
- The `$` suffix indicates it's an Observable (RxJS convention)

**How it works:**
```typescript
// Convert private subject to public observable
this.currentUser$ = this.currentUserSubject.asObservable();
```

**Why public?**
- Components can safely subscribe to it
- No way to modify it directly (read-only from component perspective)
- Clear interface for consuming user data

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│  User logs in                                       │
│  saveToken(token) is called                         │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │ Extract user from token  │
      │ (jwt decoded)            │
      └────────┬─────────────────┘
               │
               ▼
      ┌──────────────────────────────────────┐
      │ currentUserSubject.next(userData)    │
      │ (Update internal state)              │
      └────────┬─────────────────────────────┘
               │
               ▼
      ┌──────────────────────────────────────────┐
      │ All components subscribed to currentUser$ │
      │ receive the new user data                │
      └──────────────────────────────────────────┘
```

---

## How to Use in Components

### ❌ **WRONG - Don't do this:**

```typescript
// WRONG: Accessing private subject
export class SomeComponent {
  constructor(private auth: AuthService) {
    // ❌ Can't access - it's private
    const user = this.auth.currentUserSubject;  // ERROR!
  }
}
```

### ✅ **CORRECT - Use the Observable:**

```typescript
export class SomeComponent {
  currentUser$ = this.auth.currentUser$;  // Observable

  constructor(private auth: AuthService) {}
}
```

---

## Implementation Examples

### **Example 1: Simple Template Access (Using Async Pipe)**

**Component:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentUser$ | async as user">
      <p>Name: {{ user.name }}</p>
      <p>Email: {{ user.email }}</p>
      <p>Role: {{ user.role }}</p>
    </div>
    
    <div *ngIf="!(currentUser$ | async)">
      <p>Not logged in</p>
    </div>
  `
})
export class UserInfoComponent {
  // Expose observable to template
  currentUser$ = this.auth.currentUser$;

  constructor(private auth: AuthService) {}
}
```

**How it works:**
1. `currentUser$` is assigned the Observable from AuthService
2. Template uses `| async` pipe to subscribe automatically
3. When new user data emits → template updates automatically
4. When user logs out → new value is `null` → "Not logged in" shows

---

### **Example 2: Component Logic with Subscription**

**Component:**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  template: `
    <header>
      <h1>Welcome {{ userName }}</h1>
      <p>Role: {{ userRole }}</p>
    </header>
  `
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  userName = '';
  userRole = '';
  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Subscribe to user changes
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.name;
          this.userRole = user.role;
        } else {
          this.userName = '';
          this.userRole = '';
        }
      });
  }

  ngOnDestroy() {
    // Clean up subscription
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Key points:**
- Subscribe in `ngOnInit`
- Use `takeUntil` to automatically unsubscribe when component is destroyed
- Update component properties when user changes
- Clean up in `ngOnDestroy`

---

### **Example 3: Reactive Programming (Best Practice)**

**Component:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>{{ (userName$ | async) || 'Anonymous' }}</h2>
      
      <p *ngIf="(isAdmin$ | async)">
        🔑 You are an admin
      </p>
      
      <p *ngIf="(isDoctor$ | async)">
        👨‍⚕️ You are a doctor
      </p>
      
      <button (click)="logout()">Logout</button>
    </div>
  `
})
export class UserProfileComponent {
  // Create derived observables using map
  userName$: Observable<string> = this.auth.currentUser$.pipe(
    map(user => user?.name || 'Guest')
  );

  isAdmin$: Observable<boolean> = this.auth.currentUser$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  isDoctor$: Observable<boolean> = this.auth.currentUser$.pipe(
    map(user => user?.role === 'DOCTOR')
  );

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
    // After logout, currentUser$ will emit null
    // Templates will automatically update
  }
}
```

**Benefits:**
- Derived observables for specific data
- Template updates automatically
- No manual subscriptions needed with async pipe
- Clean and reactive

---

### **Example 4: Dashboard with Role-Based Sections**

**Component:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentUser$ | async as user; else notLoggedIn">
      <header>
        <h1>Dashboard - {{ user.name }}</h1>
        <span class="badge">{{ user.role }}</span>
      </header>

      <!-- Admin Only Section -->
      <section *ngIf="user.role === 'ADMIN'">
        <h2>Admin Panel</h2>
        <ul>
          <li>Manage Users</li>
          <li>View Reports</li>
          <li>System Settings</li>
        </ul>
      </section>

      <!-- Doctor Section -->
      <section *ngIf="user.role === 'DOCTOR'">
        <h2>Doctor Portal</h2>
        <ul>
          <li>View Patients</li>
          <li>Update Records</li>
        </ul>
      </section>

      <!-- Receptionist Section -->
      <section *ngIf="user.role === 'RECEPTIONIST'">
        <h2>Reception</h2>
        <ul>
          <li>Schedule Appointments</li>
          <li>Patient Check-in</li>
        </ul>
      </section>

      <div class="user-details">
        <h3>Your Details</h3>
        <p>Email: {{ user.email }}</p>
        <p>ID: {{ user.id }}</p>
      </div>
    </div>

    <ng-template #notLoggedIn>
      <p>Please log in to view dashboard</p>
    </ng-template>
  `,
  styles: [`
    .badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent {
  currentUser$ = this.auth.currentUser$;

  constructor(private auth: AuthService) {}
}
```

**What's happening:**
- `currentUser$` is exposed to template
- Async pipe subscribes automatically
- Shows/hides content based on user role
- No manual subscription needed

---

### **Example 5: Header Component (Real-time Updates)**

**Component:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">Healthcare System</div>

      <div class="navbar-menu">
        <div *ngIf="currentUser$ | async as user; else loginLink">
          <span class="welcome">Welcome, {{ user.name }}</span>
          <button (click)="logout()" class="logout-btn">
            Logout
          </button>
        </div>

        <ng-template #loginLink>
          <a href="/" class="login-link">Login</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #667eea;
      color: white;
    }

    .logout-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
  `]
})
export class HeaderComponent {
  currentUser$ = this.auth.currentUser$;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    // Header automatically updates because currentUser$ emits null
  }
}
```

---

## Subscription Lifecycle

### When User Logs In:

```
1. LoginForm calls: auth.login(credentials)
   ↓
2. Backend returns: token + user
   ↓
3. Component calls: auth.saveToken(token)
   ↓
4. Service executes:
   - localStorage.setItem('token', token)
   - currentUserSubject.next(getUserFromToken())
   ↓
5. All components subscribed to currentUser$:
   - Receive new user data
   - Update templates/properties
   - Dashboard becomes visible
```

### When User Logs Out:

```
1. LogoutBtn calls: auth.logout()
   ↓
2. Service executes:
   - localStorage.removeItem('token')
   - currentUserSubject.next(null)
   ↓
3. All components subscribed to currentUser$:
   - Receive null
   - Hide user content
   - Show login screen
```

---

## Pattern Comparison

### Pattern 1: Async Pipe (RECOMMENDED FOR TEMPLATES)
```typescript
// Component
currentUser$ = this.auth.currentUser$;

// Template
<div *ngIf="currentUser$ | async as user">
  {{ user.name }}
</div>
```
✅ Cleaner, auto-unsubscribes, no memory leaks

### Pattern 2: Manual Subscription (FOR LOGIC)
```typescript
ngOnInit() {
  this.auth.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      // Complex logic here
      this.processUser(user);
    });
}
```
✅ When you need to run code when user changes

### Pattern 3: Derived Observables (ADVANCED)
```typescript
role$ = this.auth.currentUser$.pipe(
  map(user => user?.role)
);
```
✅ Create specialized observables for specific data

---

## Summary

| Use Case | What to Use | Example |
|----------|------------|---------|
| Show user in template | `currentUser$` + async pipe | `<p>{{ (currentUser$ \| async)?.name }}</p>` |
| Run code when user changes | Subscribe to `currentUser$` | `this.auth.currentUser$.subscribe(...)` |
| Check current user in service | `getUser()` method | `const user = this.auth.getUser()` |
| Hide/show sections | `currentUser$ \| async as user` | `*ngIf="(currentUser$ \| async)?.role === 'ADMIN'"` |
| Reactive mapping | Create derived observable | `role$ = currentUser$.pipe(map(...))` |

---

## Key Takeaways

✅ **currentUserSubject** = Internal state (private)  
✅ **currentUser$** = Public API for components (Observable)  
✅ Use async pipe in templates (no manual subscriptions)  
✅ Use subscription only for complex logic  
✅ Always unsubscribe or use takeUntil to prevent memory leaks  
✅ $ suffix indicates Observable (RxJS convention)
