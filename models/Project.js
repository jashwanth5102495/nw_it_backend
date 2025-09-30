const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  client_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  client_email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  client_phone: {
    type: String,
    default: '',
    trim: true,
    maxlength: 20
  },
  project_type: {
    type: String,
    enum: ['web_development', 'mobile_app', 'desktop_app', 'consulting', 'maintenance'],
    default: 'web_development'
  },
  status: {
    type: String,
    enum: [
      'project_confirmed',
      'designing_phase', 
      'development_phase',
      'pre_production_testing',
      'final_testing',
      'final_confirmation',
      'project_completed'
    ],
    default: 'project_confirmed'
  },

  estimated_duration: {
    type: Number,
    default: 30,
    min: 1
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },

  requirements: {
    type: String,
    default: '',
    maxlength: 2000
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
projectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static method to get project statistics
projectSchema.statics.getStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          in_progress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          avg_progress: { $avg: '$progress' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        total: 0,
        completed: 0,
        in_progress: 0,
        pending: 0,
        avg_progress: 0
      };
    }

    return {
      total: stats[0].total || 0,
      completed: stats[0].completed || 0,
      in_progress: stats[0].in_progress || 0,
      pending: stats[0].pending || 0,
      avg_progress: Math.round(stats[0].avg_progress || 0)
    };
  } catch (error) {
    throw error;
  }
};

// Instance method to convert to JSON with id field
projectSchema.methods.toJSON = function() {
  const project = this.toObject();
  project.id = project._id.toString();
  delete project._id;
  delete project.__v;
  return project;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;