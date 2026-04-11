# JWT Refresh Token Implementation Guide

## Overview
This guide explains the refresh token functionality implemented in the healthcare app. The system uses a two-token approach: **Access Token** (short-lived) and **Refresh Token** (long-lived).

---

## Token Architecture

### Access Token
- **Lifetime**: 15 minutes
- **Purpose**: Used for authenticating API requests
- **Storage**: Sent in Authorization header as `Bearer <accessToken>`
- **Secret**: `JWT_SECRET` environment variable

### Refresh Token
- **Lifetime**: 7 days
- **Purpose**: Used to obtain a new access token when the current one expires
- **Storage**: 
  - Stored in localStorage on the frontend
  - Stored in the database (User model) on the backend
- **Secret**: `JWT_REFRESH_SECRET` environment variable

---

## Backend Implementation

### 1. **User Model** (`backend/src/models/user.model.js`)
- Added `refreshToken` field to store the refresh token in the database
- When a user logs in, their refresh token is saved in the database
- On logout, the refresh token is cleared

```javascript
refreshToken: {
  type: String,
  default: null
}
```

### 2. **Auth Utils** (`backend/src/utils/auth.utils.js`)
New functions added:

#### `generateAccessToken(userId, role)`
- Generates a short-lived JWT token (15 minutes)
- Used for API request authentication

#### `generateRefreshToken(userId, role)`
- Generates a long-lived JWT token (7 days)
- Used to obtain new access tokens

#### `generateTokens(userId, role)`
- Returns both access and refresh tokens in one call
- Used during login and register

#### `verifyAccessToken(token)`
- Verifies the access token using `JWT_SECRET`

#### `verifyRefreshToken(token)`
- Verifies the refresh token using `JWT_REFRESH_SECRET`

### 3. **Auth Controller** (`backend/src/controllers/auth.controller.js`)

#### `login()`
- Generates both access and refresh tokens
- Saves the refresh token to the database
- Returns both tokens to the frontend

#### `register()`
- Same as login - generates both tokens and saves them

#### `refreshToken()` - NEW ENDPOINT
```javascript
POST /auth/refresh
Body: { refreshToken: "..." }
```
- Validates the refresh token from the request body
- Verifies it matches the one stored in the database
- Generates a new access token and optionally a new refresh token
- Returns new tokens to the frontend

#### `logout()` - NEW ENDPOINT
```javascript
POST /auth/logout
Headers: { Authorization: "Bearer <accessToken>" }
```
- Clears the refresh token from the database
- Invalidates the user's session

### 4. **Auth Routes** (`backend/src/routes/auth.routes.js`)
```javascript
POST /auth/register      // Returns both tokens
POST /auth/login         // Returns both tokens
POST /auth/refresh       // Takes refresh token, returns new access token
POST /auth/logout        // Clears refresh token on backend
```

### 5. **Auth Middleware** (`backend/src/middleware/auth.middleware.js`)
- Updated to use `verifyAccessToken()` for validating API requests
- Verifies the short-lived access token, not the refresh token

---

## Frontend Implementation

### 1. **Auth Service** (`frontend/src/app/services/auth.service.ts`)

#### New Methods:

**`saveTokens(accessToken, refreshToken)`**
- Saves both tokens to localStorage
- Starts the automatic token refresh timer

**`getAccessToken()`**
- Returns the access token from localStorage

**`refreshAccessToken(): Observable<AuthResponse>`**
- Calls the `/auth/refresh` endpoint with the refresh token
- Returns new tokens

**`logout(): Observable<any>`**
- Calls the `/auth/logout` endpoint on the backend
- Clears tokens locally

**`clearTokens()`**
- Removes both tokens from localStorage
- Stops the refresh timer
- Clears the current user

**`isAccessTokenExpired(): boolean`**
- Checks if the current access token has expired
- Decodes the JWT to check the expiration time

**`getTimeUntilTokenExpiry(): number`**
- Returns milliseconds until the access token expires

**`startTokenRefreshTimer()` - AUTO-REFRESH LOGIC**
- Automatically refreshes the access token **1 minute before it expires**
- If token expires in 15 minutes, it will refresh after 14 minutes
- Minimum refresh time is 30 seconds

### 2. **Auth Interceptor** (`frontend/src/app/interceptors/auth.interceptor.ts`)

#### Enhanced Functionality:

**Outgoing Requests:**
- Adds the access token to all HTTP requests' Authorization header
- Format: `Authorization: Bearer <accessToken>`

**Response Interception - 401 Error Handling:**
- When a 401 (Unauthorized) error is received:
  1. Calls `/auth/refresh` to get a new access token
  2. Saves the new tokens
  3. Automatically retries the original request with the new token
  4. Transparent to the component - the request succeeds without user interaction

**Error Scenarios:**
- If refresh fails, logs out the user automatically
- Prevents infinite retry loops by checking if the request was already a refresh attempt

```typescript
// Example flow:
1. Component makes API request with expired access token
2. Backend returns 401 (token expired)
3. Interceptor automatically calls /auth/refresh
4. Gets new access token
5. Original request is retried with new token
6. Component receives successful response
```

### 3. **Login Component** (`frontend/src/app/pages/login/login.component.ts`)
- Updated to use `saveTokens(accessToken, refreshToken)` instead of `saveToken(token)`

### 4. **Auth Guard** (existing, no changes required)
- Uses `isLoggedIn()` method which checks if access token exists
- Works seamlessly with the new token structure

---

## Complete Authentication Flow

