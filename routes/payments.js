const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// Create a new payment record for manual QR payment
router.post('/', async (req, res) => {
  try {
    console.log('=== BACKEND PAYMENT DEBUG ===');
    console.log('Received payment data:', req.body);
    
    const {
      transactionId,
      studentId,
      courseId,
      courseName,
      amount,
      originalAmount,
      studentName,
      studentEmail,
      metadata,
      referralCode
    } = req.body;

    console.log('Extracted fields:');
    console.log('- transactionId:', transactionId);
    console.log('- studentId:', studentId);
    console.log('- courseId:', courseId);
    console.log('- courseName:', courseName);
    console.log('- amount:', amount);
    console.log('- studentName:', studentName);
    console.log('- studentEmail:', studentEmail);
    console.log('============================');

    // Validate required fields
    if (!transactionId || !studentId || !courseId || !courseName || !amount || !studentName || !studentEmail) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Check if payment already exists with this transaction ID
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment with this transaction ID already recorded'
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Handle referral code if provided
    let faculty = null;
    let discountAmount = 0;
    let commissionAmount = 0;

    if (referralCode) {
      faculty = await Faculty.findByReferralCode(referralCode);
      if (faculty) {
        // Calculate commission and discount
        const calculation = faculty.calculateCommission(originalAmount || amount);
        discountAmount = calculation.discountAmount;
        commissionAmount = calculation.commission;

        // Update faculty statistics
        await Faculty.findByIdAndUpdate(faculty._id, {
          $inc: { totalReferrals: 1 }
        });
      }
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = new Payment({
      paymentId,
      studentId,
      courseId,
      courseName,
      amount,
      originalAmount: originalAmount || amount,
      transactionId,
      studentName,
      studentEmail,
      metadata: metadata || {},
      status: 'pending',
      confirmationStatus: 'waiting_for_confirmation',
      paymentMethod: 'manual_qr',
      // Referral code fields
      referralCode: referralCode || null,
      facultyId: faculty ? faculty._id : null,
      discountAmount,
      commissionAmount
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        courseName: payment.courseName,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
});

// Get all payments (Admin only)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      courseId,
      studentId,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments with pagination
    const payments = await Payment.find(filter)
      .populate('studentId', 'firstName lastName email studentId')
      .populate('courseId', 'title courseId category level')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(totalPayments / parseInt(limit));

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
});

// Get payment statistics (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();
    const monthlyRevenue = await Payment.getMonthlyRevenue();
    const courseRevenue = await Payment.getCourseRevenue();

    res.json({
      success: true,
      data: {
        overview: stats,
        monthlyRevenue,
        courseRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
});

// Get payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId })
      .populate('studentId', 'firstName lastName email studentId phone')
      .populate('courseId', 'title courseId category level duration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
});

// Get payments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ studentId })
      .populate('courseId', 'title courseId category level')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments({ studentId });
    const totalPages = Math.ceil(totalPayments / parseInt(limit));

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student payments',
      error: error.message
    });
  }
});

// Update payment status (Admin only)
router.put('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { paymentId },
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// Confirm payment by admin (for manual QR payments)
router.put('/:paymentId/confirm', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { confirmationStatus, adminEmail } = req.body;

    // Allow pending, confirmed, rejected, and error statuses
    if (!['pending', 'confirmed', 'rejected', 'error', 'waiting_for_confirmation'].includes(confirmationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmation status. Must be "pending", "confirmed", "rejected", "error", or "waiting_for_confirmation"'
      });
    }

    const updateData = {
      confirmationStatus,
      adminConfirmedBy: adminEmail || 'admin',
      adminConfirmedAt: new Date()
    };

    // Update payment status based on confirmation status
    if (confirmationStatus === 'confirmed') {
      updateData.status = 'completed';
    } else if (confirmationStatus === 'rejected') {
      updateData.status = 'failed';
    } else if (confirmationStatus === 'error') {
      updateData.status = 'failed';
    } else if (confirmationStatus === 'pending' || confirmationStatus === 'waiting_for_confirmation') {
      updateData.status = 'pending';
    }

    const payment = await Payment.findOneAndUpdate(
      { paymentId },
      updateData,
      { new: true }
    ).populate('studentId', 'name email')
     .populate('courseId', 'title');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is confirmed, enroll the student in the course
    if (confirmationStatus === 'confirmed') {
      try {
        const student = await Student.findById(payment.studentId);
        const course = await Course.findById(payment.courseId);

        if (student && course) {
          // Check if already enrolled
          const existingEnrollment = student.enrolledCourses.find(
            enrollment => enrollment.courseId.toString() === course._id.toString()
          );

          if (!existingEnrollment) {
            // Enroll student in course
            student.enrolledCourses.push({
              courseId: course._id,
              enrollmentDate: new Date(),
              progress: 0,
              status: 'active'
            });
            await student.save();
            console.log(`Student ${student.email} enrolled in course ${course.title}`);
          }
        }
      } catch (enrollmentError) {
        console.error('Error enrolling student in course:', enrollmentError);
        // Don't fail the payment confirmation if enrollment fails
      }
    }

    res.json({
      success: true,
      message: `Payment ${confirmationStatus} successfully`,
      data: payment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
});

module.exports = router;