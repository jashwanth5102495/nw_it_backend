const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const assignmentAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  assignmentId: {
    type: String,
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
assignmentAttemptSchema.index({ studentEmail: 1, assignmentId: 1 });
assignmentAttemptSchema.index({ assignmentId: 1 });
assignmentAttemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AssignmentAttempt', assignmentAttemptSchema);
