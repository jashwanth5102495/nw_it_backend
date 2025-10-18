const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User'); // Add User model
const StudentProgress = require('../models/StudentProgress');
const { authenticateStudent, authorizeOwnProfile } = require('../middleware/auth');
const router = express.Router();

// Generate JWT token
const generateToken = (studentId) => {
  return jwt.sign(
    { studentId, type: 'student' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Student registration
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      username,
      password,
      dateOfBirth,
      education,
      experience,
      address
    } = req.body;

    console.log(`Request Received: ${JSON.stringify(req.body)}`);
    
    // Check if student already exists by email
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Generate unique student ID
    const { v4: uuidv4 } = require('uuid');
    const studentId = `STU-${uuidv4().substring(0, 8).toUpperCase()}`;

    // First, create the User record for authentication
    const user = new User({
      username,
      password,
      role: 'student'
    });

    await user.save();

    // Then, create the Student record with reference to User
    const student = new Student({
      user_id: user._id,
      studentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      address,
      // Add education and experience if needed in Student schema
      education,
      experience
    });

    await student.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: student._id,
          user_id: user._id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          username: user.username,
          enrolledCourses: student.enrolledCourses
        },
        token
      }
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering student',
      error: error.message
    });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user || user.role !== 'student') {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Find associated student record
    const student = await Student.findOne({ user_id: user._id }).populate('enrolledCourses.courseId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        student: {
          id: student._id,
          user_id: user._id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          username: user.username,
          enrolledCourses: student.enrolledCourses,
          lastLogin: new Date()
        },
        token
      }
    });
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Get student profile (requires authentication)
router.get('/profile/:id', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses.courseId')
      .populate('paymentHistory.courseId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        education: student.education,
        experience: student.experience,
        address: student.address,
        enrolledCourses: student.enrolledCourses,
        paymentHistory: student.paymentHistory,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student profile',
      error: error.message
    });
  }
});

// Update student profile
router.put('/profile/:id', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        address: student.address
      }
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message
    });
  }
});

// Update student password (current password not required; must be authenticated)
router.put('/:id/password', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const user = await User.findById(student.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated user account not found' });
    }

    // Update password; User model hashes password on save
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating student password:', error);
    res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
  }
});

