const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Frontend Development', 'Backend Development', 'Full Stack Development', 'Mobile Development', 'Data Science', 'DevOps']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    topics: [{
      type: String,
      required: true
    }]
  }],
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String,
    required: true
  }],
  instructor: {
    name: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});



// Static method to get courses by category
courseSchema.statics.getByCategory = async function(category) {
  return await this.find({ category, isActive: true });
};

// Static method to get courses by level
courseSchema.statics.getByLevel = async function(level) {
  return await this.find({ level, isActive: true });
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;