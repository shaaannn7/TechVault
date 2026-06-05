# TechVault Local Debugging & Running Guide

## ✅ Current Status

**Backend**: ✅ Running on `http://localhost:5000`
- MongoDB: ✅ Connected
- Environment: Development
- Nodemon: ✅ Active (watches for file changes)

**Frontend**: ✅ Running on `http://localhost:3000`
- Next.js: ✅ Active
- Environment: Development

---

## 📋 Quick Start Checklist

### ✅ Already Completed
- [x] Dependencies installed (backend & frontend)
- [x] TypeScript configured
- [x] Environment variables set (.env)
- [x] MongoDB connection working
- [x] Backend server running
- [x] Frontend server running
- [x] Fixed TypeScript import errors in noteController.ts

### ⚠️ Issues Fixed During Setup
1. **TypeScript Error**: Missing imports in `noteController.ts`
   - **Problem**: `Note` and `User` models not imported
   - **Solution**: Added `import Note from '../models/Note'` and `import User from '../models/User'`
   - **Status**: ✅ FIXED

2. **MongoDB Connection**
   - **Problem**: Invalid MongoDB Atlas URI
   - **Solution**: Changed to local MongoDB connection (`mongodb://localhost:27017/techvault`)
   - **Status**: ✅ FIXED

---

## 🚀 How to Access the Application

### Frontend
```
URL: http://localhost:3000
```

### Backend API
```
Base URL: http://localhost:5000/api
Health Check: http://localhost:5000/api/health
```

---

## 🔌 API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Notes
```bash
# Get all notes
GET /api/notes

# Get note by ID
GET /api/notes/:id

# Upload note (requires authentication)
POST /api/notes
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [PDF file]
title: "Note Title"
semester: 3
branch: "CSE"
category: "Lecture Notes"
```

### Admin
```bash
# Get dashboard
GET /api/admin/dashboard
Authorization: Bearer ADMIN_TOKEN

# Get pending notes
GET /api/admin/pending-notes
Authorization: Bearer ADMIN_TOKEN

# Approve note
POST /api/admin/notes/:id/approve
Authorization: Bearer ADMIN_TOKEN

# Reject note
POST /api/admin/notes/:id/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

---

## 🐛 Debugging Guide

### Browser DevTools

**Console** (F12 → Console):
- Check for JavaScript errors
- Look for CORS errors
- Monitor network requests

**Network Tab** (F12 → Network):
- Verify API requests are being sent
- Check response status codes
- Look for failed requests (red)

### Backend Logs

The backend terminal shows:
```
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
🚀 Server is running on http://localhost:5000
MongoDB connected successfully
```

### Common Errors & Solutions

#### 1. **PDF Upload Not Working**
```
Error: Cannot POST /api/notes
Solution:
- Check if auth token is valid
- Verify PDF file is selected
- Check file size < 25MB
- Look at backend console for multer errors
```

#### 2. **Login Failed**
```
Error: Invalid email or password
Solution:
- Verify email exists in database
- Check password is correct
- Try registering a new user first
```

#### 3. **CORS Error**
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution:
- Backend CORS is configured for http://localhost:3000
- If using different port, update FRONTEND_URL in .env
- Restart backend after .env changes
```

#### 4. **MongoDB Connection Failed**
```
Error: MongoDB connection error
Solution:
- Ensure MONGODB_URI in .env is correct
- Check MongoDB service is running
- For local: mongodb://localhost:27017/techvault
- For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db
```

#### 5. **Port Already in Use**
```
Error: EADDRINUSE :::5000
Solution:
- Kill process on port 5000: netstat -ano | findstr :5000
- Then: taskkill /PID <PID> /F
- Or change PORT in .env
```

---

## 📝 Testing Workflow

### 1. Test Backend Only
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Test API
curl http://localhost:5000/api/health
```

### 2. Test Full Stack
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Open browser
# http://localhost:3000
```

### 3. Test API with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

---

## 🔧 Useful Commands

### Backend

```bash
# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### MongoDB

```bash
# Local MongoDB (if installed)
mongod

# Check if running
mongosh

# View databases
show dbs

# Use techvault database
use techvault

# View collections
show collections

# Count documents
db.users.countDocuments()
db.notes.countDocuments()
```

---

## 📁 Project Structure

```
TechVault/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, constants
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middlewares/     # Auth, validation, errors
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers, validators
│   │   ├── server.ts        # Express app setup
│   │   └── validators/      # Request validation
│   ├── uploads/             # PDF files stored here
│   ├── logs/                # Application logs
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                 # Next.js app pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API client
│   ├── public/              # Static assets
│   ├── .env.local           # Frontend env vars
│   ├── package.json
│   └── tsconfig.json
│
├── .env files               # Environment configuration
├── package.json             # Root package
└── README.md                # Documentation
```

---

## 🛠️ Troubleshooting Checklist

- [ ] Both servers running (backend on 5000, frontend on 3000)
- [ ] MongoDB connected
- [ ] .env files configured
- [ ] No TypeScript errors
- [ ] Browser DevTools show no errors
- [ ] Backend logs show requests
- [ ] API endpoints return data
- [ ] Frontend displays content
- [ ] Can register and login
- [ ] Can upload PDF

---

## 📊 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techvault
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=TechVault
```

---

## 🚨 Emergency Fixes

### If backend won't start
```bash
# Clear ts-node cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

### If frontend won't start
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

### If MongoDB connection fails
```bash
# Check if MongoDB is running
mongosh

# If not installed, use local memory or update MONGODB_URI
# Options:
# 1. Install MongoDB locally
# 2. Use MongoDB Atlas (cloud)
# 3. Use mongodb-memory-server for testing
```

---

## ✨ Next Steps

1. **Test the application** at `http://localhost:3000`
2. **Register a new user** (creates account)
3. **Login** with your credentials
4. **Upload a PDF** note (test file upload)
5. **View dashboard** (see your uploads)
6. **Check admin panel** (if user has admin role)

---

## 📞 Support

- Check console logs for errors
- Verify all servers are running
- Ensure .env variables are correct
- Check MongoDB connection
- Review network requests in DevTools

---

**TechVault is ready to use!** 🎉

Backend: http://localhost:5000  
Frontend: http://localhost:3000  

Last updated: 2026-05-22 11:35:50
