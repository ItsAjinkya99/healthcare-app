# Login & Password Authentication - Setup Guide

## Problem: Unable to Login / Find User in Database

Follow these steps to diagnose and fix the issue:

---

## Step 1: Verify MongoDB Connection

Make sure MongoDB is running:

```bash
# On Windows, start MongoDB
mongod

# Or use MongoDB Atlas cloud connection
# Update MONGO_URI in .env file
```

Check if `.env` file has correct MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/healthcare
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare
```

---

## Step 2: Check Users in Database

Run the check-users script to see all users:

```bash
cd backend
npm run check-users
```

This will display:
- ✓ All users in database
- ✓ Password hash for each user
- ✓ Test password comparison
- ✓ Whether passwords are valid

---

## Step 3: Seed Demo Users (If Database is Empty)

If no users are found, create demo users:

```bash
cd backend
npm run seed
```

This creates:
1. **admin@example.com** / password123 (ADMIN role)
2. **doctor@example.com** / password123 (DOCTOR role)
3. **receptionist@example.com** / password123 (RECEPTIONIST role)

**Output should show:**
```
✓ Connected to MongoDB
🗑️  Clearing existing users...
✓ Deleted XX existing users

👥 Creating demo users...
✓ Created 3 demo users:

  1. Email: admin@example.com
     Name: Admin User
     Role: ADMIN
     ID: 507f1f77bcf86cd799439011

  2. Email: doctor@example.com
     Name: Dr. John Smith
     Role: DOCTOR
     ID: 507f1f77bcf86cd799439012

  3. Email: receptionist@example.com
     Name: Jane Doe
     Role: RECEPTIONIST
     ID: 507f1f77bcf86cd799439013

✅ Database seeded successfully!
```

---

## Step 4: Test Login Endpoint

### Using cURL:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Using Postman:

1. Create new POST request
2. URL: `http://localhost:5000/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Using Frontend:

1. Open `http://localhost:4200`
2. Click "Sign up here" to register a new account, or
3. Use demo credentials to login

---

## Step 5: Debug Backend Logs

When you run `npm run dev`, watch the console for logs:

```
✓ User registered: admin@example.com with role ADMIN
Attempting login for email: admin@example.com
✓ User found: admin@example.com
Comparing password...
✓ Password valid for: admin@example.com
✓ Login successful: admin@example.com
```

### If you see errors:

**Error: "User not found"**
- Run `npm run seed` to create demo users
- Or register a new user via frontend

**Error: "Invalid password"**
- Double-check the password is correct
- Make sure password is hashed (pre-save hook should handle this)
- Run `npm run check-users` to test the authentication utility

**Error: "MongoDB connection failed"**
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Test connection: `mongosh` (MongoDB shell)

---

## Step 6: Register New User via Frontend

1. Go to `http://localhost:4200`
2. Click "Sign up here"
3. Fill in the form:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: password123 (min 6 chars)
   - Confirm Password: password123
   - Role: Select DOCTOR or RECEPTIONIST
4. Click "Create Account"
5. You'll be redirected to login
6. Login with your new credentials

---

## Complete Checklist

- [ ] MongoDB is running (`mongod` or Atlas connected)
- [ ] `.env` file exists with correct `MONGO_URI` and `JWT_SECRET`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Run `npm run seed` to create demo users
- [ ] Run `npm run check-users` and verify users exist
- [ ] Backend server running (`npm run dev`)
- [ ] Backend logs show successful password comparison
- [ ] Tested login with cURL or Postman
- [ ] Frontend running (`npm start`)
- [ ] Can login on frontend with credentials

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      ← Improved with logging
│   ├── models/
│   │   └── user.model.js           ← Password hashing in pre-save hook
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── utils/
│       └── auth.utils.js           ← NEW: Auth helper functions
├── seed.js                          ← Improved with better output
├── check-users.js                   ← NEW: Debug utility
├── .env                             ← Add MongoDB URI and JWT_SECRET
└── package.json
```

---

## Key Improvements Made

### 1. **Auth Utils File** (`src/utils/auth.utils.js`)
- Centralized password comparison
- Centralized token generation/verification
- Better error handling

### 2. **Enhanced Auth Controller**
- Console logging for debugging
- Better error messages
- Password validation

### 3. **Improved Seed Script**
- Better formatted output
- Shows user IDs and credentials
- Clearer success message

### 4. **Debug Script** (`check-users.js`)
- Lists all users in database
- Tests password comparison
- Shows password hashes
- Run with: `npm run check-users`

---

## Troubleshooting Commands

```bash
# 1. Check if MongoDB is running
mongosh

# 2. View all users in database
use healthcare
db.users.find()

# 3. Seed demo users
npm run seed

# 4. Check users and test passwords
npm run check-users

# 5. Start backend
npm run dev

# 6. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

## Common Issues & Solutions

### Issue: "email already registered"
**Solution:** Run `npm run seed` which clears old users first

### Issue: "Invalid email or password"
**Solution:** 
1. Run `npm run check-users` to verify users exist
2. Check password is exactly "password123"
3. Verify password isn't being corrupted in transit

### Issue: "Cannot find module"
**Solution:** Run `npm install` in backend folder

### Issue: Backend not responding
**Solution:** 
1. Check backend is running: `npm run dev`
2. Check port 5000 is not blocked
3. Check `.env` file exists

### Issue: MongoDB connection refused
**Solution:**
1. Start MongoDB: `mongod`
2. Install MongoDB if not present
3. Or use MongoDB Atlas (cloud)

---

## Testing Full Flow

1. **Terminal 1 - Start MongoDB:**
   ```bash
   mongod
   ```

2. **Terminal 2 - Start Backend:**
   ```bash
   cd backend
   npm install
   npm seed
   npm run dev
   ```
   Should see: "Server running on 5000"

3. **Terminal 3 - Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Should see: "Application bundle generation complete"

4. **Browser:**
   ```
   http://localhost:4200
   ```
   Login with: `admin@example.com` / `password123`

5. **Check Backend Logs:**
   Should see in Terminal 2:
   ```
   ✓ User found: admin@example.com
   ✓ Password valid for: admin@example.com
   ✓ Login successful: admin@example.com
   ```

---

## Success Indicators

✅ Backend logs show "✓ Login successful"  
✅ Frontend receives JWT token  
✅ Redirected to Dashboard  
✅ User info displayed in dashboard  
✅ Using browser console, see token in localStorage

---

## Next Steps

After successful login:

1. Test role-based access (ADMIN sees more options)
2. Try registering a new user
3. Test logout functionality
4. Try accessing protected routes
5. Implement additional features (patients, appointments, etc.)
