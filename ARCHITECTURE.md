# TechVault Architecture & Implementation Details

## System Architecture

### Frontend Architecture
```
Next.js 15 (App Router)
├── Pages (Server + Client Components)
├── Components (Reusable UI)
├── Lib (Utils, API, Store)
├── Public (Static Assets)
└── Styles (Tailwind CSS)
```

### Backend Architecture
```
Express.js Server
├── Routes (Endpoint definitions)
├── Controllers (Business logic)
├── Models (MongoDB schemas)
├── Middlewares (Auth, validation)
├── Validators (Request validation)
├── Config (Database, external services)
└── Utils (Helper functions)
```

## Technology Stack Details

### Frontend
- **Next.js 15**: Server-side rendering, static generation, API routes
- **React 19**: Component framework with concurrent rendering
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API communication
- **PDF.js**: PDF viewing and rendering
- **Lucide React**: Icon library
- **CVA**: Component variant management

### Backend
- **Express 5.2**: Web server framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB 9.6**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Stateless authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Express Rate Limit**: Request throttling
- **Express Validator**: Input validation
- **Multer**: File upload handling
- **Cloudinary**: Image/file storage (optional)

## Authentication Flow

### User Registration
1. User submits name, email, password
2. Backend validates input (express-validator)
3. Check if email exists
4. Hash password with bcrypt (10 rounds)
5. Create user document in MongoDB
6. Generate JWT token and refresh token
7. Return tokens and user info
8. Frontend stores tokens in localStorage

### User Login
1. User submits email, password
2. Backend validates input
3. Find user by email
4. Compare password with stored hash
5. If valid, generate new tokens
6. Return tokens
7. Frontend stores and uses for API calls

### Token Verification
1. Frontend includes token in Authorization header
2. Backend middleware extracts token
3. Verifies signature and expiration
4. Extracts user ID from payload
5. Attaches to request object
6. Continues to next middleware/controller

### Token Refresh
1. Access token expires (7 days)
2. Frontend sends refresh token
3. Backend verifies refresh token
4. Generates new access token
5. Returns new token
6. Frontend updates localStorage

## Request Validation Pipeline

```
HTTP Request
    ↓
CORS Check (helmet middleware)
    ↓
Rate Limiting (express-rate-limit)
    ↓
Body Parsing (express.json)
    ↓
Route Matching
    ↓
Authentication (if required)
    ↓
Authorization (if required)
    ↓
Input Validation (express-validator)
    ↓
Request Handler (Controller)
    ↓
Database Query
    ↓
Response
    ↓
Error Handling (if any)
```

## Data Flow Examples

### Creating a Note

Frontend:
```
1. User fills form
2. Selects PDF file
3. Submits to /api/notes
```

Backend:
```
1. Authenticate user (check JWT)
2. Validate request body (title, description, subject)
3. Upload file to Cloudinary
4. Create Note document in MongoDB
5. Link to user (uploadedBy)
6. Mark as draft initially
7. Return created note
```

Frontend:
```
1. Show success message
2. Redirect to notes library
```

### Searching Notes

Frontend:
```
1. User enters search query
2. Select subject filter
3. Click search button
```

Backend:
```
1. Receive search query and filters
2. Build MongoDB query
3. Execute text search on title/description
4. Filter by subject if specified
5. Apply pagination
6. Return results with metadata
```

Frontend:
```
1. Display search results
2. Show pagination controls
```

## Database Query Patterns

### Text Search (Notes)
```typescript
// Search with filtering
const notes = await Note.find({
  $text: { $search: query },
  subject: selectedSubject,
  isPublished: true,
  isDraft: false
})
  .populate('uploadedBy', 'name avatar')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
```

### Aggregation (Analytics)
```typescript
// Count downloads by subject
const stats = await Note.aggregate([
  { $group: { _id: '$subject', downloads: { $sum: '$downloads' } } },
  { $sort: { downloads: -1 } }
]);
```

### Indexing Strategy
```typescript
// Create indexes for fast queries
noteSchema.index({ title: 'text', description: 'text' });
noteSchema.index({ subject: 1, createdAt: -1 });
noteSchema.index({ uploadedBy: 1 });
userSchema.index({ email: 1 });
```

## Error Handling

### Global Error Handler
```typescript
app.use((err, req, res, next) => {
  console.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }
  
  if (err.name === 'MongoError') {
    return res.status(500).json({ message: 'Database error' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});
```

### Frontend Error Handling
```typescript
try {
  const response = await api.getNotes();
  setNotes(response.data);
} catch (err: any) {
  if (err.response?.status === 401) {
    // Redirect to login
  } else if (err.response?.status === 404) {
    // Show not found message
  } else {
    // Show generic error
  }
}
```

## Performance Optimizations

### Backend
1. **Database Indexing**: Critical fields indexed for fast queries
2. **Pagination**: Load only 10-20 items per page
3. **Caching**: Use Redis for frequently accessed data (future)
4. **Query Optimization**: Use lean() for read-only queries
5. **Compression**: gzip compression for responses
6. **Connection Pooling**: MongoDB connection pooling

### Frontend
1. **Code Splitting**: Route-based code splitting
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Components load on demand
4. **Caching**: Browser cache for static assets
5. **Memoization**: React.memo for expensive components
6. **CSS-in-JS**: Tailwind for minimal CSS

## Security Measures

### Backend
1. **JWT Authentication**: Stateless auth with tokens
2. **Password Hashing**: bcrypt with 10 rounds
3. **Input Validation**: express-validator for all inputs
4. **Rate Limiting**: 100 requests per 15 minutes
5. **CORS**: Only allow frontend origin
6. **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
7. **SQL/NoSQL Injection**: Mongoose schema validation
8. **XSS Protection**: Input sanitization
9. **CSRF**: Token-based for state-changing operations

### Frontend
1. **Environment Variables**: API URLs not hardcoded
2. **Secure Storage**: Tokens in localStorage (consider httpOnly for production)
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Client-side validation before sending
5. **Error Handling**: Don't expose sensitive info in errors
6. **Auth Guards**: Protect routes requiring authentication

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
