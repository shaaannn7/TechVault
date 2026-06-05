# TechVault - Complete Setup & Installation Guide

## Project Overview

TechVault is a modern, full-stack educational platform built with:
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js, MongoDB, JWT Authentication
- **Security**: bcrypt password hashing, rate limiting, request validation
- **File Storage**: Multer for local uploads (configurable for Cloudinary)
- **PDF Handling**: React PDF viewer for preview

## System Requirements

- Node.js >= 18.x
- MongoDB >= 5.0 (Optional, fallback to memory mock available)
- npm or yarn

## Installation Steps

### 1. Clone & Install Dependencies

```bash
cd TechVault

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
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

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: Mock Memory Mode (Fallback)
If no MongoDB connection is detected, the server automatically starts in **Memory Mock Mode**. Data will be reset on server restart.

### 4. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
# In the root directory
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
TechVault/
├── src/                      # React application
│   ├── components/           # UI & functional components
│   ├── context/              # App state (AppContext)
│   ├── pages/                # Landing, Auth, Dashboard, etc.
│   ├── App.jsx               # Navigation & Page Routing
│   └── main.jsx              # App Entry
│
├── backend/                  # Express server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API endpoints
│   │   └── server.ts         # Main server file
│   ├── uploads/              # Local file storage
│   └── package.json
```

## Key Features

### Authentication
- User registration and secure login
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (User, Moderator, Admin)

### Notes Management
- Upload and share study notes (PDF)
- AI Study Assistant (Summaries, Flashcards, Quiz)
- Subject-based organization & Search
- Rating and review system
- Bookmark system

### PYQ Archive
- Previous year questions repository
- Exam board and year filtering
- Download tracking

### Admin Features
- Content moderation queue
- User management (Roles, Status)
- Platform statistics

## Production Deployment

### Backend Deployment
1. Build TypeScript: `npm run build`
2. Start: `npm start`
3. Set environment variables in production

### Frontend Deployment
1. Build: `npm run build`
2. Deploy the `dist` folder to any static hosting (Vercel, Netlify, etc.)


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
