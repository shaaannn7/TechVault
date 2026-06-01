# TechVault - Complete Study Platform

A production-ready, full-stack study materials platform built with Next.js 15, Express, MongoDB, and modern web technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **TypeScript** - Type safety

### Backend
- **Node.js + Express** - REST API server
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication & Authorization
- **Bcryptjs** - Password hashing
- **Cloudinary** - File upload & storage
- **Express Validator** - Request validation
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection

## 📁 Project Structure

```
TechVault/
├── frontend/                  # Next.js 15 application
│   ├── app/
│   │   ├── auth/             # Authentication pages (login, signup)
│   │   ├── pages/            # Main app pages (notes, pyq, dashboard, admin)
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── common/           # Shared components (Navbar)
│   │   ├── ui/               # Reusable UI components (Button, Input)
│   │   └── forms/            # Form components
│   ├── lib/
│   │   ├── api/              # API client & endpoints
│   │   ├── hooks/            # Custom React hooks
│   │   └── store/            # Zustand stores
│   ├── public/               # Static assets
│   ├── .env.local            # Frontend environment variables
│   └── package.json
│
├── backend/                  # Express server
│   ├── src/
│   │   ├── config/           # Database & service configs (database.ts, cloudinary.ts)
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── pyqController.ts
│   │   │   ├── adminController.ts
│   │   │   └── searchController.ts
│   │   ├── middlewares/      # Express middlewares
│   │   │   ├── auth.ts       # JWT authentication
│   │   │   ├── validation.ts # Request validation
│   │   │   └── errorHandler.ts
│   │   ├── models/           # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Note.ts
│   │   │   ├── PYQ.ts
│   │   │   └── Review.ts
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   ├── pyqRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── searchRoutes.ts
│   │   ├── validators/       # Request validators
│   │   │   └── index.ts
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Express app setup
│   ├── uploads/              # Local file uploads
│   ├── logs/                 # Application logs
│   ├── .env                  # Backend environment variables
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json
│
└── README.md
```

## 🗄️ Database Models

### User Schema
- name: String
- email: String (unique, indexed)
- password: String (hashed with bcrypt)
- avatar: String
- role: 'user' | 'admin' | 'moderator'
- isVerified: Boolean
- isActive: Boolean
- bookmarks: ObjectId[] (references to Notes)
- createdAt & updatedAt: Timestamps

### Note Schema
- title: String (indexed for search)
- description: String
- subject: Enum (Mathematics, Physics, Chemistry, Biology, English, History, Geography)
- fileUrl: String (Cloudinary URL)
- fileName: String
- uploadedBy: ObjectId (User reference)
- fileSize: Number
- downloads: Number
- rating: Number (0-5)
- reviews: ObjectId[] (Review references)
- tags: String[] (indexed)
- isPublished: Boolean (indexed)
- isDraft: Boolean
- createdAt & updatedAt: Timestamps
- Full-text search index on title, description, subject

### PYQ Schema
- year: Number (indexed)
- subject: String (indexed)
- fileUrl: String
- fileName: String
- examBoard: Enum (CBSE, ICSE, ISC, JEE Main, JEE Advanced, NEET)
- difficultyLevel: 'Easy' | 'Medium' | 'Hard'
- uploadedBy: ObjectId (User reference)
- downloads: Number
- isFree: Boolean
- createdAt & updatedAt: Timestamps

### Review Schema
- rating: Number (1-5)
- comment: String (max 500)
- author: ObjectId (User reference)
- noteId: ObjectId (Note reference)
- createdAt & updatedAt: Timestamps

