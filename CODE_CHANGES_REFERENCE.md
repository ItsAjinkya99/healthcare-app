# Code Changes Summary - HTTPOnly Cookies Implementation

## Quick Reference - What Changed?

### Backend Changes

#### 1. app.js - Add Cookie Parser

```javascript
// ADD THIS IMPORT
const cookieParser = require("cookie-parser");

// ADD THIS MIDDLEWARE (before routes!)
app.use(cookieParser());

// UPDATE CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : "http://localhost:4200",
  credentials: true  // ← IMPORTANT!
}));
```

#### 2. auth.controller.js - Set Refresh Token as Cookie

**Login Response - BEFORE:**
```javascript
res.json({
  message: "Login successful",
  accessToken,
  refreshToken,  // ← REMOVE THIS
  user: { /* ... */ }
});
```

**Login Response - AFTER:**
```javascript
// Set refresh token as HTTPOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api'
});

res.json({
  message: "Login successful",
  accessToken,
  // refreshToken removed from body - it's in cookie!
  user: { /* ... */ }
});
```

#### 3. auth.controller.js - Read from Cookies on Refresh

**Refresh Endpoint - BEFORE:**
```javascript
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;  // ← FROM BODY
  
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  // ...
};
```

**Refresh Endpoint - AFTER:**
```javascript
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;  // ← FROM COOKIES
  
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not provided" });
  }
  
  // ... same validation logic
  
  // Set new refresh token as cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api'
  });
  
  res.json({
    message: "Token refreshed successfully",
    accessToken: newAccessToken
    // NOT returning refreshToken in body
  });
};
```

#### 4. auth.controller.js - Clear Cookie on Logout

**Logout - BEFORE:**
```javascript
await User.findByIdAndUpdate(userId, { refreshToken: null });
res.json({ message: "Logout successful" });
```

**Logout - AFTER:**
```javascript
await User.findByIdAndUpdate(userId, { refreshToken: null });

// Clear the cookie
res.clearCookie('refreshToken', { path: '/api' });

res.json({ message: "Logout successful" });
```

#### 5. package.json - Install Dependency

```bash
npm install cookie-parser
```

---

### Frontend Changes

#### 1. auth.service.ts - Only Manage Access Token

**Login - BEFORE:**
```typescript
login(data: any): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data);
}

saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);  // ← REMOVE
  this.currentUserSubject.next(this.getUserFromToken());
  this.startTokenRefreshTimer();
}

getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}
```

**Login - AFTER:**
```typescript
login(data: any): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    `${this.apiUrl}/auth/login`, 
    data,
    { withCredentials: true }  // ← ADD THIS
  );
}

saveAccessToken(accessToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  // Don't touch refreshToken - it's in cookies!
  this.currentUserSubject.next(this.getUserFromToken());
  this.startTokenRefreshTimer();
}

// Remove getRefreshToken() - not needed!
```

#### 2. auth.service.ts - Update Refresh Method

**Before:**
```typescript
refreshAccessToken(): Observable<AuthResponse> {
  const refreshToken = this.getRefreshToken();
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { 
    refreshToken  // ← PASSING IN BODY
  });
}
```

**After:**
```typescript
refreshAccessToken(): Observable<{ accessToken: string }> {
  return this.http.post<{ accessToken: string }>(
    `${this.apiUrl}/auth/refresh`,
    {},  // ← EMPTY BODY
    { withCredentials: true }  // ← BROWSER SENDS COOKIE
  );
}
```

#### 3. auth.service.ts - Update Logout

**Before:**
```typescript
logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/logout`, {});
}

clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');  // ← REMOVE
  this.currentUserSubject.next(null);
  this.clearTokenRefreshTimer();
}
```

**After:**
```typescript
logout(): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/auth/logout`,
    {},
    { withCredentials: true }  // ← ADD THIS
  );
}

clearAccessToken(): void {
  localStorage.removeItem('accessToken');
  // Don't clear refreshToken - it's in cookies!
  this.currentUserSubject.next(null);
  this.clearTokenRefreshTimer();
}
```

#### 4. auth.service.ts - Update Timer Refresh

**Before:**
```typescript
private startTokenRefreshTimer(): void {
  // ... timer logic
  this.tokenRefreshTimer = setTimeout(() => {
    this.refreshAccessToken().subscribe({
      next: (response: AuthResponse) => {
        this.saveTokens(response.accessToken, response.refreshToken);
      },
      error: (err) => {
        console.error('Token refresh failed:', err);
        this.clearTokens();  // ← REMOVE
      }
    });
  }, refreshTime);
}
```

