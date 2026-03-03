# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "string",
  "email": "string (email format)",
  "password": "string (min 6 chars)",
  "role": "ADMIN|DOCTOR|RECEPTIONIST" (optional, defaults to RECEPTIONIST)
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

**Error Responses:**
- **400** - Validation error (missing fields)
- **409** - Email already registered
- **500** - Server error

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah",
    "email": "sarah@hospital.com",
    "password": "securePass123",
    "role": "DOCTOR"
  }'
```

---

### Login User
Authenticate user and get JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

**Error Responses:**
- **400** - Missing email or password
- **401** - Invalid email or password
- **500** - Server error

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Protected Routes

### Get User Profile
Get current authenticated user's profile.

**Endpoint:** `GET /protected/profile`

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "DOCTOR",
    "iat": 1704067200,
    "exp": 1704153600
  }
}
```

**Error Responses:**
- **401** - No token provided or invalid token
- **403** - Token expired
- **500** - Server error

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/protected/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Handling

### Error Response Format
All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (no token or invalid token)
- **403** - Forbidden (invalid role)
- **409** - Conflict (duplicate email)
- **500** - Internal Server Error

---

## Token Structure

### JWT Token Payload
```json
{
  "id": "mongodb_user_id",
  "role": "ADMIN|DOCTOR|RECEPTIONIST",
  "iat": 1704067200,
  "exp": 1704153600
}
```

- `id`: MongoDB user ID
- `role`: User's role in the system
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (1 day from issue)

### Decoding Token (Frontend)
```typescript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.role); // "DOCTOR"
console.log(payload.id);   // "507f1f77bcf86cd799439011"
```

---

## Rate Limiting
Currently no rate limiting. Implement for production:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

---

## User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| ADMIN | System administrator | All endpoints |
| DOCTOR | Medical professional | Patient access, appointments |
| RECEPTIONIST | Reception staff | Appointment scheduling |

---

## Testing with cURL

### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "DOCTOR"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Save Token and Use in Protected Route
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

curl -X GET http://localhost:5000/api/protected/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

1. **Create collection**: "Healthcare API"
2. **Add variable**: `baseUrl` = `http://localhost:5000/api`
3. **Add variable**: `token` = (will be auto-set after login)

### Setup Pre-request Script for Login
```javascript
// Automatically save token after login request
if (pm.response.code === 200) {
  pm.environment.set("token", pm.response.json().token);
}
```

### Use Token in Protected Routes
```
Authorization: Bearer {{token}}
```

---

## Environment Variables Required

```env
PORT=5000                                    # Server port
MONGO_URI=mongodb://localhost:27017/healthcare # MongoDB connection
JWT_SECRET=your_secret_key_change_this      # JWT signing key
NODE_ENV=development                        # Environment
```

---

## CORS Configuration

Current origin allowed:
- `http://localhost:4200` (Frontend development)

For production:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

---

## Future Endpoints (Planned)

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients` - List patients
- `GET /api/patients/:id` - Get patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments
- `PUT /api/appointments/:id` - Update appointment

### Reports
- `GET /api/reports/summary` - System summary
- `GET /api/reports/users` - User statistics

---

## Versioning

Current API Version: **1.0.0**

For future versions, use URL prefix:
- `/api/v1/auth/login`
- `/api/v2/auth/login`

---

## Support & Issues

- Check server logs for detailed error messages
- Verify MongoDB connection: `mongosh`
- Test endpoints with provided cURL examples
- Review SETUP_GUIDE.md for troubleshooting
