# Healthcare Management System - MEAN Stack

A full-stack healthcare management application with JWT authentication and role-based access control.

## Project Structure

```
├── backend/        # Node.js/Express backend
│   ├── src/
│   │   ├── app.js            # Express app setup
│   │   ├── server.js         # Server entry point
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/       # Angular 21 frontend
    ├── src/
    │   ├── app/
    │   │   ├── pages/        # Components
    │   │   ├── core/         # Services, guards, interceptors
    │   │   └── app.routes.ts # Route configuration
    │   └── environments/     # Environment configs
    ├── angular.json
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Angular CLI (v21+)

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables** (`.env` file)
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/healthcare
   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=development
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** (if needed)
   - Edit `src/environments/environment.ts` for development
   - Edit `src/environments/environment.prod.ts` for production

3. **Run development server**
   ```bash
   ng serve
   # or
   npm start
   ```
   Application runs on `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Routes
- `GET /api/protected/profile` - Get current user profile (requires JWT token)

## Authentication Flow

1. **Registration/Login**
   - Send credentials to backend
   - Backend validates and returns JWT token
   - Token stored in `localStorage`

2. **Token Management**
   - Auth interceptor automatically adds `Authorization: Bearer <token>` header to all requests
   - Token decoded client-side to extract user role

3. **Route Protection**
   - `roleGuard` protects dashboard routes
   - Only users with appropriate roles can access

## User Roles

- **ADMIN** - Full system access
- **DOCTOR** - Can manage patients
- **RECEPTIONIST** - Can schedule appointments

## Demo Credentials

Test the application with these accounts:
- Email: `admin@example.com` / Password: `password123`
- Email: `doctor@example.com` / Password: `password123`
- Email: `receptionist@example.com` / Password: `password123`

(Create these users via registration or database seeding)

## Features

✅ JWT Authentication
✅ Role-Based Access Control (RBAC)
✅ User Registration & Login
✅ Protected API Routes
✅ Secure Token Storage
✅ Auto Token Injection via Interceptor
✅ Error Handling
✅ Responsive UI

## Development

### Backend
- Express.js for REST API
- MongoDB with Mongoose
- bcryptjs for password hashing
- jsonwebtoken for JWT handling

### Frontend
- Angular 21 standalone components
- RxJS for reactive programming
- Angular Router with guards
- HTTP Client with interceptors
- Responsive CSS styling

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` in production
2. **Token Expiration**: Set to 1 day (can be adjusted)
3. **CORS**: Configured to accept requests from `http://localhost:4200`
4. **Password**: Hashed using bcryptjs with salt 10

## Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on `http://localhost:5000`
- Check CORS configuration in `backend/src/app.js`
- Verify `environment.ts` has correct API URL

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- Verify connection string format

### "Token not persisting"
- Check browser's localStorage is enabled
- Verify token is being saved after login
- Check browser console for errors

## Build for Production

### Backend
```bash
npm start
```

### Frontend
```bash
ng build --configuration production
```

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please check the code comments or create an issue.
