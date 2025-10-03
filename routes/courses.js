const express = require('express');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const router = express.Router();
const { authenticateStudent } = require('../middleware/auth');

// Get all active courses
router.get('/', async (req, res) => {
  try {
    const { category, level } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
});

// Protect study material content route with authentication and purchase check
router.use('/code/:courseId', authenticateStudent, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const Course = require('../models/Course');
    const Purchase = require('../models/Purchase');
    const Payment = require('../models/Payment');
    const Student = require('../models/Student');

    // Find student
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Student not found' });
    }

    // Resolve course by string id or ObjectId
    let course = await Course.findOne({ courseId });
    if (!course && courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check purchase/confirmation
    const purchase = await Purchase.findOne({ studentId: student._id, courseId: course._id, status: 'completed' });
    const payment = await Payment.findOne({ studentId: student._id, courseId: course._id }).sort({ createdAt: -1 });
    const allowed = Boolean(purchase) || (payment && (payment.confirmationStatus === 'confirmed' || payment.status === 'completed'));

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied: purchase confirmation required for this course' });
    }

    // Allow the original route handler to proceed
    next();
  } catch (error) {
    console.error('Error in course access middleware:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while verifying course access', error: error.message });
  }
});

// Get course by courseId
router.get('/code/:courseId', async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
});


// Create new course (Admin only)
router.post('/', async (req, res) => {
  try {
    const courseData = req.body;

    // Generate unique courseId if not provided
    if (!courseData.courseId) {
      const { v4: uuidv4 } = require('uuid');
      courseData.courseId = `COURSE-${uuidv4().substring(0, 8).toUpperCase()}`;
    }

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
});

// Update course (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
});

// Delete course (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating course',
      error: error.message
    });
  }
});

// Get courses by category
router.get('/category/:category', async (req, res) => {
  try {
    const courses = await Course.getByCategory(req.params.category);

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by category',
      error: error.message
    });
  }
});

// Get courses by level
router.get('/level/:level', async (req, res) => {
  try {
    const courses = await Course.find({ level: req.params.level, isActive: true });

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses by level:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by level',
      error: error.message
    });
  }
});

// Purchase course endpoint
router.post('/purchase', async (req, res) => {
  try {
    const { courseId, studentId, paymentId, referralCode } = req.body;

    console.log("Courses Purchase: ", { courseId, studentId, paymentId, referralCode });

    // Verify course exists
    let course = await Course.findOne({ courseId: courseId });
    if (!course && courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    }
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get student details
    const Student = require('../models/Student');
    let student;

    if (studentId.includes('@')) {
      student = await Student.findOne({ email: studentId });
    } else {
      student = await Student.findOne({ studentId: studentId });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Handle referral code and calculate pricing
    let facultyId = null;
    let discountAmount = 0;
    let finalPrice = course.price;
    let commissionAmount = 0;

    if (referralCode && referralCode.trim()) {
      const Faculty = require('../models/Faculty');
      const faculty = await Faculty.findByReferralCode(referralCode.trim());
      if (faculty) {
        facultyId = faculty._id;
        const commissionDetails = faculty.calculateCommission(course.price);
        discountAmount = commissionDetails.discountAmount;
        finalPrice = commissionDetails.finalPrice;
        commissionAmount = commissionDetails.commission;
      }
    }

    // Create payment record
    const generatedPaymentId = paymentId || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = new Payment({
      paymentId: generatedPaymentId,
      studentId: student._id,
      courseId: course._id,
      courseName: course.title,
      amount: finalPrice,
      originalAmount: course.price,
      transactionId: generatedPaymentId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      status: 'completed',
      confirmationStatus: 'waiting_for_confirmation',
      paymentMethod: 'online',
      referralCode: referralCode?.trim()?.toUpperCase() || null,
      facultyId: facultyId,
      discountAmount: discountAmount,
      commissionAmount: commissionAmount
    });

    await payment.save();

    // Create purchase record for backward compatibility
    const Purchase = require('../models/Purchase');
    const purchase = new Purchase({
      studentId: student._id,
      courseId: course._id,
      originalPrice: course.price,
      finalPrice,
      discount: Math.round((discountAmount / course.price) * 100),
      referralCode: referralCode?.trim()?.toUpperCase() || null,
      paymentId: generatedPaymentId,
      status: 'completed',
      purchaseDate: new Date()
    });

    await purchase.save();

    res.json({
      success: true,
      message: 'Course purchased successfully',
      data: {
        purchaseId: purchase._id,
        paymentId: payment.paymentId,
        courseId: course.courseId || course._id, // Return the string courseId if available
        finalPrice,
        discount
      }
    });
  } catch (error) {
    console.error('Error processing course purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing course purchase',
      error: error.message
    });
  }
});

