const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const projectRoutes = require('./routes/projects');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const facultyRoutes = require('./routes/faculty');
const progressRoutes = require('./routes/progress');
const analyticsRoutes = require('./routes/analytics');
const assignmentRoutes = require('./routes/assignments');
const certificatesRoutes = require('./routes/certificates');
const { router: authRoutes } = require('./routes/auth');
const { 
  securityHeaders, 
  preventSQLInjection, 
  preventXSS,
  adminLimiter 
} = require('./middleware/security');
const { authenticateAdmin } = require('./middleware/adminAuth');
// Add auto-seed utility
const { seedIfEmpty } = require('./utils/autoSeedAssignments');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
// Unified and hardened CORS configuration
const allowedOrigins = [
  process.env.VITE_PRODUCTION_URL,
  process.env.VITE_PREVIEW_URL,
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : []),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    // Allow non-browser/CLI requests (no origin) and dev
    if (!origin || isDev) return callback(null, true);
    const whitelist = allowedOrigins.filter(Boolean);
    const isWhitelisted = whitelist.includes(origin)
      || /\.vercel\.app$/.test(origin)
      || /\.railway\.app$/.test(origin)
      || /\.github\.io$/.test(origin);
    if (isWhitelisted) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware (applied after body parsing)
app.use(securityHeaders);
app.use(preventSQLInjection);
app.use(preventXSS);

console.log(process.env.VITE_PRODUCTION_URL);
console.log(process.env.MONGODB_URI);
// CORS is configured above; duplicate block removed.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes with rate limiting for sensitive endpoints
app.use('/api/projects', projectRoutes);
// Public/student routes should NOT require admin token globally
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);
// Certificates routes (public verify endpoint; upload can be admin protected later)
app.use('/api/certificates', certificatesRoutes);
// Keep analytics behind admin protection
app.use('/api/analytics', adminLimiter, authenticateAdmin, analyticsRoutes);
app.use('/api/auth', authRoutes); // Auth routes have their own rate limiting

// Serve static uploaded certificates
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, async () => {
  try {
    await db.connect();
    // Auto-seed assignments only if collection is empty
    await seedIfEmpty();
    console.log(`✅ Database connected to MongoDB successfully`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await db.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

module.exports = app;
