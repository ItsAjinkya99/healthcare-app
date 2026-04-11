# Token Storage - Best Practices & Security

## Storage Comparison Matrix

| Storage Method | Access Token | Refresh Token | Security | Vulnerabilities |
|---|---|---|---|---|
| **localStorage** | ❌ Common (wrong) | ❌ WRONG | Low | XSS attacks can steal both |
| **sessionStorage** | ❌ Not recommended | ❌ WRONG | Low | Cleared on browser close |
| **HTTPOnly Cookie** | ❌ No (can't access) | ✅ **BEST** | High | XSS safe, CSRF mitigated |
| **Memory/State** | ⚠️ Lost on refresh | ❌ Not practical | Medium | Lost on page reload |
| **Hybrid** | ✅ **BEST** | ✅ **BEST** | High | Best balance of security & UX |

---

## 🏆 **IDEAL IMPLEMENTATION (Recommended)**

### **Access Token** → `localStorage`
- **Why**: 
  - Short-lived (15 minutes)
  - Need accessible to JavaScript
  - Sent with every API request
  - Loss of access token only damages for 15 minutes
- **How**: Read from localStorage, add to request headers

### **Refresh Token** → `HTTPOnly Secure SameSite Cookie`
- **Why**:
  - Long-lived (7 days)
  - **Not accessible to JavaScript** (protected from XSS)
  - **Automatically sent with requests** (no manual handling)
  - **Browser enforces SameSite** (protected from CSRF)
  - Most secure option
- **How**: 
  - Backend sets it in response headers
  - Browser automatically includes it in requests
  - Frontend cannot access it via JavaScript

---

## 🔒 Security Advantages

```
❌ CURRENT (localStorage for both):
┌─────────────────────────────────┐
│  localStorage                   │
│  ├─ accessToken      ← XSS risk │
│  └─ refreshToken     ← XSS risk │
└─────────────────────────────────┘
   If XSS attack happens:
   → Both tokens stolen
   → Attacker has 7 days of access

✅ IMPROVED (Hybrid approach):
┌─────────────────────────────────┐
│  localStorage                   │
│  └─ accessToken      ← XSS risk│
├─────────────────────────────────┤
│  HTTPOnly Cookie                │
│  └─ refreshToken  ← XSS safe!  │
└─────────────────────────────────┘
   If XSS attack happens:
   → Only accessToken (15 min) stolen
   → refreshToken still safe
   → Attacker has limited damage window
```

---

## 📋 How HTTPOnly Cookies Work

### **Backend Sets Refresh Token as Cookie:**
```javascript
// Backend Response Header
Set-Cookie: refreshToken=xyz; 
            HttpOnly;                 // Not accessible to JS
            Secure;                   // HTTPS only
            SameSite=Strict;          // CSRF protection
            Max-Age=604800;           // 7 days
            Path=/api;                // Specific path
```

### **Browser Automatically Sends Cookie:**
```
Frontend request → Browser includes cookie automatically
GET /api/patient → Authorization: Bearer <accessToken>
                   Cookie: refreshToken=xyz (automatic!)
```

### **Frontend Cannot Access It:**
```javascript
// ❌ This will be null (security feature!)
console.log(document.cookie); // refreshToken not visible
localStorage.getItem('refreshToken'); // null

// ✅ But backend can use it automatically
// When calling /api/auth/refresh, browser sends it automatically
```

---

## 🔄 Updated Flow with Cookies

### **Login Response from Backend:**
```javascript
res
  .cookie('refreshToken', generatedRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  .json({
    message: 'Login successful',
    accessToken: generatedAccessToken,
    // Note: refreshToken NOT sent in body
    user: { /* user data */ }
  });
```

### **Frontend Stores Access Token Only:**
```javascript
// After login
localStorage.setItem('accessToken', response.accessToken);
// refreshToken is automatically in the cookie (you don't touch it!)
```

### **API Request with Both Tokens:**
```javascript
// Frontend manually adds access token
Authorization: Bearer <accessToken>

// Browser AUTOMATICALLY adds cookie
Cookie: refreshToken=xyz
```

### **Token Refresh Flow:**
```javascript
// Frontend calls refresh endpoint
POST /api/auth/refresh
Headers: Authorization: Bearer <expiredAccessToken>
         Cookies: refreshToken=xyz (automatic!)

// Backend:
// 1. Receives expiredAccessToken from header
// 2. Receives refreshToken from cookie (automatically)
// 3. Validates both
// 4. Generates new accessToken
// 5. Sends back new accessToken + new refreshToken cookie
```

---

## 💻 Implementation Code Examples

### **Backend - Setting Cookie (Node.js/Express)**

```javascript
// auth.controller.js
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate user...
    const user = await User.findOne({ email });
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTPOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,                    // Cannot access via JS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',                // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      path: '/api'                       // Only sent to /api routes
    });

    // Send response with access token only
    res.json({
      message: "Login successful",
      accessToken,  // Send this only (not refreshToken)
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Refresh endpoint - cookie sent automatically by browser
exports.refreshToken = async (req, res) => {
  try {
    // Get refreshToken from cookies (automatic)
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not provided" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Find user and verify token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    } = generateTokens(user._id, user.role);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token as cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api'
    });

    res.json({
      message: "Token refreshed",
      accessToken: newAccessToken
      // Note: refreshToken NOT in body (it's in cookie)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout - clear cookie
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    // Clear the cookie
    res.clearCookie('refreshToken', { path: '/api' });

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### **Backend - Server Setup (Express)**

```javascript
// app.js - Must be before routes!
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Enable cookie parsing
app.use(cookieParser());

// CORS configuration - allow credentials
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com'
    : 'http://localhost:4200',
  credentials: true  // ⭐ Important! Allow cookies
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

module.exports = app;
```

### **Frontend - Auth Service (Angular)**

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;
  private tokenRefreshTimer: any;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromToken());
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.startTokenRefreshTimer();
  }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, 
      data,
      { withCredentials: true }  // ⭐ Important! Send cookies
    );
  }

  register(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/register`, 
      data,
      { withCredentials: true }  // ⭐ Important! Send cookies
    );
  }

  /**
   * Save ONLY access token (refresh token is in cookie)
   */
  saveAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    this.currentUserSubject.next(this.getUserFromToken());
    this.startTokenRefreshTimer();
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Refresh access token - backend uses cookie automatically
   */
  refreshAccessToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }  // ⭐ Important! Send cookies
    );
  }

  /**
   * Logout - backend clears cookie
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }  // ⭐ Important! Send cookies
    );
  }

  /**
   * Clear access token from localStorage
   */
  clearAccessToken(): void {
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
    this.clearTokenRefreshTimer();
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUser() {
    return this.currentUserSubject.value;
  }

  private getUserFromToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (e) {
      return true;
    }
  }

  getTimeUntilTokenExpiry(): number {
    const token = this.getAccessToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Math.max(0, payload.exp * 1000 - Date.now());
    } catch (e) {
      return 0;
    }
  }

  private startTokenRefreshTimer(): void {
    this.clearTokenRefreshTimer();
    const timeUntilExpiry = this.getTimeUntilTokenExpiry();
    const refreshTime = Math.max(30000, timeUntilExpiry - 60000);

    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshAccessToken().subscribe({
          next: (response) => {
            this.saveAccessToken(response.accessToken);
          },
          error: (err) => {
            console.error('Token refresh failed:', err);
            this.clearAccessToken();
          }
        });
      }, refreshTime);
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
}
```

### **Frontend - HTTP Interceptor (Angular)**

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get access token
  const accessToken = authService.getAccessToken();

  // Add access token to header
  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken }
    });
  }

  // ⭐ Important! Allow cookies to be sent
  req = req.clone({
    withCredentials: true
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not a refresh request, try to refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap((response) => {
            // Update access token
            authService.saveAccessToken(response.accessToken);
            // Refresh token is in cookie (no need to handle)

            // Retry original request
            const newReq = req.clone({
              setHeaders: { Authorization: 'Bearer ' + response.accessToken }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            console.error('Token refresh failed:', refreshError);
            authService.clearAccessToken();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
```

