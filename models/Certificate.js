const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentIdString: {
    type: String,
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  issuer: {
    type: String,
    default: 'Jasnav Group'
  },
  official: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

certificateSchema.index({ studentIdString: 1, active: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);