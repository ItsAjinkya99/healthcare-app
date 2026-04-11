# Refresh Token Environment Setup

## Backend Configuration

### 1. Create/Update `.env` file in the backend root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthcare-app

# JWT Configuration
JWT_SECRET=your_access_token_secret_key_123456789
JWT_REFRESH_SECRET=your_refresh_token_secret_key_987654321

# Server
PORT=3000
NODE_ENV=development
```

### 2. Generate Secure Secret Keys

Use Node.js to generate strong random secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command twice to generate both secrets:
- First output → `JWT_SECRET`
- Second output → `JWT_REFRESH_SECRET`

### ⚠️ Important Security Notes:

1. **Never commit `.env` to version control**
   - Add `.env` to `.gitignore`

2. **Use different secrets for each environment** (dev, staging, production)

3. **In production**, use environment variables from your hosting platform:
   - Heroku: Use Config Vars
   - AWS: Use Systems Manager Parameter Store or Secrets Manager
   - Azure: Use Key Vault
   - Docker: Use Docker Secrets or environment variables

### 3. Example `.env` for Local Development:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthcare-app

# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v

# Server
PORT=3000
NODE_ENV=development

# Optional: Database Local Setup
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=healthcare-app
```

---

## Frontend Configuration

### 1. Environment Files

The frontend already has environment configuration in:
- `frontend/src/environments/environment.ts` (development)
- `frontend/src/environments/environment.prod.ts` (production)

### 2. Example `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Example `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

---

## Verification Steps

### Backend Verification:

1. **Check Node.js dependencies are installed:**
   ```bash
   cd backend
   npm install
   ```

2. **Verify `.env` file exists:**
   ```bash
   ls -la .env  # Linux/Mac
   dir .env     # Windows
   ```

3. **Start the backend:**
   ```bash
   npm run dev  # or npm start
   ```

4. **Check console output:**
   ```
   ✓ Server is running on port 3000
   ✓ MongoDB connected
   ```

### Frontend Verification:

1. **Check dependencies are installed:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   ng serve  # or npm start
   ```

3. **Check Angular is running:**
   ```
   Application bundle generated successfully
   ```

---

## Testing the Complete Flow

### 1. **Test Registration:**
   - Go to http://localhost:4200/register
   - Fill in the form and submit
   - Should redirect to login after success

### 2. **Test Login:**
   - Go to http://localhost:4200/login
   - Use the credentials from registration
   - Should redirect to dashboard
   - Check browser DevTools → Application → Local Storage
   - Should see: `accessToken` and `refreshToken`

### 3. **Test Token Refresh (Manual):**
   - Open browser DevTools → Network tab
   - Make any API request to a protected endpoint
   - Should see Bearer token in request header
   - Wait for access token to expire (or edit the timestamp in token)
   - Make another request
   - Should see a 401 response
   - Interceptor automatically calls `/auth/refresh`
   - New tokens saved to localStorage
   - Original request retried and succeeds

### 4. **Test Logout:**
   - Click logout button
   - Should redirect to login
   - Check localStorage - tokens should be cleared

---

## Troubleshooting Setup

### Error: "Cannot find module 'jsonwebtoken'"
```bash
cd backend
npm install jsonwebtoken
```

### Error: "JWT_SECRET is not defined"
- Make sure `.env` file exists in backend root
- Check syntax: `JWT_SECRET=value` (no spaces around `=`)
- Restart the server after creating `.env`

### Error: "MONGODB_URI is not defined"
- Install MongoDB locally or use MongoDB Atlas
- Update MONGODB_URI in `.env`
- Example Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/db-name`

### Error: "Cannot GET /api/auth/login"
- Check if backend port is correct (default: 3000)
- Check if auth routes are properly imported in `app.js`
- Check if API URL is correct in `environment.ts`

### Error: "No access to XMLHttpRequest at 'localhost:3000'"
- This is likely a CORS issue
- Check if backend has CORS middleware enabled
- Example: `app.use(cors())`

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Set `production: true` in `environment.prod.ts`
- [ ] Use strong, randomly generated JWT secrets
- [ ] Use different secrets for production
- [ ] Store secrets in environment variables (not in code)
- [ ] Enable HTTPS for all communication
- [ ] Use HTTPOnly cookies for refresh tokens (optional but recommended)
- [ ] Set up CORS properly for your domain
- [ ] Update API URL to production domain
- [ ] Test token refresh in production
- [ ] Set up monitoring/logging for auth errors

---

## Quick Start Commands

### Backend:
```bash
cd backend
npm install
# Create .env file with secrets
npm run dev
```

### Frontend:
```bash
cd frontend
npm install
ng serve
```

### Access the application:
```
Frontend: http://localhost:4200
Backend: http://localhost:3000
```

---

## Notes

- Access tokens expire after **15 minutes**
- Refresh tokens expire after **7 days**
- Auto-refresh happens **1 minute before** access token expires
- Tokens are stored in **localStorage** (consider using secure cookies in production)
- All API requests automatically include the access token
- Expired access tokens are automatically refreshed by the interceptor
