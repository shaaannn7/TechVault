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

// Load Env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Connect DB
connectDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Save mock database changes on HTTP request completion
app.use((req, res, next) => {
  res.on('finish', () => {
    if ((global as any).isMockDatabase && typeof (global as any).saveMockDb === 'function') {
      (global as any).saveMockDb();
    }
  });
  next();
});

// Security & Utility Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, dynamically allow any origin to support local network sharing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (origin === frontendUrl) {
      return callback(null, true);
    }
    
    callback(null, false);
  },
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TechVault API Server is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: global.isMockDatabase ? 'Mock-Memory' : 'MongoDB'
  });
});

// Routing
app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', searchRoutes); // Mounts /api/search and /api/suggestions

// Central Error Handler
app.use(errorHandler);

// Listen
app.listen(PORT, () => {
  console.log(`🚀 TechVault Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS configured for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
