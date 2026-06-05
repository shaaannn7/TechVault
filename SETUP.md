# TechVault - Quick Start Guide

Complete setup instructions to get TechVault running locally.

## Prerequisites

Before you start, ensure you have:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud, free tier)
- **Cloudinary Account** - [Sign up free](https://cloudinary.com/users/register/free)

## Step 1: Prepare Environment Variables

### Backend Setup

Navigate to `backend` folder and create `.env` file:

```bash
cd backend
copy .env.example .env
```

Update `.env` with your values:

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techvault

# Generate secret with: openssl rand -base64 32
JWT_SECRET=your_generated_secret_here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**How to get Cloudinary credentials:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret

### Frontend Setup

Navigate to `frontend` folder:

```bash
cd frontend
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=TechVault
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or start manually
mongod

# Verify connection
mongosh
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Use in MONGODB_URI in `.env`

**Example MongoDB Atlas URI:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/techvault?retryWrites=true&w=majority
```

## Step 3: Install & Start Backend

```bash
cd backend

# Install all dependencies
npm install

# Verify it runs (should say "Server is running on http://localhost:5000")
npm run dev
```

**Terminal output should show:**
```
🚀 Server is running on http://localhost:5000
MongoDB connected successfully
```

The server runs on **http://localhost:5000**

## Step 4: Install & Start Frontend (New Terminal)

```bash
cd frontend

# Install all dependencies
npm install

# Start dev server
npm run dev
```

**Terminal output should show:**
```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
```

The frontend runs on **http://localhost:3000**

## Step 5: Test the Application

### 1. Open Browser
Navigate to: **http://localhost:3000**

You should see the TechVault landing page.

### 2. Test Authentication

**Sign Up:**
1. Click "Sign Up" button
2. Fill in: Name, Email, Password
3. Click "Sign Up"
4. Should be redirected to Dashboard

**Login:**
1. Click "Login"
2. Use your registered credentials
3. Click "Login"

### 3. Test Features

- **Notes Library:** Click "Notes" in navbar
- **PYQ Section:** Click "PYQ" in navbar
- **Dashboard:** Click your name (when logged in)
- **Bookmarks:** Add notes to bookmarks on Notes page

## Step 6: Test Backend API (Optional)

Using cURL or Postman:

### Check API Health
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "message": "Server is running",
  "timestamp": "2026-05-19T..."
}
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response includes `token` - use this for protected endpoints.

### Get Notes
```bash
curl http://localhost:5000/api/notes
```

### Get User Profile (Protected)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh`
- Check connection string in `.env`
- For Atlas: ensure IP is whitelisted

### CORS Error
- Frontend URL must match FRONTEND_URL in backend `.env`
- Ensure both servers are running
- Check that API URL in `.env.local` matches backend

### Dependencies Installation Error
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Project Structure Overview

```
TechVault/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Main Express app
│   │   ├── config/             # DB & service configs
│   │   ├── controllers/        # API logic
│   │   ├── middlewares/        # Auth, validation, error handling
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API endpoints
│   │   └── validators/         # Request validation rules
│   ├── .env                    # Environment variables
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── auth/               # Login/signup pages
    │   ├── pages/              # App pages (notes, pyq, dashboard, admin)
    │   ├── page.tsx            # Landing page
    │   └── layout.tsx          # Root layout with Navbar
    ├── components/
    │   ├── common/             # Navbar, Footer, etc.
    │   ├── ui/                 # Button, Input, etc.
    │   └── forms/              # Form components
    ├── lib/
    │   ├── api/                # API client
    │   ├── store/              # Zustand stores
    │   └── hooks/              # Custom hooks
    ├── .env.local              # Frontend environment variables
    └── package.json
```

## Running in Production

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
npm start
```

## Docker Setup (Optional)

Create `docker-compose.yml` at project root:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: techvault

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/techvault
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up
```

## Next Steps

1. **Create Admin Account** - Manually set role to 'admin' in MongoDB
2. **Upload Sample Notes** - Use the upload feature
3. **Test Admin Panel** - Navigate to /admin (admin users only)
4. **Deploy** - Use Vercel (frontend) + Railway/Render (backend)

## Support

For issues:
1. Check `.env` files are configured correctly
2. Ensure MongoDB is running
3. Check console logs in terminal
4. Verify ports 3000 and 5000 are free

---

**Happy learning with TechVault! 🎓**
