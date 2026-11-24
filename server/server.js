import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory first, fallback to CWD
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { validateEnv } from './config/validateEnv.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeInput, apiLimiter } from './middleware/security.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Validate environment on startup
validateEnv();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with production enforcement
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.includes(origin);
      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not permitted by CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-guest-token', 'x-razorpay-signature'],
  })
);

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers with request size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// NoSQL query operator sanitization
app.use(sanitizeInput);

// Global API rate limiting
app.use('/api', apiLimiter);

// Static file serving for uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    business: 'RAZA SHOE PALACE',
    tagline: 'Step Into Style.',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting_or_offline',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `API route '${req.originalUrl}' not found.` });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Raza Shoe Palace] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown handling for container redeployment (Render, Docker)
const handleGracefulShutdown = async (signal) => {
  console.log(`[Server] Received ${signal}. Gracefully shutting down HTTP server and MongoDB connection...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('[Server] MongoDB connection closed safely. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default app;