// Enroll in additional course
router.post('/:id/enroll', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const { courseId, paymentDetails, referralCode } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find course by courseId field (accept various cases and ObjectId)
    const courses = await Course.find();
    let course = await Course.findOne({ courseId: courseId });
    if (!course) {
      course = await Course.findOne({ courseId: (courseId || '').toUpperCase() });
    }
    if (!course) {
      course = await Course.findOne({ courseId: (courseId || '').toLowerCase() });
    }
    if (!course && courseId && courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    }
    
    console.log('Found course:', course ? course.title : 'Not found');
    console.log('Searching for courseId:', courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with courseId: ${courseId}`
      });
    }

    // Check if already enrolled
    const existingEnrollment = student.enrolledCourses.find(
      enrollment => enrollment.courseId.toString() === course._id.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create proper payment record instead of just payment history
    const Payment = require('../models/Payment');
    let facultyId = null;
    let discountAmount = 0;
    let finalPrice = paymentDetails.amount;

    // Handle referral code if provided
    if (referralCode && referralCode.trim()) {
      const Faculty = require('../models/Faculty');
      const faculty = await Faculty.findByReferralCode(referralCode.trim());
      if (faculty) {
        facultyId = faculty._id;
        const commissionDetails = faculty.calculateCommission(paymentDetails.amount);
        discountAmount = commissionDetails.discountAmount;
        finalPrice = commissionDetails.finalPrice;
      }
    }

    // Prevent duplicate transaction IDs
    const existingPaymentByTxn = await Payment.findOne({ transactionId: paymentDetails.transactionId });
    if (existingPaymentByTxn) {
      // If payment exists and belongs to this student/course, create enrollment using it
      const sameStudent = existingPaymentByTxn.studentEmail === student.email || existingPaymentByTxn.studentId.toString() === student._id.toString();
      const sameCourse = existingPaymentByTxn.courseId.toString() === course._id.toString();
      if (sameStudent && sameCourse) {
        // Prevent duplicate enrollment
        const alreadyEnrolled = student.enrolledCourses.find(
          e => e.courseId.toString() === course._id.toString()
        );
        if (!alreadyEnrolled) {
          student.enrolledCourses.push({
            courseId: course._id,
            enrollmentDate: new Date(),
            progress: 0,
            status: 'pending_payment',
            paymentId: existingPaymentByTxn.paymentId,
            confirmationStatus: existingPaymentByTxn.confirmationStatus || 'waiting_for_confirmation'
          });
          // Add to payment history for backward compatibility
          student.paymentHistory.push({
            courseId: course._id,
            amount: existingPaymentByTxn.amount,
            paymentMethod: existingPaymentByTxn.paymentMethod || 'manual_qr',
            transactionId: existingPaymentByTxn.transactionId,
            status: existingPaymentByTxn.status || 'pending'
          });
          await student.save();
        }

        return res.json({
          success: true,
          message: 'Course added to your list! Access will be granted once payment is confirmed.',
          data: {
            courseId: course.courseId || course._id,
            courseTitle: course.title,
            paymentId: existingPaymentByTxn.paymentId,
            finalPrice: existingPaymentByTxn.amount,
            originalPrice: existingPaymentByTxn.originalAmount,
            discountApplied: !!existingPaymentByTxn.discountAmount,
            discountAmount: existingPaymentByTxn.discountAmount || 0,
            paymentStatus: existingPaymentByTxn.status || 'pending',
            confirmationStatus: existingPaymentByTxn.confirmationStatus || 'waiting_for_confirmation',
            enrollmentStatus: 'pending_payment',
            note: 'Course added to your list. Access will be activated once admin confirms your payment.'
          }
        });
      }
      // Transaction ID is in use for another student/course
      return res.status(400).json({
        success: false,
        message: 'This transaction ID is already recorded for a different student or course'
      });
    }

    // Create payment record - REQUIRES ADMIN APPROVAL
    const payment = new Payment({
      paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: student._id,
      courseId: course._id,
      courseName: course.title,
      amount: finalPrice,
      originalAmount: paymentDetails.amount,
      paymentMethod: paymentDetails.method || 'manual_qr', // Changed to manual_qr to indicate admin review needed
      status: 'pending', // Changed from 'completed' to 'pending'
      confirmationStatus: 'waiting_for_confirmation', // Changed from 'confirmed' to 'waiting_for_confirmation'
      transactionId: paymentDetails.transactionId || `TXN-${Date.now()}`,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      referralCode: referralCode?.trim()?.toUpperCase() || null,
      facultyId: facultyId,
      discountAmount: discountAmount,
      commissionAmount: discountAmount // Commission equals discount amount
    });

    await payment.save();

    // Add to student payment history for backward compatibility - but with pending status
    student.paymentHistory.push({
      courseId: course._id,
      amount: finalPrice,
      paymentMethod: paymentDetails.method || 'manual_qr',
      transactionId: payment.transactionId,
      status: 'pending' // Changed from 'completed' to 'pending'
    });

    // Create enrollment record with pending status - shows in student's course list but disabled
    student.enrolledCourses.push({
      courseId: course._id,
      enrollmentDate: new Date(),
      progress: 0,
      status: 'pending_payment', // Custom status to indicate awaiting payment confirmation
      paymentId: payment.paymentId, // Link to payment record
      confirmationStatus: 'waiting_for_confirmation'
    });

    await student.save();

    res.json({
      success: true,
      message: 'Course added to your list! Access will be granted once payment is confirmed.',
      data: {
        courseId: course.courseId || course._id,
        courseTitle: course.title,
        paymentId: payment.paymentId,
        finalPrice: finalPrice,
        originalPrice: paymentDetails.amount,
        discountApplied: discountAmount > 0,
        discountAmount: discountAmount,
        paymentStatus: 'pending',
        confirmationStatus: 'waiting_for_confirmation',
        enrollmentStatus: 'pending_payment',
        note: 'Course added to your list. Access will be activated once admin confirms your payment.'
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
});

// Update course progress
router.put('/:id/progress', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const { courseId, progress, completedModules } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await student.updateCourseProgress(course._id, progress, completedModules);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        courseId,
        progress,
        completedModules
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
});

// Get all students (Admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, all, includeInactive } = req.query;
    const parsedLimit = parseInt(limit);
    const skip = (parseInt(page) - 1) * parsedLimit;

    // Build query: include inactive only if explicitly requested
    let query = {};
    const includeInactiveFlag = String(includeInactive).toLowerCase();
    if (includeInactiveFlag !== 'true' && includeInactiveFlag !== '1') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const usePagination = (() => {
      const allFlag = String(all).toLowerCase();
      return !(allFlag === 'true' || allFlag === '1');
    })();

    let queryBuilder = Student.find(query)
      .populate('enrolledCourses.courseId', 'title courseId price')
      .populate('paymentHistory.courseId', 'title courseId price')
      .select('-password')
      .sort({ createdAt: -1 });

    if (usePagination) {
      queryBuilder = queryBuilder.skip(skip).limit(parsedLimit);
    }

    const students = await queryBuilder.exec();
    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        current: usePagination ? parseInt(page) : 1,
        pages: usePagination ? Math.ceil(total / parsedLimit) : 1,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// Delete student (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Store student info for response
    const deletedStudentInfo = {
      id: student._id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    };

    // Delete the student record
    await Student.findByIdAndDelete(id);

    // Also delete the associated user record if it exists
    const User = require('../models/User');
    if (student.user_id) {
      await User.findByIdAndDelete(student.user_id);
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      deletedStudent: deletedStudentInfo
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// Admin: Reset a student's password and return a temporary password
router.post('/admin/reset-password/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the student by ID
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find associated user record
    const user = await User.findById(student.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Associated user account not found'
      });
    }

    // Generate a temporary password
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      let pass = '';
      for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pass;
    };

    const tempPassword = generateTempPassword();

    // Set and save new password (User model should hash on save)
    user.password = tempPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Temporary password generated successfully',
      data: {
        studentId: student.studentId,
        username: user.username,
        tempPassword
      }
    });
  } catch (error) {
    console.error('Error resetting student password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting student password',
      error: error.message
    });
  }
});

// ===== STUDENT PROGRESS TRACKING ROUTES =====

// Get comprehensive progress for a student across all courses
router.get('/:id/progress', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const progressRecords = await StudentProgress.getProgressByStudent(studentId);
    
    if (!progressRecords || progressRecords.length === 0) {
      return res.json({
        success: true,
        message: 'No progress records found',
        data: []
      });
    }

    // Calculate overall statistics
    const overallStats = {
      totalCourses: progressRecords.length,
      completedCourses: progressRecords.filter(p => p.status === 'completed').length,
      inProgressCourses: progressRecords.filter(p => p.status === 'in-progress').length,
      totalTimeSpent: progressRecords.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      averageProgress: Math.round(progressRecords.reduce((sum, p) => sum + p.overallProgress, 0) / progressRecords.length),
      totalMilestones: progressRecords.reduce((sum, p) => sum + p.milestones.length, 0)
    };

    res.json({
      success: true,
      data: {
        progressRecords,
        overallStats
      }
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student progress',
      error: error.message
    });
  }
});

// Get detailed progress for a specific course
router.get('/:id/progress/course/:courseId', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const { id: studentId, courseId } = req.params;
    
    const progress = await StudentProgress.findOne({ 
      studentId, 
      courseId 
    }).populate('courseId', 'title courseId category level modules');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found for this course'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
});

// Initialize or create progress tracking for a course
router.post('/:id/progress/initialize', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId } = req.body;

    // Check if progress already exists
    let progress = await StudentProgress.findOne({ studentId, courseId });
    
    if (progress) {
      return res.json({
        success: true,
        message: 'Progress already exists',
        data: progress
      });
    }

    // Get course details to initialize modules
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create new progress record
    progress = new StudentProgress({
      studentId,
      courseId,
      enrollmentDate: new Date(),
      modules: course.modules.map((module, index) => ({
        moduleId: `module_${index + 1}`,
        moduleTitle: module.title,
        lessons: module.topics.map((topic, topicIndex) => ({
          lessonId: `lesson_${index + 1}_${topicIndex + 1}`,
          lessonTitle: topic
        }))
      }))
    });

    await progress.save();

    // Add first milestone
    progress.addMilestone('first_lesson', 'Started learning journey');
    await progress.save();

    res.status(201).json({
      success: true,
      message: 'Progress tracking initialized successfully',
      data: progress
    });
  } catch (error) {
    console.error('Error initializing progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing progress',
      error: error.message
    });
  }
});

// Start a learning session
router.post('/:id/progress/session/start', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId } = req.body;

    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    progress.startSession();
    await progress.save();

    res.json({
      success: true,
      message: 'Learning session started',
      data: {
        sessionStartTime: progress.currentSession.startTime,
        isActive: progress.currentSession.isActive
      }
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting session',
      error: error.message
    });
  }
});

// End a learning session
router.post('/:id/progress/session/end', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId } = req.body;

    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    progress.endSession();
    await progress.save();

    res.json({
      success: true,
      message: 'Learning session ended',
      data: {
        totalTimeSpent: progress.totalTimeSpent,
        averageSessionTime: progress.averageSessionTime
      }
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message
    });
  }
});

// Update lesson progress
router.put('/:id/progress/lesson', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { 
      courseId, 
      moduleId, 
      lessonId, 
      status, 
      watchProgress, 
      timeSpent, 
      notes 
    } = req.body;

    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    const module = progress.modules.find(m => m.moduleId === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const lesson = module.lessons.find(l => l.lessonId === lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Update lesson progress
    if (status) lesson.status = status;
    if (watchProgress !== undefined) lesson.watchProgress = watchProgress;
    if (timeSpent !== undefined) {
      lesson.timeSpent += timeSpent;
      module.totalTimeSpent += timeSpent;
    }
    if (notes) {
      lesson.notes.push({ content: notes });
    }

    lesson.lastAccessedAt = new Date();

    // Mark as started if not already
    if (lesson.status !== 'not-started' && !lesson.startedAt) {
      lesson.startedAt = new Date();
    }

    // Mark as completed if status is completed
    if (lesson.status === 'completed' && !lesson.completedAt) {
      lesson.completedAt = new Date();
      progress.activityLog.push({
        type: 'lesson_completed',
        details: { moduleId, lessonId, lessonTitle: lesson.lessonTitle }
      });
    }

    // Update module progress
    const completedLessons = module.lessons.filter(l => l.status === 'completed').length;
    module.progressPercentage = Math.round((completedLessons / module.lessons.length) * 100);

    if (module.progressPercentage > 0 && !module.startedAt) {
      module.startedAt = new Date();
    }

    if (module.progressPercentage === 100 && !module.completedAt) {
      module.completedAt = new Date();
      module.status = 'completed';
      progress.addMilestone('first_module', `Completed module: ${module.moduleTitle}`);
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Lesson progress updated successfully',
      data: {
        lesson,
        moduleProgress: module.progressPercentage,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lesson progress',
      error: error.message
    });
  }
});

// Update assignment progress
router.put('/:id/progress/assignment', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { 
      courseId, 
      moduleId, 
      assignmentId, 
      status, 
      score,
      maxScore,
      timeSpent,
      feedback 
    } = req.body;

    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    const module = progress.modules.find(m => m.moduleId === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    let assignment = module.assignments.find(a => a.assignmentId === assignmentId);
    if (!assignment) {
      // Create new assignment if it doesn't exist
      assignment = {
        assignmentId,
        assignmentTitle: req.body.assignmentTitle || 'Assignment',
        status: 'not-started',
        attempts: []
      };
      module.assignments.push(assignment);
      assignment = module.assignments[module.assignments.length - 1];
    }

    // Update assignment progress
    if (status) assignment.status = status;
    if (score !== undefined) assignment.score = score;
    if (maxScore !== undefined) assignment.maxScore = maxScore;
    if (timeSpent !== undefined) assignment.timeSpent += timeSpent;
    if (feedback) assignment.feedback = feedback;

    // Auto-grade: mark completed when score > 60% of max (more than 6/10)
    if (
      typeof assignment.score === 'number' &&
      typeof assignment.maxScore === 'number'
    ) {
      const prevStatus = assignment.status;
      const passedThreshold = assignment.score > (assignment.maxScore * 0.6);
      if (passedThreshold && prevStatus !== 'graded') {
        assignment.status = 'graded';
        assignment.completedAt = new Date();
        progress.activityLog.push({
          type: 'assignment_completed',
          details: { moduleId, assignmentId, score: assignment.score, maxScore: assignment.maxScore }
        });
      }
    }

    // Handle submission
    if (status === 'submitted' && !assignment.submittedAt) {
      assignment.submittedAt = new Date();
      
      // Add attempt record
      assignment.attempts.push({
        attemptNumber: assignment.attempts.length + 1,
        submittedAt: new Date(),
        score: score || 0,
        timeSpent: timeSpent || 0
      });

      progress.activityLog.push({
        type: 'assignment_submitted',
        details: { moduleId, assignmentId, assignmentTitle: assignment.assignmentTitle }
      });
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Assignment progress updated successfully',
      data: {
        assignment,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('Error updating assignment progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment progress',
      error: error.message
    });
  }
});

// Update quiz progress
router.put('/:id/progress/quiz', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { 
      courseId, 
      moduleId, 
      quizId, 
      score,
      maxScore,
      timeSpent,
      answers
    } = req.body;

    const progress = await StudentProgress.findOne({ studentId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    const module = progress.modules.find(m => m.moduleId === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    let quiz = module.quizzes.find(q => q.quizId === quizId);
    if (!quiz) {
      // Create new quiz if it doesn't exist
      quiz = {
        quizId,
        quizTitle: req.body.quizTitle || 'Quiz',
        status: 'not-started',
        attempts: [],
        bestScore: 0,
        totalAttempts: 0,
        averageScore: 0
      };
      module.quizzes.push(quiz);
      quiz = module.quizzes[module.quizzes.length - 1];
    }

    // Add attempt
    const attempt = {
      attemptNumber: quiz.attempts.length + 1,
      startedAt: new Date(Date.now() - (timeSpent * 60000)), // Calculate start time
      completedAt: new Date(),
      score: score || 0,
      maxScore: maxScore || 100,
      timeSpent: timeSpent || 0,
      answers: answers || []
    };

    quiz.attempts.push(attempt);
    quiz.totalAttempts++;
    quiz.status = 'completed';

    // Update best score and average
    quiz.bestScore = Math.max(quiz.bestScore, score || 0);
    quiz.averageScore = Math.round(quiz.attempts.reduce((sum, att) => sum + att.score, 0) / quiz.attempts.length);

    progress.activityLog.push({
      type: 'quiz_taken',
      details: { 
        moduleId, 
        quizId, 
        quizTitle: quiz.quizTitle,
        score,
        attemptNumber: attempt.attemptNumber
      }
    });

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Quiz progress updated successfully',
      data: {
        quiz,
        attempt,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('Error updating quiz progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quiz progress',
      error: error.message
    });
  }
});

// Get learning analytics for a student
router.get('/:id/analytics', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId, timeframe = '30d' } = req.query;

    let query = { studentId };
    if (courseId) query.courseId = courseId;

    const progressRecords = await StudentProgress.find(query)
      .populate('courseId', 'title category level');

    if (!progressRecords.length) {
      return res.json({
        success: true,
        message: 'No data available for analytics',
        data: null
      });
    }

    // Calculate analytics
    const analytics = {
      summary: {
        totalCourses: progressRecords.length,
        completedCourses: progressRecords.filter(p => p.status === 'completed').length,
        totalTimeSpent: progressRecords.reduce((sum, p) => sum + p.totalTimeSpent, 0),
        averageEngagement: Math.round(progressRecords.reduce((sum, p) => sum + p.performanceMetrics.engagementScore, 0) / progressRecords.length)
      },
      performance: {
        averageQuizScore: Math.round(progressRecords.reduce((sum, p) => sum + p.performanceMetrics.averageQuizScore, 0) / progressRecords.length),
        averageAssignmentScore: Math.round(progressRecords.reduce((sum, p) => sum + p.performanceMetrics.averageAssignmentScore, 0) / progressRecords.length),
        completionRate: Math.round(progressRecords.reduce((sum, p) => sum + p.performanceMetrics.completionRate, 0) / progressRecords.length)
      },
      streaks: {
        currentStreak: Math.max(...progressRecords.map(p => p.performanceMetrics.streakDays), 0),
        longestStreak: Math.max(...progressRecords.map(p => p.performanceMetrics.longestStreak), 0)
      },
      recentActivity: progressRecords
        .flatMap(p => p.activityLog.map(log => ({ ...log.toObject(), courseTitle: p.courseId?.title })))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20),
      milestones: progressRecords
        .flatMap(p => p.milestones.map(m => ({ ...m.toObject(), courseTitle: p.courseId?.title })))
        .sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Submit module with URL using real module ID from course data
router.post('/:id/submit-module', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId, moduleId, submissionUrl } = req.body;

    console.log("Request body when clicked SubmissionURL", {courseId, moduleId, submissionUrl});

    console.log('Submission request:', { studentId, courseId, moduleId, submissionUrl });

    if (!courseId || !moduleId || !submissionUrl) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, Module ID, and submission URL are required'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find the enrollment for this course
    const enrollment = student.enrolledCourses.find(
      enrollment => enrollment.courseId.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Check if module is already submitted
    const existingSubmission = enrollment.completedModules.find(
      module => module.moduleId.toString() === moduleId.toString()
    );

    console.log("Existing Submissions: ", existingSubmission);

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submissionUrl = submissionUrl;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = 'submitted';
    } else {
      // Add new submission
      enrollment.completedModules.push({
        moduleId: new mongoose.Types.ObjectId(moduleId),
        submissionUrl: submissionUrl,
        submittedAt: new Date(),
        status: 'submitted'
      });
    }

    // Update progress based on completed modules
    // Get course data to determine total modules
    const course = await Course.findById(courseId);
    const totalModules = course ? course.modules.length : 6;
    const progress = Math.round((enrollment.completedModules.length / totalModules) * 100);
    enrollment.progress = Math.min(progress, 100);

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    }

    await student.save();

    console.log('Module submitted successfully:', {
      courseId,
      moduleId,
      submissionUrl,
      progress: enrollment.progress,
      totalSubmissions: enrollment.completedModules.length
    });

    res.json({
      success: true,
      message: 'Module submitted successfully',
      data: {
        courseId,
        moduleId,
        submissionUrl,
        submittedAt: new Date(),
        progress: enrollment.progress,
        totalSubmissions: enrollment.completedModules.length
      }
    });
  } catch (error) {
    console.error('Error submitting module:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting module',
      error: error.message
    });
  }
});

// Get module submissions for a student in a specific course
router.get('/:id/module-submissions/:courseId', authenticateStudent, authorizeOwnProfile, async (req, res) => {
  try {
    const { id: studentId, courseId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const enrollment = student.enrolledCourses.find(
      enrollment => enrollment.courseId.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: enrollment.completedModules
    });
  } catch (error) {
    console.error('Error fetching module submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module submissions',
      error: error.message
    });
  }
});

// Get all student submissions for admin (no authentication required - admin only)
router.get('/admin/submissions', async (req, res) => {
  try {
    console.log('Admin submissions endpoint called');
    
    const students = await Student.find({ isActive: true })
      .populate('enrolledCourses.courseId', 'title courseId modules')
      .select('firstName lastName email studentId enrolledCourses')
      .sort({ createdAt: -1 });

    console.log(`Found ${students.length} students`);

    const submissionsData = [];

    for (const student of students) {
      for (const enrollment of student.enrolledCourses) {
        if (enrollment.completedModules && enrollment.completedModules.length > 0) {
          for (const submission of enrollment.completedModules) {
            // Get module title from course data
            let moduleTitle = 'Unknown Module';
            if (enrollment.courseId && enrollment.courseId.modules) {
              const moduleIndex = enrollment.courseId.modules.findIndex(
                module => module._id.toString() === submission.moduleId.toString()
              );
              if (moduleIndex !== -1) {
                moduleTitle = enrollment.courseId.modules[moduleIndex].title;
              }
            }

            submissionsData.push({
              studentId: student._id,
              studentName: `${student.firstName} ${student.lastName}`,
              studentEmail: student.email,
              studentCode: student.studentId,
              courseId: enrollment.courseId._id,
              courseTitle: enrollment.courseId.title,
              courseName: enrollment.courseId.courseId,
              moduleId: submission.moduleId,
              moduleTitle: moduleTitle,
              submissionUrl: submission.submissionUrl,
              submittedAt: submission.submittedAt,
              status: submission.status,
              feedback: submission.feedback || ''
            });
          }
        }
      }
    }

    console.log(`Found ${submissionsData.length} total submissions`);

    res.json({
      success: true,
      data: submissionsData,
      count: submissionsData.length
    });

  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student submissions',
      error: error.message
    });
  }
});

// Get students by referral code with course information
router.get('/by-referral/:referralCode', async (req, res) => {
  try {
    const { referralCode } = req.params;
    
    // Find faculty by referral code to get faculty info
    const Faculty = require('../models/Faculty');
    const faculty = await Faculty.findByReferralCode(referralCode);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Find all payments with the specified referral code
    const Payment = require('../models/Payment');
    const payments = await Payment.find({ 
      referralCode: referralCode.toUpperCase(),
      status: 'completed'
    })
    .populate('studentId', 'firstName lastName email phone studentId')
    .populate('courseId', 'title courseId price')
    .sort({ createdAt: -1 });

    // Transform the data with better structure
    const studentsWithReferral = payments.map(payment => ({
      _id: payment.studentId._id,
      name: `${payment.studentId.firstName} ${payment.studentId.lastName}`,
      email: payment.studentId.email,
      phone: payment.studentId.phone,
      studentId: payment.studentId.studentId,
      selectedCourse: payment.courseName,
      courseId: payment.courseId._id,
      originalPrice: payment.originalAmount,
      finalPrice: payment.amount,
      discountAmount: payment.discountAmount,
      commissionAmount: payment.commissionAmount,
      paymentStatus: payment.status,
      confirmationStatus: payment.confirmationStatus,
      referralCode: payment.referralCode,
      transactionId: payment.transactionId,
      paymentDate: payment.createdAt,
      commissionPaid: payment.commissionPaid
    }));

    // Calculate summary for the faculty
    const summary = {
      facultyName: faculty.name,
      facultyEmail: faculty.email,
      totalStudents: studentsWithReferral.length,
      totalRevenue: studentsWithReferral.reduce((sum, student) => sum + student.finalPrice, 0),
      totalCommissions: studentsWithReferral.reduce((sum, student) => sum + student.commissionAmount, 0),
      paidCommissions: studentsWithReferral.filter(s => s.commissionPaid).reduce((sum, student) => sum + student.commissionAmount, 0),
      unpaidCommissions: studentsWithReferral.filter(s => !s.commissionPaid).reduce((sum, student) => sum + student.commissionAmount, 0)
    };

    res.json({
      success: true,
      data: studentsWithReferral,
      summary: summary,
      count: studentsWithReferral.length
    });

  } catch (error) {
    console.error('Error fetching students by referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students by referral code',
      error: error.message
    });
  }
});

module.exports = router;