import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
// Route Imports
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
/**
 * server.ts
 * Main entry point for the TechVault Express API.
 * Handles environment configuration, middleware stacking, route registration,
 * and database initialization.
 */
// Load Environment Variables
dotenv.config();
// ES Module resolution for local paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure local 'uploads' directory exists for storing PDF study materials
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Connect to MongoDB or fall back to Memory Mock Mode
connectDatabase();
// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Save mock database changes on HTTP request completion
app.use((req, res, next) => {
    res.on('finish', () => {
        if (global.isMockDatabase && typeof global.saveMockDb === 'function') {
            global.saveMockDb();
        }
    });
    next();
});

/**
 * --- Global Middlewares ---
 */
// Helmet: Adds security-related HTTP headers to prevent common attacks
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    hsts: {
        maxAge: 0,
        includeSubDomains: false
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS: Configures Cross-Origin Resource Sharing for the frontend application
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // In development, dynamically allow any origin to support local network sharing
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        if (origin === frontendUrl) {
            return callback(null, true);
        }
        
        callback(null, false);
    },
    credentials: true
}));
// Compression: Gzip-compresses responses to save bandwidth and improve performance
app.use(compression());
// Body Parsers: Handles JSON and URL-encoded request bodies with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Rate Limiting: Throttles requests per IP address to mitigate brute-force and DDoS attempts
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // Default 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Default 100 requests
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);
/**
 * --- API Routes & Static Serving ---
 */
// Health Check: Standard endpoint for infrastructure status monitoring
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'TechVault API Server is running.',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: global.isMockDatabase ? 'Mock-Memory' : 'MongoDB'
    });
});
// Serve static study documents (PDFs) from the uploads folder
app.use('/uploads', express.static(uploadDir));
// Domain-specific API Routing
app.use('/api/auth', authRoutes); // Authentication & User Profiles
app.use('/api/notes', noteRoutes); // Study Notes CRUD
app.use('/api/pyqs', pyqRoutes); // Previous Year Questions
app.use('/api/admin', adminRoutes); // Moderation & Platform Management
app.use('/api/upload', uploadRoutes); // Multipart file upload handling
app.use('/api/ai', aiRoutes); // AI Study Assistant (Heuristics)
app.use('/api', searchRoutes); // Spotlight Search & Suggestions
/**
 * --- Error Management ---
 */
// Global Error Handler: Catches and formats all unhandled errors in the request-response cycle
app.use(errorHandler);
// Start the HTTP Server
app.listen(PORT, () => {
    console.log(`🚀 TechVault Server running on http://localhost:${PORT}`);
    console.log(`📡 CORS configured for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