**After:**
```typescript
private startTokenRefreshTimer(): void {
  // ... timer logic
  this.tokenRefreshTimer = setTimeout(() => {
    this.refreshAccessToken().subscribe({
      next: (response) => {
        this.saveAccessToken(response.accessToken);
        // New refresh token in cookie (no need to save)
      },
      error: (err) => {
        console.error('Token refresh failed:', err);
        this.clearAccessToken();  // ← RENAMED
      }
    });
  }, refreshTime);
}
```

#### 5. auth.interceptor.ts - Add withCredentials

**Before:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap((response: any) => {
            authService.saveTokens(response.accessToken, response.refreshToken);
            // ...
          })
        );
      }
    })
  );
};
```

**After:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken }
    });
  }

  // ADD THIS - Allow cookies with every request!
  req = req.clone({
    withCredentials: true
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap((response: any) => {
            authService.saveAccessToken(response.accessToken);
            // New refresh token auto in cookie

            const newReq = req.clone({
              setHeaders: { Authorization: 'Bearer ' + response.accessToken },
              withCredentials: true  // ← ADD THIS
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            authService.clearAccessToken();  // ← RENAMED
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
```

#### 6. login.component.ts - Update Method Call

**Before:**
```typescript
this.auth.login({ email: this.email, password: this.password })
  .subscribe({
    next: (res) => {
      this.auth.saveTokens(res.accessToken, res.refreshToken);  // ← REMOVE
      this.router.navigate(['/dashboard']);
    }
  });
```

**After:**
```typescript
this.auth.login({ email: this.email, password: this.password })
  .subscribe({
    next: (res) => {
      this.auth.saveAccessToken(res.accessToken);  // ← RENAMED
      this.router.navigate(['/dashboard']);
    }
  });
```

---

## Summary of Key Changes

| Item | Before | After |
|------|--------|-------|
| packageJson | No cookie-parser | ✅ `npm install cookie-parser` |
| Response Body | `{accessToken, refreshToken}` | ✅ `{accessToken}` |
| Response Headers | None | ✅ `Set-Cookie: refreshToken=...` |
| Refresh Request | `POST` with body | ✅ `POST` with empty body |
| Refresh Request Cookies | None | ✅ Auto-sent by browser |
| Frontend localStorage | Both tokens | ✅ Only accessToken |
| Frontend can read refreshToken | ✅ Yes (risky) | ❌ No (secure) |
| Each HTTP request | Manual header | ✅ Auto header + auto cookies |
| withCredentials | No | ✅ Yes |
| Logout | Clear both tokens | ✅ Clear accessToken + cookie |

---

## Environment Variables (.env)

```env
# These should already be set:
JWT_SECRET=your_strong_secret
JWT_REFRESH_SECRET=your_different_secret

# Add these:
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# For production:
# NODE_ENV=production
# FRONTEND_URL=https://your-domain.com
```

---

## Testing Changes

### Manual Test

```bash
# 1. Login
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password"}'

# Response should include:
# Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

# 2. Make authenticated request
curl -i http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -b cookies.txt

# Cookie automatically included
```

### Browser Test

1. Open DevTools → Network tab
2. Login
3. Check login response → Response Headers
4. Should see `Set-Cookie: refreshToken=...`
5. Go to DevTools → Application → Cookies
6. Verify `refreshToken` shows:
   - HttpOnly: ✓
   - Secure: ✓
   - SameSite: Strict

---

## Files Affected

### Backend
- [backend/package.json](../backend/package.json) - Add cookie-parser
- [backend/src/app.js](../backend/src/app.js) - Add middleware
- [backend/src/controllers/auth.controller.js](../backend/src/controllers/auth.controller.js) - Set/read cookies
- No changes needed: routes, middleware, utils, models

### Frontend
- [frontend/src/app/services/auth.service.ts](../frontend/src/app/services/auth.service.ts) - Access token only
- [frontend/src/app/interceptors/auth.interceptor.ts](../frontend/src/app/interceptors/auth.interceptor.ts) - Add withCredentials
- [frontend/src/app/pages/login/login.component.ts](../frontend/src/app/pages/login/login.component.ts) - Method rename

---

## Deployment Checklist

- [ ] Install cookie-parser: `npm install cookie-parser`
- [ ] Update backend app.js with middleware
- [ ] Update auth.controller.js cookie methods
- [ ] Update frontend auth.service.ts methods
- [ ] Update auth.interceptor.ts withCredentials
- [ ] Update login.component.ts method calls
- [ ] Test locally: login, refresh, logout
- [ ] Test: Check DevTools for HTTPOnly cookies
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor: Watch for auth-related errors
- [ ] Users will be logged out once (need to re-login)

---

## Migration Notes

- **Breaking Change**: Users will be logged out (one-time)
- **Reason**: Refresh tokens moved from localStorage to cookies
- **User Action Required**: They just need to login again
- **No Data Loss**: Their sessions will be recreated
- **Smooth Experience**: Then seamless for 7 days with auto-refresh

This ensures your healthcare app meets security best practices! 🔐