## 🔐 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register          - Register new user
POST   /login             - Login user
POST   /refresh-token     - Refresh JWT token
POST   /logout            - Logout user
GET    /profile           - Get user profile (protected)
PUT    /profile           - Update user profile (protected)
```

### Notes Routes (`/api/notes`)
```
GET    /                  - Get all notes (paginated, searchable)
GET    /:id               - Get note details & increment downloads
POST   /                  - Upload new note (protected)
PUT    /:id               - Update note (protected, owner only)
DELETE /:id               - Delete note (protected, owner only)
POST   /:id/bookmark      - Add bookmark (protected)
DELETE /:id/bookmark      - Remove bookmark (protected)
GET    /user/bookmarks    - Get user bookmarks (protected)
```

### PYQ Routes (`/api/pyqs`)
```
GET    /                  - Get all PYQs (paginated, filterable)
GET    /:id               - Get PYQ details & increment downloads
POST   /                  - Upload PYQ (protected)
DELETE /:id               - Delete PYQ (protected, owner only)
GET    /statistics        - Get PYQ statistics
```

### Search Routes (`/api`)
```
GET    /search?q=...      - Global search (notes + PYQs)
GET    /suggestions?q=... - Search suggestions
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard         - Admin dashboard stats (protected, admin only)
GET    /users             - List all users with pagination (protected, admin only)
PUT    /users/:id/role    - Update user role (protected, admin only)
PUT    /users/:id/disable - Disable user account (protected, admin only)
POST   /notes/:id/approve - Approve note for publishing (protected, mod+)
POST   /notes/:id/reject  - Reject and delete note (protected, mod+)
GET    /moderation-queue  - Get pending notes for review (protected, mod+)
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Access & refresh tokens
- **Request Validation**: express-validator with detailed error messages
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js
- **CORS**: Configured for frontend domain
- **Data Validation**: Schema validation on both client and server
- **Authorization**: Role-based access control (RBAC)
- **Error Handling**: Centralized error middleware with safe error messages

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- MongoDB 4.4+ (local or MongoDB Atlas)
- Cloudinary account (free tier available)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file and update variables
cp .env.example .env

# Update .env with your values:
# - MONGODB_URI: your MongoDB connection string
# - JWT_SECRET: generate with: openssl rand -base64 32
# - CLOUDINARY_*: your Cloudinary credentials
# - FRONTEND_URL: http://localhost:3000

# Start development server (with auto-reload)
npm run dev

# In another terminal, see build output:
npm run build
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api' > .env.local

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build
npm start
```

## 🔑 Environment Variables

### Backend (.env)
```bash
# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/techvault
DB_NAME=techvault

# JWT
JWT_SECRET=your_random_secret_here (use: openssl rand -base64 32)
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=TechVault
```

## 🚀 Features

### User Features
✅ Email/password authentication with JWT  
✅ User profile management  
✅ Bookmark study materials  
✅ Download notes and PYQs  
✅ Global search with autocomplete  
✅ Rate and review notes  
✅ Filter by subject, year, and exam board  
✅ Download tracking  

### Admin Features
✅ Admin dashboard with statistics  
✅ User management (create, update, disable)  
✅ Role management (user, moderator, admin)  
✅ Content moderation queue  
✅ Approve/reject submissions  
✅ User activity monitoring  
✅ Download statistics  

### Performance
✅ Compressed responses (gzip)  
✅ Database indexing  
✅ Full-text search  
✅ Pagination support  
✅ Client-side caching  
✅ Efficient state management  

## 📊 Database Indexing

```javascript
// Notes collection
- title: text
- description: text
- subject: 1
- isPublished: 1
- createdAt: -1
- tags: 1

// PYQ collection
- year: 1
- subject: 1
- examBoard: 1

// User collection
- email: 1 (unique)
```

## 🔄 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🧪 Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get notes
curl http://localhost:5000/api/notes

# Get protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile
```

### Using Postman
1. Import the collection from `/docs/techvault.postman_collection.json`
2. Set base URL to `http://localhost:5000/api`
3. Use token from login response in Authorization header

## 📁 File Upload

Files are uploaded to Cloudinary (cloud storage). Configure in `.env`:
- Max file size: 10MB
- Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Future Enhancements

- [ ] Email verification
- [ ] Password reset via email
- [ ] Social authentication (Google, GitHub)
- [ ] PDF preview with PDF.js
- [ ] Study groups & collaboration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Redis caching
- [ ] WebSocket for real-time updates
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

## 📞 Support & Contact

For issues and support:
- Open an issue on GitHub
- Email: support@techvault.com
- Documentation: /docs folder

---

**Built with ❤️ for students worldwide | TechVault v1.0.0**
