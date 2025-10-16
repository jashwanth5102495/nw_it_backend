const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  examples: [{
    type: String
  }],
  syntax: {
    type: String
  }
});

const questionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.Mixed, // Can be number or string
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: false // Made optional to debug
  }
}, { strict: false }); // Allow additional fields

const assignmentSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    required: true,
    unique: true
  },
  courseId: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  topics: [topicSchema],
  questions: [questionSchema],
  passingPercentage: {
    type: Number,
    default: 50 // Students need to score more than 50% to pass
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

// Update the updatedAt timestamp before saving
assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
