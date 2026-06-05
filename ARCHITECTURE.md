# TechVault Architecture & Implementation Details

## System Architecture

### Frontend Architecture
```
React (Vite)
├── App.jsx (Routing & Layout)
├── Pages (State-based Views)
├── Components (Reusable UI)
├── Context (Global State)
└── Styles (Tailwind CSS 4)
```

### Backend Architecture
```
Express.js Server
├── Routes (Endpoint definitions)
├── Controllers (Business logic)
├── Models (MongoDB schemas)
├── Middlewares (Auth, validation)
├── Validators (Request validation)
├── Config (Database & Mock DB)
└── Utils (Helper functions)
```

## Technology Stack Details

### Frontend
- **React 19**: Modern UI library with concurrent rendering
- **Vite**: Ultra-fast build tool and development server
- **Tailwind CSS 4**: Utility-first CSS framework with native support
- **Framer Motion**: Smooth animations and transitions
- **Context API**: Native React state management for global app state
- **Lucide React**: Comprehensive icon library

### Backend
- **Express 4.19**: Proven web server framework
- **TypeScript**: Type-safe JavaScript for backend development
- **MongoDB 8.3**: NoSQL database for flexible document storage
- **Mongoose**: MongoDB ODM for schema-based modeling
- **JWT**: Stateless authentication using JSON Web Tokens
- **bcryptjs**: Secure password hashing
- **Helmet**: Essential security headers
- **CORS**: Cross-origin resource sharing configuration
- **Express Rate Limit**: Basic DDoS and brute-force protection
- **Express Validator**: Robust input validation
- **Multer**: Multi-part form data handling for file uploads

## Authentication Flow

### User Registration
1. User submits name, email, password via Auth.jsx
2. Frontend calls handleRegister (AppContext.jsx)
3. Backend validates input (express-validator)
4. Check if email exists in MongoDB (or Mock DB)
5. Hash password with bcrypt (10 rounds)
6. Create user document
7. Generate JWT access and refresh tokens
8. Return tokens and user info
9. Frontend stores accessToken in localStorage ('tv_token')
10. currentUser state is updated, triggering UI changes

### User Login
1. User submits email, password
2. Backend validates input
3. Find user by email
4. Compare password with stored hash
5. If valid, generate new tokens
6. Return tokens
7. Frontend stores token and updates state

### Token Verification
1. Frontend includes token in Authorization header for protected calls
2. Backend middleware (auth.ts) extracts and verifies the token
3. Extracts user ID from payload and attaches to request object

## Data Flow Examples

### Creating a Note

Frontend:
```
1. User fills upload form in Notes.jsx
2. Frontend first calls /api/upload (Multipart/form-data)
3. Backend saves file to /uploads directory
4. Frontend then calls POST /api/notes with metadata and file URL
```

Backend:
```
1. Authenticate user
2. Validate metadata
3. Create Note document linked to user
4. Auto-publish if user is Admin/Moderator, else set isPublished: false
5. Return created note
```

## Mock Database Fallback

TechVault features a robust **Memory Mock Mode**. If the backend fails to connect to a MongoDB instance within 3 seconds, it switches to using `backend/src/config/mockDb.ts`. 

- All CRUD operations work seamlessly.
- Data is stored in memory and resets when the server restarts.
- Allows for immediate development and testing without database setup.

## Search Implementation

### Global Search
- Triggered by `Ctrl+K` (Spotlight Search Palette)
- Backend uses regex (MongoDB) or string matching (Mock DB) across Titles, Descriptions, and Tags.
- Returns combined results for both Notes and PYQs.

### Subject Filtering
- Both Frontend and Backend support filtering by subject (CSE, Math, Civil, etc.)
- Notes list updates in real-time as filters are applied.

## AI Study Assistant

- Located in the Note detail view.
- Provides Summaries, Flashcards, and Quizzes for the active document.
- Currently uses a heuristic-based engine (aiController.ts) that generates high-quality study materials based on subject keywords.
- Designed to be easily integrated with LLM APIs (Gemini/OpenAI) in the future.

## Scalability Considerations

### Current Setup
- Single MongoDB instance
- Single Express server
- Frontend on Vercel

### For Scale
1. **Database**
   - MongoDB replication set for high availability
   - Sharding for large collections
   - Redis cache layer

2. **Backend**
   - Load balancer (nginx)
   - Multiple Express instances
   - Message queue (Bull, RabbitMQ)
   - Microservices architecture

3. **Frontend**
   - CDN for static assets
   - Service workers for offline
   - PWA capabilities

4. **Monitoring**
   - Sentry for error tracking
   - DataDog/New Relic for APM
   - Log aggregation (ELK stack)

## Testing Strategy (Future)

### Unit Tests
```typescript
// Controllers
describe('noteController', () => {
  it('should upload note successfully', async () => {
    // Test logic
  });
});
```

### Integration Tests
```typescript
// API endpoints
describe('POST /api/notes', () => {
  it('should create note with valid data', async () => {
    // Test flow
  });
});
```

### E2E Tests
```typescript
// User flows
describe('Note creation flow', () => {
  it('should allow user to upload and view note', async () => {
    // Full flow test
  });
});
```

## Deployment Checklist

### Backend
- [ ] Update environment variables
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production URL
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Set up CI/CD pipeline

### Frontend
- [ ] Build optimization
- [ ] Environment variables configured
- [ ] API endpoint points to production
- [ ] Analytics integrated
- [ ] Error tracking enabled
- [ ] Performance monitoring active

## Maintenance & Monitoring

### Regular Tasks
- Monitor server logs
- Check database performance
- Update dependencies monthly
- Review user feedback
- Analyze usage patterns
- Backup data weekly

### Metrics to Track
- API response times
- Error rates
- User growth
- Content uploads
- Search effectiveness
- User engagement

## Future Enhancements

1. Real-time notifications (WebSockets)
2. User profiles with follow system
3. Content recommendations
4. Video tutorials
5. Live study groups
6. Payment integration (for premium)
7. Mobile app (React Native)
8. AI-powered search
9. Content moderation automation
10. Analytics dashboard
