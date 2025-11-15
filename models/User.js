const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'instructor'],
    default: 'student'
  },
  lastLogin: {
    type: Date,
    default: null
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log(`  [AUTH] Comparing password for user: ${this.username}`);
  console.log(`  [AUTH]   - Candidate password length: ${candidatePassword ? candidatePassword.length : 0}`);
  console.log(`  [AUTH]   - Stored hash: ${this.password.substring(0, 30)}...`);
  
  const startTime = Date.now();
  const result = await bcrypt.compare(candidatePassword, this.password);
  const duration = Date.now() - startTime;
  
  console.log(`  [AUTH]   - Comparison result: ${result ? 'MATCH ✓' : 'NO MATCH ✗'}`);
  console.log(`  [AUTH]   - Comparison took: ${duration}ms`);
  
  return result;
};

// Method to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    console.log(`  [AUTH] Password not modified for user: ${this.username || 'NEW USER'}, skipping hash`);
    return next();
  }
  
  console.log(`  [AUTH] Hashing password for user: ${this.username || 'NEW USER'}`);
  console.log(`  [AUTH]   - Original password length: ${this.password.length}`);
  
  try {
    // CRITICAL: Trim password to remove accidental whitespace BEFORE hashing
    // This prevents intermittent login failures caused by copy/paste with spaces
    const originalLength = this.password.length;
    this.password = this.password.trim();
    const trimmedLength = this.password.length;
    const trimmedChars = originalLength - trimmedLength;
    
    console.log(`  [AUTH]   - Trimmed ${trimmedChars} whitespace characters`);
    console.log(`  [AUTH]   - Final password length: ${trimmedLength}`);
    console.log(`  [AUTH]   - Hashing with bcrypt (cost: 10)...`);
    
    const hashStart = Date.now();
    // Hash password with cost of 10
    const hashedPassword = await bcrypt.hash(this.password, 10);
    const hashDuration = Date.now() - hashStart;
    
    console.log(`  [AUTH]   - Hash generation took: ${hashDuration}ms`);
    console.log(`  [AUTH]   - Hash preview: ${hashedPassword.substring(0, 30)}...`);
    
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error(`  [AUTH] ❌ Error hashing password:`, error.message);
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;