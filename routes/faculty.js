const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Payment = require('../models/Payment');

// Validate referral code
router.post('/validate-referral', async (req, res) => {
  try {
    const { referralCode, coursePrice } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Find faculty by referral code
    const faculty = await Faculty.findByReferralCode(referralCode);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Calculate discount and commission
    const calculation = faculty.calculateCommission(coursePrice);

    res.json({
      success: true,
      message: 'Valid referral code',
      data: {
        facultyName: faculty.name,
        referralCode: faculty.referralCode,
        ...calculation
      }
    });

  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating referral code'
    });
  }
});

// Get all faculty members (admin only)
router.get('/all', async (req, res) => {
  try {
    const faculty = await Faculty.find({ isActive: true })
      .select('-bankDetails')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: faculty
    });

  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty'
    });
  }
});

// Create new faculty member
router.post('/create', async (req, res) => {
  try {
    const { name, email, commissionRate, referralCode } = req.body;

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty member with this email already exists'
      });
    }

    // Validate referral code
    if (!referralCode || !referralCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Check if referral code is already in use
    const existingReferralCode = await Faculty.findOne({ referralCode: referralCode.trim().toUpperCase() });
    if (existingReferralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code already exists. Please choose a different one.'
      });
    }

    // Create new faculty
    const faculty = new Faculty({
      name,
      email,
      referralCode: referralCode.trim().toUpperCase(),
      commissionRate: commissionRate || 0.40
    });
    await faculty.save();

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully',
      data: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        referralCode: faculty.referralCode,
        commissionRate: faculty.commissionRate
      }
    });

  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating faculty'
    });
  }
});

// Get faculty commission summary
router.get('/commissions', async (req, res) => {
  try {
    const commissions = await Payment.getFacultyCommissions();
    const stats = await Payment.getCommissionStats();

    res.json({
      success: true,
      data: {
        facultyCommissions: commissions,
        overallStats: stats
      }
    });

  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching commissions'
    });
  }
});

// Get specific faculty details
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .select('-bankDetails');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    // Get faculty's referral statistics
    const referralStats = await Payment.aggregate([
      {
        $match: {
          facultyId: faculty._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCommissions: { $sum: '$commissionAmount' },
          totalDiscounts: { $sum: '$discountAmount' },
          paidCommissions: {
            $sum: { $cond: [{ $eq: ['$commissionPaid', true] }, '$commissionAmount', 0] }
          }
        }
      }
    ]);

    const stats = referralStats[0] || {
      totalReferrals: 0,
      totalCommissions: 0,
      totalDiscounts: 0,
      paidCommissions: 0
    };

    res.json({
      success: true,
      data: {
        faculty,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty details'
    });
  }
});

// Update faculty commission payment status
router.patch('/commission/:paymentId/mark-paid', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.commissionPaid) {
      return res.status(400).json({
        success: false,
        message: 'Commission already marked as paid'
      });
    }

    payment.commissionPaid = true;
    payment.commissionPaidDate = new Date();
    await payment.save();

    // Update faculty total commissions
    if (payment.facultyId) {
      await Faculty.findByIdAndUpdate(
        payment.facultyId,
        { $inc: { totalCommissionsEarned: payment.commissionAmount } }
      );
    }

    res.json({
      success: true,
      message: 'Commission marked as paid successfully'
    });

  } catch (error) {
    console.error('Error updating commission status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating commission status'
    });
  }
});

// Delete faculty member (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the faculty member first
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    // Check if faculty has any associated payments/commissions
    const hasPayments = await Payment.findOne({ facultyId: id });
    
    if (hasPayments) {
      // If faculty has payments, mark as inactive instead of deleting
      faculty.isActive = false;
      await faculty.save();
      
      res.json({
        success: true,
        message: 'Faculty member deactivated successfully (has payment history)',
        data: {
          id: faculty._id,
          name: faculty.name,
          status: 'deactivated'
        }
      });
    } else {
      // If no payments, safe to delete completely
      await Faculty.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Faculty member deleted successfully',
        data: {
          id: id,
          name: faculty.name,
          status: 'deleted'
        }
      });
    }

  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting faculty'
    });
  }
});

module.exports = router;