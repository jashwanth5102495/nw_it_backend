const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Middleware to verify JWT token and extract student ID
const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("Token: ", token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Print complete decoded token contents
      console.log('=== DECODED TOKEN CONTENTS ===');
      console.log('Full decoded object:', JSON.stringify(decoded, null, 2));
      console.log('Token type:', decoded.type);
      console.log('Student ID from token:', decoded.studentId);
      console.log('User ID from token:', decoded.userId);
      console.log('Token issued at:', decoded.iat ? new Date(decoded.iat * 1000) : 'Not provided');
      console.log('Token expires at:', decoded.exp ? new Date(decoded.exp * 1000) : 'Not provided');
      console.log('================================');

      // Check if token is for a student
      if (decoded.type !== 'student') {
        console.log('❌ Token type mismatch. Expected: student, Got:', decoded.type);
        return res.status(401).json({
          success: false,
          message: 'Invalid token type.'
        });
      }

      // Use studentId from decoded token (which is actually the user_id)
      const userIdFromToken = decoded.studentId;
      console.log('Using user ID from token for student lookup:', userIdFromToken);

      // Verify student exists using user_id reference
      const student = await Student.findOne({ user_id: userIdFromToken });
      console.log('Student lookup result:', student ? {
        studentId: student._id,
        userId: student.user_id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email
      } : 'Not found');

      if (!student) {
        console.log('❌ Student not found with user_id:', userIdFromToken);
        return res.status(401).json({
          success: false,
          message: 'Student not found.'
        });
      }

      console.log('✅ Authentication successful for student:', student.firstName, student.lastName);

      // Add student info to request object
      req.student = {
        id: student._id, // Use actual student document ID
        userId: userIdFromToken, // Keep user ID for reference
        studentData: student
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to ensure user can only access their own data
const authorizeOwnProfile = (req, res, next) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedStudentId = req.student.id;

    console.log('=== AUTHORIZATION CHECK ===');
    console.log('Requested user/student ID from URL params:', requestedUserId);
    console.log('Authenticated student ID from token:', authenticatedStudentId);
    console.log('Student data from authentication:', {
      studentId: req.student.id,
      userId: req.student.userId,
      name: req.student.studentData ? `${req.student.studentData.firstName} ${req.student.studentData.lastName}` : 'Unknown'
    });
    console.log('IDs match?', requestedUserId === authenticatedStudentId.toString());
    console.log('============================');

    if (requestedUserId !== authenticatedStudentId.toString()) {
      console.log('❌ Authorization failed: ID mismatch');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own profile.'
      });
    }

    console.log('✅ Authorization successful');
    next();
  } catch (error) {
    console.error('Authorization middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authorization.'
    });
  }
};

module.exports = {
  authenticateStudent,
  authorizeOwnProfile
};