# Migration Guide: localStorage to HTTPOnly Cookies

## What Changed?

The refresh token storage has been **upgraded from localStorage to HTTPOnly Secure Cookies** - a best practice for securing sensitive credentials.

---

## 🔐 Comparison: Old vs New

### Old Implementation ❌
```
┌─────────────────────────────────┐
│  localStorage                   │
│  ├─ accessToken    ← XSS risk  │
│  └─ refreshToken   ← XSS risk  │
└─────────────────────────────────┘

POST /auth/refresh
Body: { refreshToken: "..." }
```

### New Implementation ✅
```
┌─────────────────────────────────┐
│  localStorage                   │
│  └─ accessToken    ← XSS risk  │
├─────────────────────────────────┤
│  HTTPOnly Cookie                │
│  └─ refreshToken  ← XSS safe!  │
└─────────────────────────────────┘

POST /auth/refresh
Cookies: refreshToken=... (automatic!)
Body: {}
```

---

## Changes Summary

| Component | Old | New |
|-----------|-----|-----|
| **Access Token Storage** | localStorage | localStorage ✓ (unchanged) |
| **Refresh Token Storage** | localStorage | HTTPOnly Cookie ✓ |
| **Refresh Endpoint** | POST body: `{refreshToken}` | Automatic cookie |
| **Login Response** | `{accessToken, refreshToken, user}` | `{accessToken, user}` |
| **Frontend Management** | saveTokens() | saveAccessToken() |
| **Interceptor** | No withCredentials | withCredentials: true |
| **Cookie Parser** | Not needed | Required |

---

## Backend Files Modified

### 1. **app.js**
- ✅ Added `cookie-parser` middleware
- ✅ Updated CORS config with `credentials: true`

```javascript
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(cors({ credentials: true }));
```

### 2. **auth.controller.js**
- ✅ `register()` → Sets refresh token as HTTPOnly cookie, returns only accessToken
- ✅ `login()` → Sets refresh token as HTTPOnly cookie, returns only accessToken
- ✅ `refreshToken()` → Reads from cookies, returns only new accessToken
- ✅ `logout()` → Clears refresh token cookie

### 3. **No changes needed**
- `auth.middleware.js` - Already uses accessToken verification
- `auth.utils.js` - Token generation logic unchanged
- `user.model.js` - Database structure unchanged

---

## Frontend Files Modified

### 1. **auth.service.ts**
**Before:**
```typescript
saveTokens(accessToken, refreshToken) { }
getRefreshToken() { }
```

**After:**
```typescript
saveAccessToken(accessToken) { }
// getRefreshToken() removed - it's in cookie now
```

### 2. **auth.interceptor.ts**
**Added:**
```typescript
withCredentials: true  // Allow cookies
```

### 3. **login.component.ts**
**Before:**
```typescript
this.auth.saveTokens(res.accessToken, res.refreshToken);
```

**After:**
```typescript
this.auth.saveAccessToken(res.accessToken);
```

---

## ✅ Installation & Setup

### 1. Backend - Install cookie-parser

```bash
cd backend
npm install cookie-parser
```

### 2. Environment Variables (add to .env)

```env
# Already configured in CORS and app.js
# Just ensure your secrets are set:
JWT_SECRET=<your_access_token_secret>
JWT_REFRESH_SECRET=<your_refresh_token_secret>
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

### 3. Start the servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
ng serve
```

---

## 🔄 Migration Steps for Existing Users

### If you were using the old implementation:

**Step 1: Backend Update**
```bash
cd backend
npm install cookie-parser

# Update your codebase with new auth.controller.js
# Update your app.js with cookie-parser
```

**Step 2: Frontend Update**
- Clean localStorage of old refresh tokens
  ```javascript
  localStorage.removeItem('refreshToken');
  ```
- Users will be automatically logged out (need to re-login)
- Backend will set new refresh token in cookie

**Step 3: Test the Flow**
1. Login → Check DevTools > Application > Cookies
2. Should see `refreshToken` cookie with:
   - ✅ HttpOnly: checked
   - ✅ Secure: checked (in production)
   - ✅ SameSite: Strict
3. Make API requests
4. Auto-refresh should work seamlessly

**Step 4: Deploy**
```bash
# Backend
git add .
git commit -m "chore: migrate refresh token to HTTPOnly cookies"
git push

# Frontend
git add .
git commit -m "chore: update auth service for cookie-based refresh tokens"
git push
```

---

## API Response Changes

### Login Endpoint
**Old Response:**
```json
{
  "message": "Login successful",
  "accessToken": "...",
  "refreshToken": "...",
  "user": { /* ... */ }
}
```

**New Response:**
```json
{
  "message": "Login successful",
  "accessToken": "...",
  "user": { /* ... */ }
}
```
*Note: `refreshToken` is in Set-Cookie header instead*

### Refresh Endpoint
**Old Request:**
```
POST /api/auth/refresh
{
  "refreshToken": "..."
}
```

**New Request:**
```
POST /api/auth/refresh
{}
```
*Note: refreshToken sent automatically in cookies*

