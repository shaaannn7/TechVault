# TechVault - Complete Setup & Installation Guide

## Project Overview

TechVault is a modern, full-stack educational platform built with:
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Backend**: Express.js, MongoDB, JWT Authentication
- **Security**: bcrypt password hashing, rate limiting, request validation
- **File Storage**: Cloudinary for uploads
- **PDF Handling**: PDF.js for preview and rendering

## System Requirements

- Node.js >= 18.x
- MongoDB >= 5.0
- npm or yarn

## Installation Steps

### 1. Clone & Install Dependencies

```bash
cd TechVault

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
Create `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/techvault
DB_NAME=techvault

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_12345
REFRESH_TOKEN_EXPIRE=30d

# Cloudinary (optional for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=TechVault
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Copy connection string and update MONGODB_URI in .env

### 4. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Notes Endpoints

#### Upload Note
```
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Calculus Fundamentals",
  "description": "Complete guide to calculus",
  "subject": "Mathematics",
  "fileUrl": "https://...",
  "fileName": "calculus.pdf",
  "fileSize": 1024000
}
```

#### Get All Notes
```
GET /api/notes?subject=Mathematics&search=calculus&page=1&limit=10
```

#### Get Note by ID
```
GET /api/notes/:id
```

#### Add Bookmark
```
POST /api/notes/:id/bookmark
Authorization: Bearer <token>
```

#### Get User Bookmarks
```
GET /api/notes/user/bookmarks
Authorization: Bearer <token>
```

### PYQ Endpoints

#### Upload PYQ
```
POST /api/pyqs
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2024,
  "subject": "Mathematics",
  "examBoard": "CBSE",
  "difficultyLevel": "Hard",
  "fileUrl": "https://...",
  "fileName": "cbse_2024.pdf",
  "isFree": true
}
```

#### Get All PYQs
```
GET /api/pyqs?examBoard=CBSE&year=2024&difficultyLevel=Hard
```

#### Get PYQ by ID
```
GET /api/pyqs/:id
```

### Search Endpoint

```
GET /api/search?q=calculus&type=notes
```

### Admin Endpoints

#### Get Dashboard Stats
```
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users
```
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Approve Note
```
POST /api/admin/notes/:noteId/approve
Authorization: Bearer <admin_token>
```

#### Get Moderation Queue
```
GET /api/admin/moderation-queue
Authorization: Bearer <admin_token>
```

## Project Structure

```
TechVault/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── config/            # Database & external configs
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Note.ts
│   │   │   ├── PYQ.ts
│   │   │   └── Review.ts
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── pyqController.ts
│   │   │   ├── searchController.ts
│   │   │   └── adminController.ts
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── validators/        # Request validation rules
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx          # Landing page
│   │   ├── notes/            # Notes library
│   │   ├── pyq/              # PYQ section
│   │   ├── dashboard/        # User dashboard
│   │   ├── admin/            # Admin dashboard
│   │   └── auth/             # Auth pages
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── cards/            # Card components
│   │   └── common/           # Layout components
│   ├── lib/
│   │   ├── api.ts            # API calls
│   │   ├── hooks/            # Custom hooks
│   │   └── store/            # Zustand store
│   └── public/               # Static assets
```

## Key Features

### Authentication
- User registration with email validation
- Secure JWT token-based authentication
- Password hashing with bcrypt
- Token refresh mechanism
- Role-based access control (User, Moderator, Admin)

### Notes Management
- Upload and share study notes
- Subject-based organization
- Search functionality
- Rating and review system
- Bookmark system for users
- Download tracking

### PYQ Archive
- Previous year questions from multiple boards
- Difficulty levels (Easy, Medium, Hard)
- Free and premium materials
- Exam board filtering
- Year-based search

### Admin Features
- Content moderation dashboard
- User management
- Content approval/rejection
- Statistics and analytics
- Reported content handling

### Security Features
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- MongoDB injection prevention
- XSS protection

## Database Schema

### User
```typescript
{
  name: String (required, 2-100 chars)
  email: String (required, unique)
  password: String (hashed, min 6 chars)
  avatar: String (optional)
  role: 'user' | 'admin' | 'moderator'
  isVerified: Boolean
  isActive: Boolean
  bookmarks: [ObjectId] (references to Notes)
  createdAt: Date
  updatedAt: Date
}
```

### Note
```typescript
{
  title: String (required, max 200)
  description: String (required, max 1000)
  subject: String (enum)
  fileUrl: String (required)
  fileName: String (required)
  uploadedBy: ObjectId (User reference)
  fileSize: Number
  downloads: Number (default 0)
  rating: Number (0-5)
  reviews: [ObjectId] (Review references)
  tags: [String]
  isPublished: Boolean
  isDraft: Boolean
  createdAt: Date
  updatedAt: Date
}
```

### PYQ
```typescript
{
  year: Number (min 2000)
  subject: String (enum)
  fileUrl: String (required)
  fileName: String (required)
  examBoard: String (CBSE, ICSE, JEE, etc.)
  difficultyLevel: 'Easy' | 'Medium' | 'Hard'
  uploadedBy: ObjectId (User reference)
  downloads: Number (default 0)
  isFree: Boolean (default true)
  createdAt: Date
  updatedAt: Date
}
```

### Review
```typescript
{
  rating: Number (1-5, required)
  comment: String (max 500)
  author: ObjectId (User reference)
  noteId: ObjectId (Note reference)
  createdAt: Date
  updatedAt: Date
}
```

## Production Deployment

### Backend Deployment (Heroku/Railway)
1. Build TypeScript: `npm run build`
2. Start: `npm start`
3. Set environment variables in production

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploys on push to main

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access (Atlas)

### CORS Errors
- Check FRONTEND_URL in backend .env
- Verify NEXT_PUBLIC_API_URL in frontend .env

### Authentication Failures
- Clear browser localStorage
- Check token expiration
- Verify JWT secrets match

## Development Tips

- Use API testing tools: Postman, Insomnia
- Monitor logs: `npm run dev` shows all requests
- Database: Use MongoDB Compass for visual management
- Frontend: Use browser DevTools for debugging

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/feature-name`
5. Create Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, open GitHub Issues or contact the development team.
