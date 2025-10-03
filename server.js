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
const { router: authRoutes } = require('./routes/auth');
const { 
  securityHeaders, 
  preventSQLInjection, 
  preventXSS,
  adminLimiter 
} = require('./middleware/security');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.VITE_PRODUCTION_URL]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware (applied after body parsing)
app.use(securityHeaders);
app.use(preventSQLInjection);
app.use(preventXSS);

console.log(process.env.VITE_PRODUCTION_URL);
console.log(process.env.MONGODB_URI);
// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.VITE_PRODUCTION_URL] // Replace with your production domain
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes with rate limiting for sensitive endpoints
app.use('/api/projects', projectRoutes);
app.use('/api/students', adminLimiter, studentRoutes); // Admin-only routes
app.use('/api/courses', adminLimiter, courseRoutes); // Admin-only routes
app.use('/api/payments', adminLimiter, paymentRoutes); // Admin-only routes
app.use('/api/faculty', adminLimiter, facultyRoutes); // Admin-only routes
app.use('/api/progress', adminLimiter, progressRoutes); // Progress tracking routes
app.use('/api/analytics', adminLimiter, analyticsRoutes); // Analytics routes
app.use('/api/auth', authRoutes); // Auth routes have their own rate limiting

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