**Old Response:**
```json
{
  "message": "Token refreshed",
  "accessToken": "...",
  "refreshToken": "..."
}
```

**New Response:**
```json
{
  "message": "Token refreshed",
  "accessToken": "..."
}
```
*Note: New refreshToken in Set-Cookie header*

---

## 🐛 Troubleshooting

### Issue: "Cannot set headers after they are sent"
**Cause:** Cookie-parser not loaded before routes
**Solution:** Ensure `app.use(cookieParser())` is before routes in app.js

### Issue: Cookies not being sent with requests
**Cause:** `withCredentials: true` not set
**Solution:**
- Frontend: Set `withCredentials: true` in interceptor ✓ (already done)
- Backend: Set `credentials: true` in CORS ✓ (already done)

### Issue: "SameSite cookie mismatch" warning in production
**Cause:** HTTPS not enabled but Secure flag is set
**Solution:** Only set Secure flag in production (`secure: process.env.NODE_ENV === 'production'`) ✓ (already implemented)

### Issue: Users logged out after update
**Expected Behavior:** Yes, this is normal for the migration
**Explanation:** Refresh tokens moved from localStorage to cookies
**Solution:** Users just need to login again

### Issue: Cookie not visible in DevTools
**Expected:** HTTPOnly cookies are NOT visible in DevTools
**Verification:**
- Go to DevTools → Application → Cookies
- Look for `refreshToken` entry
- Verify "HttpOnly" column shows ✓
- This means it's working correctly and not accessible to JavaScript

---

## Production Deployment

### Environment Setup

```env
# Production
NODE_ENV=production
JWT_SECRET=<strong-production-secret>
JWT_REFRESH_SECRET=<strong-production-secret>
FRONTEND_URL=https://your-frontend-domain.com
```

### CORS Configuration (auto-configured)
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:4200',
  credentials: true
}));
```

### Cookie Security (auto-configured)
```javascript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api'
});
```

---

## Testing the Implementation

### 1. Manual Test

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

**Step 2: Check Response Headers**
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

**Step 3: Make Protected Request**
```bash
curl -X GET http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer <accessToken>" \
  -b cookies.txt
```

### 2. Browser Testing

1. Open DevTools → Network tab
2. Login
3. Check login response → Response Headers
4. Should see `Set-Cookie: refreshToken=...`
5. Check DevTools → Application → Cookies
6. Should see `refreshToken` with HttpOnly flag

---

## Security Improvements

| Security Aspect | Old (localStorage) | New (HTTPOnly Cookie) | Improvement |
|---|---|---|---|
| **XSS Protection** | ❌ Vulnerable | ✅ Protected | Refresh token cannot be stolen via XSS |
| **JavaScript Access** | ✅ Accessible (but risky) | ❌ Not accessible | Prevents accidental exposure |
| **CSRF Protection** | ❌ No | ✅ Yes (SameSite) | Prevents cross-site attacks |
| **Automatic Sending** | ✅ Manual | ✅ Automatic | Reduces code complexity |
| **Transport Security** | ❌ Not enforced | ✅ Secure flag | HTTPS only in production |

---

## FAQ

**Q: Why move refresh token to cookies?**
A: HTTPOnly cookies cannot be accessed by JavaScript, protecting them from XSS attacks. The refresh token lasts 7 days, so protecting it is crucial.

**Q: What if the browser doesn't support cookies?**
A: Very few browsers don't support cookies. Modern apps assume cookies work.

**Q: Can I still use localStorage?**
A: For the access token, yes. For the refresh token, HTTPOnly cookies are the recommended standard.

**Q: Will this work on all domains?**
A: Yes, but ensure CORS is configured correctly with `credentials: true`.

**Q: What about mobile apps?**
A: Mobile apps (React Native, Flutter) typically handle cookies automatically in their HTTP clients.

**Q: Can I test cross-domain?**
A: SameSite=Strict prevents this. For development, consider using SameSite=Lax if needed.

---

## Verification Checklist

- [ ] Backend: `npm install cookie-parser` completed
- [ ] Backend: app.js has cookie-parser and CORS with credentials
- [ ] Backend: auth.controller.js modified with cookie setting
- [ ] Frontend: auth.service.ts uses `saveAccessToken()`
- [ ] Frontend: auth.interceptor.ts has `withCredentials: true`
- [ ] Frontend: login.component.ts calls `saveAccessToken()`
- [ ] Environment: .env has JWT secrets set
- [ ] Test: Login works and returns only accessToken
- [ ] Test: Check DevTools - refreshToken cookie is HTTPOnly
- [ ] Test: Refresh token auto-renewal works
- [ ] Test: Logout clears the cookie
- [ ] Test: Protected routes still work

---

## Next Steps

1. ✅ Update your code with the new implementation
2. ✅ Test locally
3. ✅ Deploy to staging
4. ✅ Test in staging environment
5. ✅ Deploy to production
6. ✅ Existing users will be logged out once and need to re-login (one-time only)

This migration improves security significantly with minimal user disruption!