// Get purchased courses for a student
router.get('/purchased/:studentId', authenticateStudent, async (req, res) => {
  try {
    const Purchase = require('../models/Purchase');
    const Student = require('../models/Student');
    const Payment = require('../models/Payment');

    let studentIdentifier = req.params.studentId;
    console.log(studentIdentifier);

    // Authorization: ensure the requester is the same student
    const isEmailParam = studentIdentifier && studentIdentifier.includes('@');
    const requesterEmail = req?.student?.studentData?.email || '';
    const requesterId = (req?.student?.id || '').toString();
    const isSelf = isEmailParam
      ? (studentIdentifier.toLowerCase() === requesterEmail.toLowerCase())
      : (studentIdentifier === requesterId);

    if (!isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you can only view your own purchased courses.'
      });
    }
    
    // If the parameter looks like an email, find the student by email first
    const student = await Student.findOne({ email: studentIdentifier }).populate({
      path: 'enrolledCourses.courseId',
      model: 'Course'
    });
    if (!student) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No student found with this email'
      });
    }
    
    // Transform enrolled courses to include full course details and payment status
    const purchasedCourses = await Promise.all(student.enrolledCourses.map(async (enrollment) => {
      const course = enrollment.courseId;
      
      // Find the payment record for this course and student - Payment model uses ObjectId for studentId
      const payment = await Payment.findOne({
        studentId: student._id, // This is correct - Payment model expects ObjectId
        courseId: course._id
      }).sort({ createdAt: -1 }); // Get the latest payment record
      console.log("Payment found for course", course.title, ":", payment);
      
      return {
        id: course._id.toString(),
        courseId: course.courseId || course._id.toString(),
        title: course.title,
        category: course.category,
        level: course.level,
        description: course.description,
        technologies: course.technologies,
        price: course.price,
        duration: course.duration,
        projects: course.projects || 0,
        modules: course.modules || [],
        instructor: course.instructor,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress || 0,
        status: enrollment.status || 'active',
        // Payment confirmation status
        paymentStatus: payment ? payment.status : 'no_payment_record',
        confirmationStatus: payment ? payment.confirmationStatus : 'no_payment_record',
        transactionId: payment ? payment.transactionId : null,
        paymentMethod: payment ? payment.paymentMethod : null,
        adminConfirmedBy: payment ? payment.adminConfirmedBy : null,
        adminConfirmedAt: payment ? payment.adminConfirmedAt : null
      };
    }));
    
    console.log("Purchased Courses with Payment Status: ", purchasedCourses);

    res.json({
      success: true,
      data: purchasedCourses,
      count: purchasedCourses.length
    });
  } catch (error) {
    console.error('Error fetching purchased courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchased courses',
      error: error.message
    });
  }
});

// Verify referral code
router.post('/verify-referral', async (req, res) => {
  try {
    const { referralCode } = req.body;

    // Simple referral code validation
    const validCodes = {
      'REFER60': { discount: 60, description: '60% off on all courses' }
    };

    if (validCodes[referralCode]) {
      res.json({
        success: true,
        valid: true,
        discount: validCodes[referralCode].discount,
        description: validCodes[referralCode].description
      });
    } else {
      res.json({
        success: true,
        valid: false,
        message: 'Invalid referral code'
      });
    }
  } catch (error) {
    console.error('Error verifying referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying referral code',
      error: error.message
    });
  }
});

// Update course progress
router.post('/progress/update', async (req, res) => {
  try {
    const { studentId, courseId, lessonId, progress } = req.body;

    console.log('Updating progress for:', { studentId, courseId, progress });

    // Validate parameters
    if (!studentId || !courseId || courseId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }

    // First find the course by courseId string to get the ObjectId
    const course = await Course.findOne({ courseId: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const Purchase = require('../models/Purchase');

    // Find the purchase record using the course's ObjectId
    const purchase = await Purchase.findOne({
      studentId,
      courseId: course._id, // Use the ObjectId, not the string
      status: 'completed'
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Course not purchased or purchase not found'
      });
    }

    // Update progress
    purchase.progress = Math.max(purchase.progress, progress);
    purchase.lastAccessedAt = new Date();

    // Add completed lesson if provided
    if (lessonId) {
      const existingLesson = purchase.completedLessons.find(
        lesson => lesson.lessonId === lessonId
      );

      if (!existingLesson) {
        purchase.completedLessons.push({
          lessonId,
          completedAt: new Date()
        });
      }
    }

    await purchase.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: purchase.progress,
        completedLessons: purchase.completedLessons.length
      }
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course progress',
      error: error.message
    });
  }
});

// Get course progress
router.get('/progress/:studentId/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    console.log('Getting progress for:', { studentId, courseId });

    // Validate parameters
    if (!studentId || !courseId || courseId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }

    // First find the course by courseId string to get the ObjectId
    const course = await Course.findOne({ courseId: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('Found course:', course.title, 'ObjectId:', course._id);

    const Purchase = require('../models/Purchase');

    // Use the course's ObjectId to find the purchase
    const purchase = await Purchase.findOne({
      studentId,
      courseId: course._id, // Use the ObjectId, not the string
      status: 'completed'
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Course not purchased or purchase not found'
      });
    }

    res.json({
      success: true,
      data: {
        progress: purchase.progress,
        completedLessons: purchase.completedLessons,
        lastAccessedAt: purchase.lastAccessedAt,
        purchaseDate: purchase.purchaseDate
      }
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

// Quick access check: verify if authenticated student has access to a course
router.get('/access/:courseId', authenticateStudent, async (req, res) => {
  try {
    const { courseId } = req.params;
    const Purchase = require('../models/Purchase');
    const Student = require('../models/Student');
    const Payment = require('../models/Payment');

    // Find student from auth
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(401).json({ success: false, allowed: false, message: 'Student not found' });
    }

    // Accept either string courseId or ObjectId mapping
    let course = await Course.findOne({ courseId: courseId });
    if (!course && courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      return res.status(404).json({ success: false, allowed: false, message: 'Course not found' });
    }

    // Check purchase or confirmed payment
    const purchase = await Purchase.findOne({ studentId: student._id, courseId: course._id, status: 'completed' });
    const payment = await Payment.findOne({ studentId: student._id, courseId: course._id }).sort({ createdAt: -1 });

    const allowed = Boolean(purchase) || (payment && (payment.confirmationStatus === 'confirmed' || payment.status === 'completed'));

    return res.json({ success: true, allowed, courseId: course.courseId || course._id.toString() });
  } catch (error) {
    console.error('Error verifying course access:', error);
    res.status(500).json({ success: false, allowed: false, message: 'Error verifying course access', error: error.message });
  }
});

module.exports = router;