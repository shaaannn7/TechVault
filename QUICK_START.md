# 🚀 TechVault - Quick Start Guide

## ⚡ 30-Second Setup

```bash
# 1. Navigate to project
cd TechVault

# 2. Run setup (handles everything)
bash setup.sh          # Linux/Mac
# OR
setup.bat              # Windows

# 3. Configure environment
# Edit backend/.env with your MongoDB URI
# Edit frontend/.env.local if needed

# 4. Start servers (in 2 separate terminals)

# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 5. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 📋 Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] MongoDB running locally OR MongoDB Atlas URI
- [ ] Code editor (VS Code recommended)
- [ ] Git installed

## 🎯 First Steps

### 1. **Test Backend**
```bash
curl http://localhost:5000/api/health
# Expected: { "message": "Server is running", "timestamp": "..." }
```

### 2. **Access Frontend**
Open http://localhost:3000 in your browser

### 3. **Create Test Account**
- Go to Sign Up page
- Create an account
- Login and explore

### 4. **Test Upload** (if implemented)
- Go to Dashboard
- Upload a test note
- Verify in Notes library

## 🔑 Key Environment Variables

### Backend (.env)
```env
# Critical - Must configure
MONGODB_URI=mongodb://localhost:27017/techvault
JWT_SECRET=your-secret-key-min-20-chars-long
REFRESH_TOKEN_SECRET=another-secret-key-long

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional but recommended
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=TechVault
```

## 🛣️ Navigation Guide

### Frontend URLs
```
/ ........................ Landing Page
/notes ................... Notes Library
/notes/:id ............... Note Detail/PDF Viewer
/pyq ..................... PYQ Page
/pyq/:id ................. PYQ Detail/Viewer
/dashboard ............... User Dashboard
/admin ................... Admin Dashboard
/auth/login .............. Login Page
/auth/signup ............. Signup Page
```

### Backend API Routes
```
/api/auth/* .............. Authentication
/api/notes/* ............. Notes Management
/api/pyqs/* .............. PYQ Management
/api/search/* ............ Search Functionality
/api/admin/* ............. Admin Features
/api/health .............. Server Status
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Failed to connect to MongoDB

Solution:
1. Ensure MongoDB is running: mongod
2. Check MONGODB_URI in .env
3. If using Atlas, ensure IP is whitelisted
4. Verify connection string format
```

### CORS Error on Frontend
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
1. Check FRONTEND_URL in backend .env
2. Verify NEXT_PUBLIC_API_URL in frontend .env.local
3. Restart both servers
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
# Kill process on port 5000
# Linux/Mac: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Windows: netstat -ano | findstr :5000

# Or change PORT in backend/.env
```

### Module Not Found
```
Error: Cannot find module 'package-name'

Solution:
cd backend && npm install
cd ../frontend && npm install
```

## 📚 Learning Path

1. **Understand the Stack** - Read ARCHITECTURE.md
2. **Setup Development** - Follow COMPLETE_SETUP_GUIDE.md
3. **Explore Frontend** - Check out /frontend/app directory
4. **Explore Backend** - Check out /backend/src directory
5. **Read API Docs** - See COMPLETE_SETUP_GUIDE.md API section
6. **Make Changes** - Start building features!

## 💡 Development Tips

### Debugging Backend
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Use Postman/Insomnia for API testing
# Import endpoints from COMPLETE_SETUP_GUIDE.md
```

### Debugging Frontend
```bash
# Open DevTools: F12
# Check Network tab for API calls
# Check Console tab for errors
# Use React DevTools extension
```

### Database Management
```bash
# Use MongoDB Compass for visual exploration
# Or use mongosh CLI
mongosh

# Show databases
show dbs

# Use techvault database
use techvault

# See collections
show collections

# Query documents
db.users.find()
```

## 🎨 Customization

### Change App Colors
Edit `/frontend/app/globals.css` and Tailwind theme

### Change App Name
1. Update text in `/frontend/app/page.tsx`
2. Update NEXT_PUBLIC_APP_NAME in .env.local
3. Update brand colors in components

### Add New Pages
1. Create folder in `/frontend/app/`
2. Add `page.tsx` with your component
3. Next.js automatically creates route

### Add New API Endpoints
1. Create controller in `/backend/src/controllers/`
2. Create route in `/backend/src/routes/`
3. Add to `server.ts`
4. Add validation in `/backend/src/validators/`

## 📖 Documentation Index

- **README.md** - Project overview
- **QUICK_START.md** - This file
- **COMPLETE_SETUP_GUIDE.md** - Detailed setup and API docs
- **ARCHITECTURE.md** - System design and patterns
- **PROJECT_STATUS.md** - What's completed

## 🚀 Next Powerful Features to Add

1. **Email Verification** - Add nodemailer
2. **Payment System** - Integrate Stripe
3. **Real-time Features** - Add Socket.io
4. **Analytics** - Add Google Analytics
5. **Recommendations** - Add ML suggestions
6. **Mobile App** - Build with React Native
7. **Desktop App** - Build with Electron
8. **API Documentation** - Add Swagger/OpenAPI

## 🎯 Success Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] Backend server running on 5000
- [ ] Frontend running on 3000
- [ ] Can login/signup
- [ ] Can view notes and PYQs
- [ ] Dashboard loads successfully

**Once all checked, you're ready to go!** ✅

## 🔗 Useful Links

- **MongoDB Compass**: Download for database GUI
- **Postman**: Test API endpoints
- **VS Code**: Recommended editor
- **Node.js**: [nodejs.org](https://nodejs.org)

## 📞 Get Help

1. Check troubleshooting section above
2. Review COMPLETE_SETUP_GUIDE.md
3. Check console logs (Ctrl+Shift+J in browser)
4. Check server logs (npm run dev output)
5. Ask in GitHub Issues

## 🎉 You're All Set!

Start exploring the codebase and building amazing features on top of this solid foundation.

**Happy coding!** 🚀
