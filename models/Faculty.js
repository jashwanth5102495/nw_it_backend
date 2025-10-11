const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  commissionRate: {
    type: Number,
    default: 0.60, // 60% commission rate
    min: 0,
    max: 1
  },
  totalCommissionsEarned: {
    type: Number,
    default: 0
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bankDetails: {
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
facultySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to generate a unique referral code
facultySchema.methods.generateReferralCode = function() {
  const name = this.name.replace(/\s+/g, '').toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${name.substring(0, 4)}${randomNum}`;
};

// Method to calculate commission for a payment
facultySchema.methods.calculateCommission = function(originalPrice) {
  const rate = typeof this.commissionRate === 'number' && this.commissionRate >= 0 && this.commissionRate <= 1
    ? this.commissionRate
    : 0.60; // fallback to 60%
  const discountAmount = originalPrice * rate;
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const commission = discountAmount; // Commission equals discount amount
  return {
    originalPrice,
    discountAmount,
    finalPrice,
    commission
  };
};

// Static method to find faculty by referral code
facultySchema.statics.findByReferralCode = function(code) {
  return this.findOne({ 
    referralCode: code.toUpperCase(), 
    isActive: true 
  });
};

module.exports = mongoose.model('Faculty', facultySchema);