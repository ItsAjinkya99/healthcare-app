# Healthcare Management System

A full-stack healthcare application built with MongoDB, Express, Angular, and Node.js (MEAN Stack).

## 📁 Project Structure

```
healthcare-app/
├── backend/        # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Helper functions
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server entry point
│   ├── .env                   # Environment variables (not in git)
│   ├── package.json
│   └── seed.js                # Database seeding script
│
├── frontend/       # Angular 21 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # Business logic services
│   │   │   ├── gaurds/        # Route guards
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   └── app.routes.ts  # Route configuration
│   │   ├── environments/      # Environment configs
│   │   └── main.ts            # App bootstrap
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                 # Git ignore rules
├── .gitattributes             # Git line ending settings
├── README.md                  # This file
├── SETUP_GUIDE.md             # Complete setup instructions
└── package.json               # Root package file (optional)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Angular CLI (v21+)
- MongoDB (local or Atlas cloud)
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy the .env file and update MONGO_URI and JWT_SECRET
# .env file should have:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/healthcare
# JWT_SECRET=your_secret_key_here
# NODE_ENV=development

# Start MongoDB (if local)
mongod

# Seed demo users
npm run seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:4200`

---

## 🔐 Authentication

### Login Credentials (After Seeding)

- **Admin:** admin@example.com / password123
- **Doctor:** doctor@example.com / password123
- **Receptionist:** receptionist@example.com / password123

### Registration

Users can register new accounts via the signup page.

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup and troubleshooting
- **[backend/API_DOCS.md](backend/API_DOCS.md)** - REST API documentation
- **[backend/LOGIN_SETUP_GUIDE.md](backend/LOGIN_SETUP_GUIDE.md)** - Login/auth troubleshooting
- **[frontend/GUARDS_GUIDE.md](frontend/GUARDS_GUIDE.md)** - Route guards explanation
- **[frontend/OBSERVABLES_GUIDE.md](frontend/OBSERVABLES_GUIDE.md)** - RxJS observables

---

## 🛠️ Available Commands

### Backend
```bash
cd backend

npm run dev           # Start with auto-reload (nodemon)
npm start             # Production start
npm run seed          # Create demo users
npm run check-users   # List users in database
npm run test-login    # Test login endpoint
```

### Frontend
```bash
cd frontend

npm start             # Start development server
npm run build         # Build for production
npm run test          # Run unit tests
ng generate component # Generate new component
```

---

## 📦 Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Nodemon** - Development auto-reload

### Frontend
- **Angular 21** - Frontend framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Angular Router** - Routing with guards
- **HTTP Client** - API communication
- **SCSS** - Styling

---

## 🔒 Security Features

✅ JWT token-based authentication  
✅ Password hashing with bcryptjs (salt: 10)  
✅ Role-based access control (RBAC)  
✅ Route guards for frontend protection  
✅ Protected API endpoints  
✅ HTTP interceptors for token injection  
✅ CORS configured  
✅ Environment variables for sensitive data

---

## 🧪 Testing

### Test Login
```bash
cd backend
npm run test-login
```

### Check Database
```bash
cd backend
npm run check-users
```

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Access protected route with token
curl -X GET http://localhost:5000/api/protected/profile \
  -H "Authorization: Bearer <token>"
```

---

## 📝 Git Workflow

### Clone Repository
```bash
git clone <repository-url>
cd "MEAN Stack app"
```

### Create Feature Branch
```bash
git checkout -b feature/feature-name
```

### Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### Push to Remote
```bash
git push origin feature/feature-name
```

### Pull Latest
```bash
git pull origin main
```

---

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB connection failed** → Check `.env` MONGO_URI
- **Cannot find module** → Run `npm install` in backend
- **Port 5000 in use** → Change PORT in .env

### Frontend Issues
- **Cannot connect to backend** → Check API URL in `environments/environment.ts`
- **Module not found** → Run `npm install` in frontend
- **CORS error** → Verify backend CORS configuration

### Login Issues
- **User not found** → Run `npm run seed` to create demo users
- **Invalid password** → Check password is correct
- **Token not saved** → Check browser localStorage is enabled

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more detailed troubleshooting.

---

## 📋 Environment Variables

### Backend (.env file)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_very_secret_key_change_in_production
NODE_ENV=development
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## 🔄 Development Workflow

1. **Backend Development**
   - Make changes in `backend/src`
   - Server auto-reloads with nodemon
   - Check console logs for errors

2. **Frontend Development**
   - Make changes in `frontend/src`
   - Browser auto-reloads
   - Check browser console for errors

3. **Git Commits**
   - Commit frequently with clear messages
   - Both backend and frontend tracked in same repo
   - Use conventional commit format

---

## 🚀 Deployment

### Backend Deployment (Heroku/AWS)
```bash
cd backend
# Set environment variables
# Deploy
```

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder
```

---

## 📝 Code Style

- **JavaScript/TypeScript:** Use existing patterns
- **Components:** Use standalone components (Angular 14+)
- **Services:** Provide with 'root' injection token
- **CSS:** Use SCSS and BEM naming convention
- **Commits:** Use conventional commit format

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review relevant documentation
3. Check backend/frontend logs
4. Verify environment configuration

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Healthcare Development Team

---

## 🎯 Current Features

✅ User registration and login  
✅ Role-based access control (Admin, Doctor, Receptionist)  
✅ Protected routes with guards  
✅ JWT authentication  
✅ Responsive dashboard  
✅ User profile management  

---

## 🔮 Future Features

- Patient management system
- Appointment scheduling
- Electronic health records
- Doctor-patient messaging
- Prescription management
- Reports and analytics
- Mobile app

---

## 📊 Repository Info

- **Type:** Monorepo (Backend + Frontend)
- **Structure:** Separate folders with single git repo
- **Tracking:** Both frontend and backend in same commits
