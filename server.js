const express = require('express');
const cors = require('cors');
require('dotenv').config();
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
const llmRoutes = require('./routes/llm');
const User = require('./models/User');
const { 
  securityHeaders, 
  preventSQLInjection, 
  preventXSS,
  adminLimiter 
} = require('./middleware/security');
const { authenticateAdmin } = require('./middleware/adminAuth');
// Add auto-seed utility
const { seedIfEmpty } = require('./utils/autoSeedAssignments');

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
  'http://localhost:5175', // added to support current dev server
  'http://localhost:5176', // support alternate Vite dev port
  'http://localhost:5177', // Vite dev server port in use
].filter(Boolean); // Remove undefined/null values

console.log('🔒 CORS Configuration:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    
    // Allow non-browser/CLI requests (no origin)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (isDev) {
      console.log('  ✓ Dev mode: Allowing origin:', origin);
      return callback(null, true);
    }
    
    // In production, check whitelist
    const isWhitelisted = allowedOrigins.includes(origin)
      || /\.vercel\.app$/.test(origin)
      || /\.railway\.app$/.test(origin)
      || /\.github\.io$/.test(origin);
    
    if (isWhitelisted) {
      console.log('  ✓ Allowed origin:', origin);
      return callback(null, true);
    }
    
    console.error('  ✗ Blocked origin:', origin);
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
// Skip SQL injection and XSS checks for LLM routes (they handle code/script content by design)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/llm')) {
    return next();
  }
  preventSQLInjection(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api/llm')) {
    return next();
  }
  preventXSS(req, res, next);
});

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
app.use('/api/llm', llmRoutes); // Public chat API leveraging local LLM

// Serve static uploaded certificates
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve frontend certificates directory under a public path to avoid mixed-content/host issues
app.use('/video-explanations', express.static(path.join(__dirname, '..', 'nw_it_frontend', 'video-explanations')));

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
    const allUsers = await User.find({});
    // console.log(allUsers);
    // Auto-seed assignments only if collection is empty
    await seedIfEmpty();
    console.log(`✅ Database connected to MongoDB successfully`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error('⚠️ Continuing to run without DB (limited functionality: auth, static routes).');
    // Do not exit; keep server running for auth-only functionality in dev
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
