# 🚀 TechVault Quick Reference Card

## ⚡ Quick Start (Copy-Paste Ready)

### Terminal 1 - Backend
```powershell
cd C:\Users\shaan\Downloads\TechVault\backend
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd C:\Users\shaan\Downloads\TechVault\frontend
npm run dev
```

### Browser
```
http://localhost:3000
```

---

## 📍 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:5000/api | REST API |
| **Health Check** | http://localhost:5000/api/health | Server status |

---

## 🔐 Test Account

Create one through the signup page:
- Email: `test@example.com`
- Password: `Password123`

---

## 🎯 Quick Actions

### Upload a Note
1. Login at http://localhost:3000/auth/login
2. Click "Upload Note"
3. Fill form and select PDF
4. Click Submit

### View Admin Panel
1. Login with admin account
2. Navigate to `/admin`
3. Review pending submissions
4. Approve or reject

### Test API
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"Password123"}'

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password123"}'

# Get notes
curl http://localhost:5000/api/notes
```

---

## 🐛 Debugging

| Issue | Solution |
|-------|----------|
| **Port in use** | Kill process: `netstat -ano | findstr :5000` |
| **Module not found** | `npm install` in that directory |
| **TypeScript error** | Stop server, restart (nodemon will reload) |
| **CORS error** | Check `FRONTEND_URL` in backend .env |
| **MongoDB error** | Ensure MONGODB_URI is correct in .env |

---

## 📁 Important Files

```
Backend:
- backend/.env              (Configuration)
- backend/src/server.ts     (Express setup)
- backend/src/routes/*.ts   (API endpoints)

Frontend:
- frontend/.env.local       (Configuration)
- frontend/app/page.tsx     (Home page)
- frontend/app/app/layout.tsx (Root layout)
```

---

## 🔧 Server Status

Check terminal output:

```
Backend:
✅ 🚀 Server is running on http://localhost:5000
✅ MongoDB connected successfully

Frontend:
✅ ▲ Next.js 16.2.6 (Turbopack)
✅ ✓ Ready in 1800ms
✅ - Local: http://localhost:3000
```

---

## 📱 Frontend Routes

```
/                       Home page
/auth/login             Login page
/auth/signup            Signup page
/dashboard              User dashboard
/notes                  Notes library
/notes/[id]            Note detail (PDF viewer)
/pyqs                  PYQ section
/admin                 Admin panel
```

---

## 🔗 API Structure

```
/api/auth
  POST   /register        Register user
  POST   /login           Login user
  GET    /profile         Get profile (protected)

/api/notes
  GET    /                Get all notes
  GET    /:id             Get note
  POST   /                Upload (protected)
  DELETE /:id             Delete (protected)

/api/admin
  GET    /dashboard       Stats (admin only)
  GET    /pending-notes   Pending (admin only)
  POST   /notes/:id/approve   Approve
  POST   /notes/:id/reject    Reject
```

---

## ✅ Working Features

- [x] User authentication (JWT)
- [x] Note upload (PDF storage)
- [x] Database operations
- [x] Admin moderation
- [x] CORS handling
- [x] Error handling
- [x] Rate limiting

## ⚠️ In Progress

- [ ] PDF viewer component
- [ ] File downloads
- [ ] Bookmarks
- [ ] Reviews/ratings

---

## 📚 Documentation

- **DEBUGGING_GUIDE.md** - Troubleshooting
- **PDF_VIEWER_SETUP.md** - PDF implementation
- **SETUP_STATUS_REPORT.md** - Full status
- **ARCHITECTURE.md** - System design
- **README.md** - Overview

---

## 🆘 Emergency Commands

```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
npm run dev

# Clear cache
rm -r node_modules package-lock.json
npm install
```

---

## 🎯 Development Workflow

1. **Make changes** to files
2. **Nodemon watches** (backend auto-reload)
3. **Turbopack watches** (frontend auto-reload)
4. **Refresh browser** (Ctrl+R) or **check console**
5. **Use DevTools** (F12) for debugging

---

## 📊 Stack Summary

```
Frontend:  Next.js 16 + React 19 + Tailwind
Backend:   Express + Node.js + TypeScript
Database:  MongoDB (local)
Auth:      JWT + bcrypt
Server:    http://localhost:5000
Frontend:  http://localhost:3000
```

---

## 🎉 Ready to Go!

Your TechVault application is **fully running locally**.

**Start here**: http://localhost:3000

Questions? Check the documentation files in the root directory.

---

Last Updated: 2026-05-22 11:37:02 ✅

