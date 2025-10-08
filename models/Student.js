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
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  education: {
    type: String,
    required: true,
    enum: ['high-school', 'diploma', 'bachelors', 'masters', 'phd', 'other']
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United States'
    }
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
    enrollment.completedModules = completedModules;
    
    if (progress >= 100) {
      enrollment.status = 'completed';
    }
  }
  
  return this.save();
};

// Method to submit module with URL
studentSchema.methods.submitModule = function(courseId, moduleIndex, moduleId, submissionUrl, submissionType) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course');
  }

  // Check if module is already submitted
  const existingSubmission = enrollment.completedModules.find(
    module => module.moduleIndex === moduleIndex
  );

  if (existingSubmission) {
    // Update existing submission
    existingSubmission.submissionUrl = submissionUrl;
    existingSubmission.submissionType = submissionType;
    existingSubmission.submittedAt = new Date();
    existingSubmission.status = 'submitted';
  } else {
    // Add new submission
    enrollment.completedModules.push({
      moduleId: moduleId,
      moduleIndex: moduleIndex,
      submissionUrl: submissionUrl,
      submissionType: submissionType,
      submittedAt: new Date(),
      status: 'submitted'
    });
  }

  // Update progress based on completed modules
  const totalModules = 6; // This should be dynamic based on course
  const progress = Math.round((enrollment.completedModules.length / totalModules) * 100);
  enrollment.progress = Math.min(progress, 100);

  if (enrollment.progress >= 100) {
    enrollment.status = 'completed';
  }
  
  return this.save();
};

// Method to get module submissions for a course
studentSchema.methods.getModuleSubmissions = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  return enrollment ? enrollment.completedModules : [];
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;