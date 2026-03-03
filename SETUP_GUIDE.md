# MEAN Stack Healthcare App - Complete Setup Guide

This guide covers the complete integration of frontend and backend with JWT authentication.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           Frontend (Angular 21)                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Components: Login, Register, Dashboard            │ │
│  │ Services: AuthService                             │ │
│  │ Guards: roleGuard                                 │ │
│  │ Interceptors: authInterceptor                     │ │
│  └────────────────────────────────────────────────────┘ │
│                       ↕ HTTP                            │
└─────────────────────────────────────────────────────────┘
                      JWT Token in
                   Authorization Header
                            ↕
┌─────────────────────────────────────────────────────────┐
│ Backend (Node.js + Express + MongoDB)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Routes: /api/auth, /api/protected                 │ │
│  │ Middleware: verifyToken, authorize                │ │
│  │ Controllers: authController                       │ │
│  │ Models: User (Mongoose)                           │ │
│  └────────────────────────────────────────────────────┘ │
│                        ↕                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │         MongoDB Database                          │ │
│  │    (Stores users with hashed passwords)           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📋 Authentication Flow

### 1. Registration Flow
```
User Form → POST /api/auth/register
           → Validation (name, email, password)
           → Check if email exists
           → Hash password (bcryptjs)
           → Save user to MongoDB
           → Generate JWT token
           → Return token + user data
           → Store token in localStorage
           → Redirect to dashboard
```

### 2. Login Flow
```
User Form → POST /api/auth/login
          → Validate email & password
          → Find user by email
          → Compare password with hash
          → Generate JWT token
          → Return token + user data
          → Store token in localStorage
          → Redirect to dashboard
```

### 3. Protected Route Access
```
Dashboard Request → authInterceptor adds token header
                 → GET /api/protected/profile
                 → verifyToken middleware validates JWT
                 → If valid: req.user = decoded token
                 → If invalid: 401 Unauthorized
                 → roleGuard checks user role
                 → If authorized: render dashboard
                 → If not: reject access
```

## 🔑 JWT Token Structure

The JWT token contains:
```
Header.Payload.Signature

Payload: {
  id: "user_id_from_mongodb",
  role: "ADMIN|DOCTOR|RECEPTIONIST",
  iat: "issued_at_timestamp",
  exp: "expiration_timestamp"
}
```

Client extracts the payload to get user info without API call.

## 🚀 Quick Start

### Step 1: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/healthcare
# JWT_SECRET=your_secret_key_here
# NODE_ENV=development

# Start MongoDB (if local)
mongod

# Seed demo users (optional)
npm run seed

# Start development server
npm run dev
```

Server will be at: `http://localhost:5000`

### Step 2: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

Application will be at: `http://localhost:4200`

### Step 3: Test Integration
1. Open `http://localhost:4200` in browser
2. Click "Sign up here" for registration
3. Or use demo credentials:
   - Email: `admin@example.com`
   - Password: `password123`
4. View JWT token in browser console:
   ```javascript
   console.log(localStorage.getItem('token'))
   ```

## 🔐 Security Implementation

### Backend (server-side security)
```javascript
// Password Hashing
const bcrypt = require('bcryptjs');
password = await bcrypt.hash(password, 10);

// JWT Verification
const jwt = require('jsonwebtoken');
jwt.verify(token, process.env.JWT_SECRET);

// CORS Configuration
cors({
  origin: "http://localhost:4200",
  credentials: true
})
```

### Frontend (client-side security)
```typescript
// Token Storage
localStorage.setItem('token', token);

// Automatic Token Injection
authInterceptor({
  Authorization: 'Bearer ' + token
})

// Role-Based Access
canActivate: [roleGuard],
data: { roles: ['ADMIN', 'DOCTOR'] }
```

## 📁 File Structure Breakdown

### Backend Files

**app.js** - Main Express configuration
- CORS setup
- Middleware (JSON parsing)
- Route mounting
- Error handling

**server.js** - Entry point
- MongoDB connection
- Server startup

**controllers/auth.controller.js** - Login/Register logic
- Input validation
- Password hashing
- JWT token generation
- Error handling

**models/user.model.js** - User schema
- Fields: name, email, password, role
- Pre-save hook: password hashing
- Indexes: email (unique)

**routes/auth.routes.js** - Auth endpoints
- POST /register
- POST /login

