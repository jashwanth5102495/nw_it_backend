const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  // Make phone optional to support Google-first login setup flow
  phone: {
    type: String,
    required: false,
    trim: true,
    maxlength: 20,
    default: ''
  },
  // Education optional initially; can be completed in setup
  education: {
    type: String,
    required: false,
    enum: ['high-school', 'diploma', 'bachelors', 'masters', 'phd', 'other'],
    default: 'other'
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Date of birth optional for initial Google login
  dateOfBirth: {
    type: Date,
    required: false,
    default: null
  },
  // Address fields optional initially; completed during setup
  address: {
    street: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    zipCode: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      required: false,
      trim: true,
      default: 'United States'
    }
  },
  // Auth provider metadata for admin visibility and logic
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: null
  },
  setupRequired: {
    type: Boolean,
    default: false
  },
  setupCompletedAt: {
    type: Date,
    default: null
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedModules: [{
      moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      submissionUrl: {
        type: String,
        required: true,
        trim: true
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['submitted', 'reviewed', 'approved', 'needs_revision'],
        default: 'submitted'
      },
      feedback: {
        type: String,
        default: ''
      }
    }],
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'dropped', 'pending_payment', 'payment_rejected'],
      default: 'active'
    },
    paymentId: {
      type: String,
      default: null
    },
    confirmationStatus: {
      type: String,
      enum: ['waiting_for_confirmation', 'confirmed', 'rejected'],
      default: null
    },
    finalGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
      default: null
    },
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  paymentHistory: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get full name
studentSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to enroll in a course
studentSchema.methods.enrollInCourse = function(courseId) {
  const existingEnrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  if (!existingEnrollment) {
    this.enrolledCourses.push({
      courseId: courseId,
      enrollmentDate: new Date(),
      progress: 0,
      status: 'active'
    });
  }
  
  return this.save();
};

// Method to update course progress
studentSchema.methods.updateCourseProgress = function(courseId, progress, completedModules = []) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  if (enrollment) {
    enrollment.progress = progress;
    if (Array.isArray(completedModules)) {
      enrollment.completedModules = completedModules;
    }
  }
};

studentSchema.methods.submitModule = function(courseId, moduleIndex, moduleId, submissionUrl, submissionType) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  if (!enrollment) return;

  enrollment.completedModules = enrollment.completedModules || [];
  enrollment.completedModules.push({
    moduleId,
    submissionUrl,
    submittedAt: new Date(),
    status: 'submitted',
    feedback: ''
  });
};

studentSchema.methods.getModuleSubmissions = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  return enrollment ? enrollment.completedModules || [] : [];
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;