### **Frontend - Login Component (Angular)**

```typescript
// login.component.ts
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          // Save ONLY access token
          // Refresh token is automatically in cookie
          this.auth.saveAccessToken(res.accessToken);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed';
        }
      });
  }
}
```

---

## 📦 Backend Dependencies

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.0"
  }
}
```

Install:
```bash
npm install cookie-parser
```

---

## 🔐 Environment Variables

```env
# JWT
JWT_SECRET=<strong_access_token_secret>
JWT_REFRESH_SECRET=<strong_refresh_token_secret>

# Node Environment
NODE_ENV=development  # development or production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

---

## ✅ Summary - Where to Store What

| Token | Storage | Why | Security |
|-------|---------|-----|----------|
| **Access Token** | localStorage | Need in JS for headers | 15 min lifespan = limited damage |
| **Refresh Token** | HTTPOnly Cookie | Not accessible to JS | XSS safe, CSRF protected |

---

## 🎯 Security Benefits

✅ **XSS Protection**: Even if attacker injects JavaScript, they can't steal refresh token  
✅ **CSRF Protection**: SameSite cookie prevents cross-site requests  
✅ **Automatic Sending**: Browser automatically includes refresh token in requests  
✅ **Limited Damage**: Access token compromise only lasts 15 minutes  
✅ **Best Practice**: Follows OWASP and modern security standards  

---

## ⚠️ Important: Switching from localStorage to Cookies

If you're updating the implementation:

1. Clear localStorage refresh tokens
2. Update backend to set cookies
3. Update frontend to only use localStorage for access token
4. Update interceptor to use `withCredentials: true`
5. Test on different domains (localhost won't show SameSite issues)

