const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },
  lessonTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  watchProgress: {
    type: Number, // percentage of video watched
    default: 0,
    min: 0,
    max: 100
  },
  notes: [{
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

const assignmentProgressSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    required: true
  },
  assignmentTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'submitted', 'graded'],
    default: 'not-started'
  },
  startedAt: {
    type: Date,
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  maxScore: {
    type: Number,
    default: 100
  },
  attempts: [{
    attemptNumber: Number,
    submittedAt: Date,
    score: Number,
    feedback: String,
    timeSpent: Number // in minutes
  }],
  feedback: {
    type: String,
    default: null
  },
  timeSpent: {
    type: Number, // total time spent in minutes
    default: 0
  }
});

const quizProgressSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  attempts: [{
    attemptNumber: Number,
    startedAt: Date,
    completedAt: Date,
    score: Number,
    maxScore: Number,
    timeSpent: Number, // in minutes
    answers: [{
      questionId: String,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }]
  }],
  bestScore: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
});

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true
  },
  moduleTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  lessons: [lessonProgressSchema],
  assignments: [assignmentProgressSchema],
  quizzes: [quizProgressSchema],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

const studentProgressSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    required: true
  },
  
  // Overall Progress
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused', 'dropped'],
    default: 'not-started'
  },
  
  // Time Tracking
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  estimatedTimeRemaining: {
    type: Number, // in minutes
    default: null
  },
  averageSessionTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Session Tracking
  currentSession: {
    startTime: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  // Learning Path
  currentModule: {
    type: String,
    default: null
  },
  currentLesson: {
    type: String,
    default: null
  },
  
  // Modules Progress
  modules: [moduleProgressSchema],
  
  // Performance Metrics
  performanceMetrics: {
    averageQuizScore: {
      type: Number,
      default: 0
    },
    averageAssignmentScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number, // calculated based on time spent, quiz attempts, etc.
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  },
  
  // Activity Tracking
  activityLog: [{
    type: {
      type: String,
      enum: ['lesson_started', 'lesson_completed', 'quiz_taken', 'assignment_submitted', 'session_started', 'session_ended'],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Milestones
  milestones: [{
    type: {
      type: String,
      enum: ['first_lesson', 'first_module', 'halfway_point', 'first_quiz', 'course_completed']
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Last Activity
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Completion Data
  completedAt: {
    type: Date,
    default: null
  },
  certificateEligible: {
    type: Boolean,
    default: false
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  finalGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
studentProgressSchema.index({ status: 1 });
studentProgressSchema.index({ lastActivityAt: -1 });
studentProgressSchema.index({ overallProgress: 1 });

// Methods
studentProgressSchema.methods.updateOverallProgress = function() {
  if (this.modules.length === 0) {
    this.overallProgress = 0;
    return;
  }
  
  const totalProgress = this.modules.reduce((sum, module) => sum + module.progressPercentage, 0);
  this.overallProgress = Math.round(totalProgress / this.modules.length);
  
  // Update status based on progress
  if (this.overallProgress === 0) {
    this.status = 'not-started';
  } else if (this.overallProgress === 100) {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.status = 'in-progress';
  }
};

studentProgressSchema.methods.updatePerformanceMetrics = function() {
  let totalQuizScore = 0;
  let quizCount = 0;
  let totalAssignmentScore = 0;
  let assignmentCount = 0;
  let completedItems = 0;
  let totalItems = 0;
  
  this.modules.forEach(module => {
    // Count quizzes
    module.quizzes.forEach(quiz => {
      if (quiz.bestScore > 0) {
        totalQuizScore += quiz.bestScore;
        quizCount++;
      }
      totalItems++;
      if (quiz.status === 'completed') completedItems++;
    });
    
    // Count assignments
    module.assignments.forEach(assignment => {
      if (assignment.score !== null) {
        totalAssignmentScore += assignment.score;
        assignmentCount++;
      }
      totalItems++;
      if (assignment.status === 'graded') completedItems++;
    });
    
    // Count lessons
    module.lessons.forEach(lesson => {
      totalItems++;
      if (lesson.status === 'completed') completedItems++;
    });
  });
  
  this.performanceMetrics.averageQuizScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;
  this.performanceMetrics.averageAssignmentScore = assignmentCount > 0 ? Math.round(totalAssignmentScore / assignmentCount) : 0;
  this.performanceMetrics.completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Calculate engagement score based on various factors
  const timeEngagement = Math.min((this.totalTimeSpent / 60), 100); // max 60 hours = 100 points
  const completionEngagement = this.performanceMetrics.completionRate;
  const performanceEngagement = (this.performanceMetrics.averageQuizScore + this.performanceMetrics.averageAssignmentScore) / 2;
  
  this.performanceMetrics.engagementScore = Math.round((timeEngagement + completionEngagement + performanceEngagement) / 3);
};

studentProgressSchema.methods.startSession = function() {
  this.currentSession.startTime = new Date();
  this.currentSession.isActive = true;
  this.lastActivityAt = new Date();
  
  this.activityLog.push({
    type: 'session_started',
    details: { startTime: new Date() }
  });
};

studentProgressSchema.methods.endSession = function() {
  if (this.currentSession.isActive && this.currentSession.startTime) {
    const sessionDuration = Math.round((Date.now() - this.currentSession.startTime.getTime()) / (1000 * 60)); // in minutes
    this.totalTimeSpent += sessionDuration;
    
    // Update average session time
    const sessionCount = this.activityLog.filter(log => log.type === 'session_started').length;
    this.averageSessionTime = Math.round(this.totalTimeSpent / sessionCount);
    
    this.activityLog.push({
      type: 'session_ended',
      details: { 
        endTime: new Date(),
        duration: sessionDuration
      }
    });
  }
  
  this.currentSession.startTime = null;
  this.currentSession.isActive = false;
  this.lastActivityAt = new Date();
};

studentProgressSchema.methods.addMilestone = function(type, details = '') {
  const existingMilestone = this.milestones.find(m => m.type === type);
  if (!existingMilestone) {
    this.milestones.push({
      type,
      details,
      achievedAt: new Date()
    });
  }
};

// Static methods
studentProgressSchema.statics.getProgressByStudent = async function(studentId) {
  return await this.find({ studentId })
    .populate('courseId', 'title courseId category level')
    .sort({ lastActivityAt: -1 });
};

studentProgressSchema.statics.getProgressByCourse = async function(courseId) {
  return await this.find({ courseId })
    .populate('studentId', 'firstName lastName email studentId')
    .sort({ overallProgress: -1 });
};

// Pre-save middleware
studentProgressSchema.pre('save', function(next) {
  this.updateOverallProgress();
  this.updatePerformanceMetrics();
  next();
});

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

module.exports = StudentProgress;