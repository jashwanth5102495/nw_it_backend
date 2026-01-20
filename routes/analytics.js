const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');

// Get comprehensive payment analytics (Admin Dashboard)
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

    // Overall payment statistics
    const totalStats = await Payment.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    // Referral statistics
    const referralStats = await Payment.aggregate([
      {
        $match: { 
          createdAt: { $gte: startDate },
          referralCode: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalReferralPayments: { $sum: 1 },
          totalCommissions: { $sum: '$commissionAmount' },
          totalDiscounts: { $sum: '$discountAmount' },
          paidCommissions: {
            $sum: { $cond: [{ $eq: ['$commissionPaid', true] }, '$commissionAmount', 0] }
          }
        }
      }
    ]);

    // Top performing faculty
    const topFaculty = await Payment.aggregate([
      {
        $match: { 
          createdAt: { $gte: startDate },
          facultyId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$facultyId',
          referralCount: { $sum: 1 },
          totalCommissions: { $sum: '$commissionAmount' },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'faculties',
          localField: '_id',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      {
        $unwind: '$faculty'
      },
      {
        $project: {
          name: '$faculty.name',
          email: '$faculty.email',
          referralCode: '$faculty.referralCode',
          referralCount: 1,
          totalCommissions: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalCommissions: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Course revenue breakdown
    const courseRevenue = await Payment.aggregate([
      {
        $match: { 
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$courseId',
          courseName: { $first: '$courseName' },
          totalRevenue: { $sum: '$amount' },
          totalEnrollments: { $sum: 1 },
          averagePrice: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      {
        $match: { 
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: totalStats[0] || {},
        referrals: referralStats[0] || {},
        topFaculty,
        courseRevenue,
        dailyTrends: dailyRevenue,
        timeframe
      }
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment analytics',
      error: error.message
    });
  }
});

// Get all faculty with their performance metrics
router.get('/faculty/performance', async (req, res) => {
  try {
    const facultyPerformance = await Faculty.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'facultyId',
          as: 'payments'
        }
      },
      {
        $addFields: {
          totalReferrals: { $size: '$payments' },
          completedReferrals: {
            $size: {
              $filter: {
                input: '$payments',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          totalCommissions: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                },
                as: 'payment',
                in: '$$payment.commissionAmount'
              }
            }
          },
          paidCommissions: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    cond: { 
                      $and: [
                        { $eq: ['$$this.status', 'completed'] },
                        { $eq: ['$$this.commissionPaid', true] }
                      ]
                    }
                  }
                },
                as: 'payment',
                in: '$$payment.commissionAmount'
              }
            }
          },
          unpaidCommissions: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    cond: { 
                      $and: [
                        { $eq: ['$$this.status', 'completed'] },
                        { $eq: ['$$this.commissionPaid', false] }
                      ]
                    }
                  }
                },
                as: 'payment',
                in: '$$payment.commissionAmount'
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          referralCode: 1,
          commissionRate: 1,
          isActive: 1,
          createdAt: 1,
          totalReferrals: 1,
          completedReferrals: 1,
          totalCommissions: 1,
          paidCommissions: 1,
          unpaidCommissions: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$totalReferrals', 0] },
              { $divide: ['$completedReferrals', '$totalReferrals'] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalCommissions: -1 }
      }
    ]);

    res.json({
      success: true,
      data: facultyPerformance
    });

  } catch (error) {
    console.error('Error fetching faculty performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty performance',
      error: error.message
    });
  }
});

// Validate referral code and calculate pricing
router.post('/validate-referral', async (req, res) => {
  try {
    const { referralCode, coursePrice } = req.body;

    if (!referralCode || !coursePrice) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and course price are required'
      });
    }

    const faculty = await Faculty.findByReferralCode(referralCode);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    const calculation = faculty.calculateCommission(coursePrice);

    res.json({
      success: true,
      message: 'Valid referral code',
      data: {
        facultyName: faculty.name,
        facultyEmail: faculty.email,
        referralCode: faculty.referralCode,
        isValid: true,
        pricing: calculation
      }
    });

  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating referral code',
      error: error.message
    });
  }
});

// Get commission report for a specific faculty member
router.get('/faculty/:facultyId/commissions', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { facultyId };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('studentId', 'firstName lastName email studentId')
      .populate('courseId', 'title courseId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);

    // Calculate summary
    const summary = payments.reduce((acc, payment) => {
      acc.totalCommissions += payment.commissionAmount || 0;
      acc.totalDiscounts += payment.discountAmount || 0;
      acc.totalRevenue += payment.amount || 0;
      if (payment.commissionPaid) {
        acc.paidCommissions += payment.commissionAmount || 0;
      } else {
        acc.unpaidCommissions += payment.commissionAmount || 0;
      }
      return acc;
    }, {
      totalCommissions: 0,
      paidCommissions: 0,
      unpaidCommissions: 0,
      totalDiscounts: 0,
      totalRevenue: 0
    });

    res.json({
      success: true,
      data: {
        payments,
        summary,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / parseInt(limit)),
          totalPayments,
          hasNextPage: parseInt(page) < Math.ceil(totalPayments / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching faculty commissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty commissions',
      error: error.message
    });
  }
});

// Bulk update commission payment status
router.post('/commissions/bulk-update', async (req, res) => {
  try {
    const { paymentIds, action } = req.body; // action: 'mark_paid' or 'mark_unpaid'

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment IDs array is required'
      });
    }

    if (!['mark_paid', 'mark_unpaid'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "mark_paid" or "mark_unpaid"'
      });
    }

    const updateData = {
      commissionPaid: action === 'mark_paid',
      commissionPaidDate: action === 'mark_paid' ? new Date() : null
    };

    const result = await Payment.updateMany(
      { _id: { $in: paymentIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Successfully ${action === 'mark_paid' ? 'marked as paid' : 'marked as unpaid'} ${result.modifiedCount} commission(s)`,
      data: {
        updatedCount: result.modifiedCount,
        action
      }
    });

  } catch (error) {
    console.error('Error updating commission status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating commission status',
      error: error.message
    });
  }
});

// Add Active Users analytics endpoint
router.get('/analytics/active-users', async (req, res) => {
  try {
    const windowMinutes = parseInt(req.query.windowMinutes, 10) || 10;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    // Count distinct students with an active session or recent activity
    const activeAgg = await require('../models/StudentProgress').aggregate([
      {
        $match: {
          $or: [
            { 'currentSession.isActive': true },
            { lastActivityAt: { $gte: since } }
          ]
        }
      },
      { $group: { _id: '$studentId' } },
      { $count: 'activeCount' }
    ]);

    const activeCount = (activeAgg[0] && activeAgg[0].activeCount) || 0;

    // Aggregate total time spent per student, latest activity, and session flag
    const usersAgg = await require('../models/StudentProgress').aggregate([
      {
        $group: {
          _id: '$studentId',
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          lastActivityAt: { $max: '$lastActivityAt' },
          isActiveSession: { $max: '$currentSession.isActive' }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'users',
          localField: 'student.user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentMongoId: '$_id',
          studentId: '$student.studentId',
          name: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          email: '$student.email',
          username: '$user.username',
          totalTimeSpent: 1,
          lastActivityAt: 1,
          isActiveSession: 1
        }
      },
      { $sort: { totalTimeSpent: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        activeCount,
        windowMinutes,
        users: usersAgg
      }
    });
  } catch (error) {
    console.error('Error fetching active users analytics:', error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching active users analytics',
      error: error.message
    });
  }
});

module.exports = router;