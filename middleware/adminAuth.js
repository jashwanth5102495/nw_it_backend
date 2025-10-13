const jwt = require('jsonwebtoken');

// Middleware to authenticate admin using JWT
// Verifies token signature and ensures role === 'admin'
const JWT_SECRET = process.env.JWT_SECRET || 'jasnav-it-solutions-secret-key-2024';

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload || payload.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
      req.admin = payload;
      next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication'
    });
  }
};

module.exports = { authenticateAdmin };