**routes/protected.routes.js** - Protected endpoints
- GET /profile (requires JWT)

**middleware/auth.middleware.js** - JWT validation
- verifyToken: validates JWT
- authorize: checks user role

### Frontend Files

**app.config.ts** - Angular configuration
- HTTP client provider
- Auth interceptor provider
- Router provider

**app.routes.ts** - Route definitions
- '/' → LoginComponent
- '/register' → RegisterComponent
- '/dashboard' → DashboardComponent (guarded)

**core/auth.service.ts** - Auth methods
- login(email, password)
- register(userData)
- saveToken(token)
- getToken()
- logout()
- getRole()

**core/auth.interceptor.ts** - HTTP interceptor
- Adds Authorization header to all requests
- Format: Bearer <token>

**core/role.guard.ts** - Route guard
- Checks if user has required role
- Prevents unauthorized access

**pages/login.component.ts** - Login UI
- Email/password form
- Error messages
- Redirect to dashboard

**pages/register.component.ts** - Registration UI
- Name, email, password, role form
- Validation
- Success/error messages

**pages/dashboard.component.ts** - Protected dashboard
- User info display
- Role-specific content
- Logout button

**environments/environment.ts** - API configuration
- apiUrl: http://localhost:5000/api

## 🧪 Testing the Integration

### Test 1: Registration
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "DOCTOR"
}
```

### Test 2: Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "DOCTOR"
  }
}
```

### Test 3: Protected Route
```bash
GET http://localhost:5000/api/protected/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "message": "This is a protected route",
  "user": {
    "id": "...",
    "role": "DOCTOR"
  }
}
```

## 🐛 Debugging Tips

### Check Token in Browser
```javascript
// In browser console
localStorage.getItem('token')

// Decode token payload
const token = localStorage.getItem('token');
JSON.parse(atob(token.split('.')[1]))
```

### Check Backend Logs
```bash
# Terminal running npm run dev
[Should show incoming requests and errors]
```

### Network Tab in DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Make login request
4. Check:
   - Response has token
   - Headers include Authorization
   - Token format: "Bearer <token>"

### MongoDB Check
```bash
# Connect to MongoDB
mongosh

# Use database
use healthcare

# View users
db.users.find()

# Check if password is hashed
db.users.findOne({ email: "admin@example.com" })
```

## 🚨 Common Issues & Solutions

### Issue: "Cannot POST /api/auth/login"
**Solution**: Backend not running or wrong port
```bash
# Check backend is running
npm run dev

# Verify port is 5000
echo $PORT
# or on Windows
echo %PORT%
```

### Issue: "401 Invalid token"
**Solution**: Token expired or malformed
```javascript
// Regenerate token by re-logging
localStorage.removeItem('token');
// Login again
```

### Issue: "CORS error"
**Solution**: Wrong API URL in frontend
- Check `environment.ts` has correct URL
- Check backend CORS config allows `localhost:4200`

### Issue: "MongoDB connection failed"
**Solution**: MongoDB not running
```bash
# Start MongoDB
mongod

# Or connection string wrong
# Check MONGO_URI in .env
```

## 📦 Dependencies

### Backend
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT handling
- bcryptjs: Password hashing
- cors: Cross-origin requests
- dotenv: Environment variables
- nodemon: Development auto-reload

### Frontend
- @angular/core: Core framework
- @angular/router: Routing
- @angular/common: Common utilities
- @angular/forms: Form handling
- rxjs: Reactive programming

## 🎯 Next Steps

After setup is working:

1. **Add more routes**
   - POST /api/patients
   - GET /api/patients/:id
   - PUT /api/appointments

2. **Expand dashboard**
   - List patients
   - Schedule appointments
   - View reports

3. **Add validation**
   - Email format
   - Strong passwords
   - Phone number validation

4. **Improve security**
   - Refresh token mechanism
   - Password reset flow
   - Email verification

5. **Production deployment**
   - Deploy backend to Heroku/AWS
   - Deploy frontend to Vercel/Netlify
   - Update environment URLs
   - Use strong JWT_SECRET
   - Enable HTTPS

## 📞 Support

Check these files for detailed implementation:
- Backend: `backend/src/controllers/auth.controller.js`
- Frontend: `frontend/src/app/core/auth.service.ts`
- Routes: Both `app.routes.ts` and `backend/src/routes/`

Good luck! 🚀
