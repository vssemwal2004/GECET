import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for CSRF
app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Global rate limiter - prevents API abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for OTP endpoints - prevents OTP spam
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 OTP requests per 15 minutes (enough for testing + retries)
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiting to all API routes
app.use('/api/', globalLimiter);

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const mongoURI = process.env.MONGODB_URI;


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Connection URI used:', mongoURI);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to GECET Backend API',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin',
      student: '/api/student'
    }
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ 
    success: true,
    csrfToken: req.csrfToken() 
  });
});

// Apply strict OTP rate limiting to student OTP routes
app.use('/api/student/send-otp', otpLimiter);
app.use('/api/student/verify-otp', otpLimiter);

// Apply CSRF protection to state-changing routes
app.use('/api/admin', csrfProtection, adminRoutes);
app.use('/api/student', csrfProtection, studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
