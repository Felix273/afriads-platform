// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const paymentRoutes = require('./routes/paymentRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adPlacementRoutes = require('./routes/adPlacementRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Import database and redis
const { pool } = require('./config/database');
const { redisClient } = require('./config/redis');

// Middleware

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"]
    }
  }
}));


// Configure CORS to allow specific origins and support credentials
const defaultAllowedOrigins = [
  'http://127.0.0.1:3010',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3010'
];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('src/uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX || '1000', 10)
});
app.use('/api/', limiter);

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/placements', adPlacementRoutes);
app.use('/api/admin', adminRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);

const adServeRoutes = require('./routes/adServeRoutes');
app.use('/api/ad-serve', adServeRoutes);

const publisherRoutes = require('./routes/publisherRoutes');
app.use('/api/publisher', publisherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AfriAds API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Database connected', 
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
