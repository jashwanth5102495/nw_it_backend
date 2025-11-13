const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Middleware to verify JWT token and extract student ID
const authenticateStudent = async (req, res, next) => {
  const authId = `AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('\n========================================');
  console.log(`[${authId}] AUTHENTICATION MIDDLEWARE`);
  console.log('========================================');
  console.log(`[${authId}] Path: ${req.method} ${req.path}`);
  console.log(`[${authId}] IP: ${req.ip}`);
  
  try {
    const authHeader = req.headers.authorization;
    
    console.log(`[${authId}] Step 1: Check Authorization header`);
    console.log(`[${authId}]   - Header present: ${authHeader ? 'YES' : 'NO'}`);
    console.log(`[${authId}]   - Header value: ${authHeader ? authHeader.substring(0, 30) + '...' : 'N/A'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[${authId}] ❌ FAILED: Missing or invalid Authorization header`);
      console.log('========================================\n');
      
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(`[${authId}] ✓ Token extracted`);
    console.log(`[${authId}]   - Token length: ${token.length}`);
    console.log(`[${authId}]   - Token preview: ${token.substring(0, 30)}...`);

    try {
      console.log(`[${authId}] Step 2: Verify JWT token`);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      console.log(`[${authId}] ✓ Token verified successfully`);
      console.log(`[${authId}]   - Token type: ${decoded.type}`);
      console.log(`[${authId}]   - Student ID: ${decoded.studentId}`);
      console.log(`[${authId}]   - User ID: ${decoded.userId}`);
      console.log(`[${authId}]   - Issued at: ${decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A'}`);
      console.log(`[${authId}]   - Expires at: ${decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'}`);

      // Check if token is for a student
      console.log(`[${authId}] Step 3: Validate token type`);
      if (decoded.type !== 'student') {
        console.log(`[${authId}] ❌ FAILED: Invalid token type`);
        console.log(`[${authId}]   - Expected: student`);
        console.log(`[${authId}]   - Got: ${decoded.type}`);
        console.log('========================================\n');
        
        return res.status(401).json({
          success: false,
          message: 'Invalid token type.'
        });
      }
      console.log(`[${authId}] ✓ Token type valid: student`);

      // Prefer explicit userId in token; fallback to studentId for backward compatibility
      const userIdFromToken = decoded.userId || decoded.studentId;
      console.log(`[${authId}] Step 4: Lookup student in database`);
      console.log(`[${authId}]   - Searching with user_id: ${userIdFromToken}`);

      // Verify student exists using user_id reference
      const student = await Student.findOne({ user_id: userIdFromToken });
      
      if (!student) {
        console.log(`[${authId}] ❌ FAILED: Student not found`);
        console.log(`[${authId}]   - user_id searched: ${userIdFromToken}`);
        console.log('========================================\n');
        
        return res.status(401).json({
          success: false,
          message: 'Student not found.'
        });
      }

      console.log(`[${authId}] ✓ Student found in database`);
      console.log(`[${authId}]   - Student ID: ${student._id}`);
      console.log(`[${authId}]   - Name: ${student.firstName} ${student.lastName}`);
      console.log(`[${authId}]   - Email: ${student.email}`);
      console.log(`[${authId}]   - Student Number: ${student.studentId}`);

      // Add student info to request object
      req.student = {
        id: student._id, // Use actual student document ID
        userId: userIdFromToken, // Keep user ID for reference
        studentData: student
      };

      console.log(`[${authId}] ✅ AUTHENTICATION SUCCESSFUL`);
      console.log('========================================\n');

      next();
    } catch (jwtError) {
      console.log(`[${authId}] ❌ FAILED: JWT verification error`);
      console.error(`[${authId}] Error: ${jwtError.message}`);
      console.log('========================================\n');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    console.log(`[${authId}] ❌ EXCEPTION ERROR`);
    console.error(`[${authId}] Error:`, error);
    console.log('========================================\n');
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to ensure user can only access their own data
const authorizeOwnProfile = (req, res, next) => {
  const authzId = `AUTHZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('\n========================================');
  console.log(`[${authzId}] AUTHORIZATION MIDDLEWARE`);
  console.log('========================================');
  console.log(`[${authzId}] Path: ${req.method} ${req.path}`);
  
  try {
    const requestedUserId = req.params.id;
    const authenticatedStudentId = req.student.id;

    console.log(`[${authzId}] Checking access permissions`);
    console.log(`[${authzId}]   - Requested ID (from URL): ${requestedUserId}`);
    console.log(`[${authzId}]   - Authenticated student ID: ${authenticatedStudentId}`);
    console.log(`[${authzId}]   - Student name: ${req.student.studentData ? `${req.student.studentData.firstName} ${req.student.studentData.lastName}` : 'Unknown'}`);
    console.log(`[${authzId}]   - IDs match: ${requestedUserId === authenticatedStudentId.toString() ? 'YES ✓' : 'NO ✗'}`);

    if (requestedUserId !== authenticatedStudentId.toString()) {
      console.log(`[${authzId}] ❌ AUTHORIZATION FAILED: ID mismatch`);
      console.log(`[${authzId}]   - User trying to access someone else's profile`);
      console.log('========================================\n');
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own profile.'
      });
    }

    console.log(`[${authzId}] ✅ AUTHORIZATION SUCCESSFUL`);
    console.log('========================================\n');
    
    next();
  } catch (error) {
    console.log(`[${authzId}] ❌ EXCEPTION ERROR`);
    console.error(`[${authzId}] Error:`, error);
    console.log('========================================\n');
    
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