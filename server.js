const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');
const { notFound, globalErrorHandler } = require('./middlewares/errorMiddleware');

// ─── Set Google & Cloudflare DNS for reliable Atlas SRV lookup ───────────────
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback to system default DNS
}

// ─── Load Environment Variables ──────────────────────────────────────────────
dotenv.config();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((u) => u.trim()) : []),
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback to prevent breaking preview deployments
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

// Raw body parser for Stripe webhook (must come before express.json)
app.use('/api/orders/stripe/webhook', express.raw({ type: 'application/json' }));

// Standard JSON & URL-encoded body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ has these on by default, but explicit for clarity
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure — don't serve requests without DB
  }
};

connectDB();

// ─── Health Checks ────────────────────────────────────────────────────────────
app.get(['/', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Mahid Aromas API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Primary /api endpoints
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/upload',   uploadRoutes);

// Direct alias routes fallback in case /api prefix is omitted by a client
app.use('/auth',         authRoutes);
app.use('/products',     productRoutes);
app.use('/orders',       orderRoutes);
app.use('/admin',        adminRoutes);
app.use('/upload',       uploadRoutes);

// ─── 404 & Error Handlers (must be after all routes) ─────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
