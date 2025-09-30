const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    default: 'manual_qr'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  confirmationStatus: {
    type: String,
    enum: ['waiting_for_confirmation', 'confirmed', 'rejected'],
    default: 'waiting_for_confirmation'
  },
  transactionId: {
    type: String,
    required: true
  },
  adminConfirmedBy: {
    type: String,
    default: null
  },
  adminConfirmedAt: {
    type: Date,
    default: null
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  originalAmount: {
    type: Number,
    required: true
  },
  // Referral code fields
  referralCode: {
    type: String,
    default: null,
    uppercase: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  commissionAmount: {
    type: Number,
    default: 0
  },
  commissionPaid: {
    type: Boolean,
    default: false
  },
  commissionPaidDate: {
    type: Date,
    default: null
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  qrPaymentProof: {
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ courseId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averagePayment: { $avg: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalRevenue: 0,
    averagePayment: 0,
    completedPayments: 0,
    failedPayments: 0
  };
};

// Static method to get monthly revenue
paymentSchema.statics.getMonthlyRevenue = async function() {
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Static method to get course-wise revenue
paymentSchema.statics.getCourseRevenue = async function() {
  return await this.aggregate([
    {
      $match: { status: 'completed' }
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
    }
  ]);
};

// Static method to get commission statistics
paymentSchema.statics.getCommissionStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { 
        status: 'completed',
        referralCode: { $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        totalCommissions: { $sum: '$commissionAmount' },
        totalReferralPayments: { $sum: 1 },
        totalDiscountsGiven: { $sum: '$discountAmount' },
        paidCommissions: {
          $sum: { $cond: [{ $eq: ['$commissionPaid', true] }, '$commissionAmount', 0] }
        },
        unpaidCommissions: {
          $sum: { $cond: [{ $eq: ['$commissionPaid', false] }, '$commissionAmount', 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCommissions: 0,
    totalReferralPayments: 0,
    totalDiscountsGiven: 0,
    paidCommissions: 0,
    unpaidCommissions: 0
  };
};

// Static method to get faculty commission summary
paymentSchema.statics.getFacultyCommissions = async function() {
  return await this.aggregate([
    {
      $match: { 
        status: 'completed',
        facultyId: { $ne: null }
      }
    },
    {
      $lookup: {
        from: 'faculties',
        localField: 'facultyId',
        foreignField: '_id',
        as: 'faculty'
      }
    },
    {
      $unwind: '$faculty'
    },
    {
      $group: {
        _id: '$facultyId',
        facultyName: { $first: '$faculty.name' },
        facultyEmail: { $first: '$faculty.email' },
        referralCode: { $first: '$faculty.referralCode' },
        totalCommissions: { $sum: '$commissionAmount' },
        totalReferrals: { $sum: 1 },
        paidCommissions: {
          $sum: { $cond: [{ $eq: ['$commissionPaid', true] }, '$commissionAmount', 0] }
        },
        unpaidCommissions: {
          $sum: { $cond: [{ $eq: ['$commissionPaid', false] }, '$commissionAmount', 0] }
        }
      }
    },
    {
      $sort: { totalCommissions: -1 }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;