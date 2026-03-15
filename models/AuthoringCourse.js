const mongoose = require('mongoose');

const syntaxItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    duration: { type: String, default: '' },
    content: { type: String, default: '' },
    syntax: { type: [syntaxItemSchema], default: [] },
    liveCode: { type: String, default: '' },
    liveCodeExplanation: { type: String, default: '' },
    language: { type: String, default: undefined },
    liveCodeIsJsSnippet: { type: Boolean, default: undefined },
    terminalCommands: { type: [String], default: undefined }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    id: { type: String, default: undefined, trim: true },
    title: { type: String, required: true, trim: true },
    duration: { type: String, default: '' },
    topics: { type: [String], default: [] },
    description: { type: String, default: undefined },
    lessons: { type: [lessonSchema], default: undefined }
  },
  { _id: false }
);

const authoringCourseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    courseId: { type: String, default: undefined, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    level: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: undefined },
    duration: { type: String, default: '' },
    projects: { type: Number, default: 0 },
    image: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    maxStudents: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.Mixed, default: '' },
    certification: { type: String, default: undefined },
    premiumFeatures: { type: [String], default: undefined },
    modules: { type: [moduleSchema], default: [] },
    icon: { type: mongoose.Schema.Types.Mixed, default: undefined }
  },
  { timestamps: true }
);

authoringCourseSchema.index({ id: 1 }, { unique: true });

const AuthoringCourse = mongoose.model('AuthoringCourse', authoringCourseSchema);

module.exports = AuthoringCourse;
