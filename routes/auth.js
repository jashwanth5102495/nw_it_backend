const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  loginLimiter, 
  validateAdminLogin, 
  handleValidationErrors 
} = require('../middleware/security');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'jasnav-it-solutions-secret-key-2024';

// Hardcoded admin credentials for maximum security
const ADMIN_CREDENTIALS = {
  userId: '8328246413',
  password: '9441206407'
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/login - Admin login with comprehensive security
router.post('/login', 
  loginLimiter, // Rate limiting
  validateAdminLogin, // Input validation
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Log login attempt for security monitoring
      console.log(`Login attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Username: ${username}, Timestamp: ${new Date().toISOString()}`);

      // Validate against hardcoded credentials
      if (username !== ADMIN_CREDENTIALS.userId || password !== ADMIN_CREDENTIALS.password) {
        // Log failed attempt
        console.warn(`Failed login attempt from IP: ${req.ip}, Username: ${username}, Timestamp: ${new Date().toISOString()}`);
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate secure JWT token
      const token = jwt.sign(
        { 
          userId: ADMIN_CREDENTIALS.userId,
          username: ADMIN_CREDENTIALS.userId,
          role: 'admin',
          loginTime: new Date().toISOString(),
          ip: req.ip
        },
        JWT_SECRET,
        { 
          expiresIn: '2h', // Shorter session for security
          issuer: 'jasnav-it-solutions',
          audience: 'admin-panel'
        }
      );

      // Log successful login
      console.log(`Successful admin login from IP: ${req.ip}, Timestamp: ${new Date().toISOString()}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: ADMIN_CREDENTIALS.userId,
            username: ADMIN_CREDENTIALS.userId,
            role: 'admin',
            loginTime: new Date().toISOString()
          }
        },
        expiresIn: '2h'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// POST /api/auth/change-password - Change admin password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by the pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/verify - Verify token validity
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // This endpoint exists for consistency and potential future server-side token blacklisting
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = { router, authenticateToken };