### Login Flow:
```
1. User submits login credentials
   ↓
2. Frontend sends POST /auth/login request
   ↓
3. Backend validates credentials
   ↓
4. Backend generates:
      - Access Token (15 min expiry)
      - Refresh Token (7 day expiry)
   ↓
5. Backend saves refresh token to database
   ↓
6. Backend returns both tokens to frontend
   ↓
7. Frontend saves both tokens to localStorage
   ↓
8. Frontend starts auto-refresh timer (14 min from now)
   ↓
9. User is redirected to dashboard
```

### Protected API Request Flow (while access token is valid):
```
1. Component makes API request
   ↓
2. Interceptor adds access token to header
   ↓
3. Backend middleware verifies access token
   ↓
4. Request succeeds (200)
```

### Protected API Request Flow (after access token expires):
```
1. Component makes API request
   ↓
2. Interceptor adds expired access token to header
   ↓
3. Backend middleware rejects request (401)
   ↓
4. Interceptor catches 401 error
   ↓
5. Interceptor sends POST /auth/refresh with refresh token
   ↓
6. Backend verifies refresh token against database
   ↓
7. Backend generates new access token
   ↓
8. Backend returns new access token (and optionally new refresh token)
   ↓
9. Frontend saves new tokens
   ↓
10. Interceptor automatically retries original request with new token
    ↓
11. Request now succeeds (200)
    ↓
12. Component receives response as if nothing happened
```

### Auto-Refresh Timer Flow:
```
1. User logs in → Token saved with 15 min expiry
   ↓
2. Timer set for 14 min (1 min before expiry)
   ↓
3. After 14 minutes:
   - Auto-refresh triggered
   - New access token obtained
   - Timer reset for new token
   ↓
4. User can stay logged in indefinitely
   (as long as refresh token is valid)
```

### Logout Flow:
```
1. User clicks logout
   ↓
2. Frontend calls logout() method
   ↓
3. Frontend sends POST /auth/logout with access token
   ↓
4. Backend clears refresh token from database
   ↓
5. Frontend clears both tokens from localStorage
   ↓
6. Frontend stopstimer
   ↓
7. User is redirected to login page
```

---

## Environment Configuration

Add these to your `.env` file in the backend:

```env
JWT_SECRET=your_access_token_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
```

⚠️ **Important**: Use different secrets for access and refresh tokens!

---

## Security Considerations

1. **Token Storage**:
   - ✅ Both tokens stored in localStorage (simple, but less secure)
   - 🔒 Consider using HTTPOnly cookies for refresh tokens (more secure)

2. **Secret Keys**:
   - Always use strong, random secrets
   - Rotate secrets periodically
   - Never commit secrets to version control

3. **Token Expiration**:
   - Access Token: 15 minutes (short-lived)
   - Refresh Token: 7 days (long-lived)
   - Adjust based on your security requirements

4. **Refresh Token Rotation**:
   - Consider rotating refresh tokens on each refresh
   - Implement refresh token blacklisting if needed

5. **HTTPS Only**:
   - Always use HTTPS in production
   - Tokens are passed in headers and should be encrypted in transit

---

## Troubleshooting

### Issue: "Invalid refresh token"
- **Cause**: Refresh token doesn't match the one in the database
- **Solution**: User needs to log in again

### Issue: "Cannot read property 'split' of undefined"
- **Cause**: Token is not in the correct format
- **Solution**: Ensure tokens are being saved and retrieved correctly from localStorage

### Issue: Infinite 401 loops
- **Cause**: Refresh endpoint is returning 401
- **Solution**: Check if JWT_REFRESH_SECRET is set correctly in `.env`

### Issue: "Token appears to be invalid" in console
- **Cause**: Token verification failed
- **Solution**: Ensure access token and refresh token use correct secrets

---

## Testing the Refresh Token

### Manual Testing:

1. **Login**:
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Wait for access token to expire** (or use an expired token for testing)

3. **Refresh token**:
   ```bash
   POST http://localhost:3000/api/auth/refresh
   {
     "refreshToken": "your_refresh_token_here"
   }
   ```

4. **Expected Response**:
   ```json
   {
     "message": "Token refreshed successfully",
     "accessToken": "new_access_token",
     "refreshToken": "new_refresh_token"
   }
   ```

---

## API Response Examples

### Login Response:
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "DOCTOR"
  }
}
```

### Refresh Response:
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout Response:
```json
{
  "message": "Logout successful"
}
```

---

## Files Modified

### Backend:
- ✅ `backend/src/models/user.model.js` - Added refreshToken field
- ✅ `backend/src/utils/auth.utils.js` - Added token generation functions
- ✅ `backend/src/controllers/auth.controller.js` - Updated login/register, added refresh/logout
- ✅ `backend/src/routes/auth.routes.js` - Added new endpoints
- ✅ `backend/src/middleware/auth.middleware.js` - Updated to verify access token

### Frontend:
- ✅ `frontend/src/app/services/auth.service.ts` - Complete rewrite for dual-token handling
- ✅ `frontend/src/app/interceptors/auth.interceptor.ts` - Enhanced with refresh logic
- ✅ `frontend/src/app/pages/login/login.component.ts` - Updated token saving

---

## Next Steps (Optional Enhancements)

1. Implement HTTPOnly cookies for refresh tokens
2. Add refresh token rotation
3. Implement refresh token blacklisting/revocation
4. Add token expiration notifications to users
5. Implement multi-device logout
6. Add rate limiting on refresh endpoint

---

## Questions or Issues?

Refer to the code comments in the modified files for more details on specific implementations.
