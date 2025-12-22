require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentUpdateVerify', assignmentSchema, 'assignments');

const topics = Array.from({ length: 10 }).map((_, i) => ({
  topicId: `t${i+1}`,
  title: `Topic ${i+1}`,
  content: `Content ${i+1}`
}));
const questions = Array.from({ length: 10 }).map((_, i) => ({
  questionId: i+1,
  prompt: `Prompt ${i+1}`,
  options: ['A','B','C','D'],
  correctAnswer: 0
}));

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('Before:', {
      topics: (before?.topics || []).length,
      questions: (before?.questions || []).length,
      updatedAt: before?.updatedAt
    });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    doc.topics = topics;
    doc.questions = questions;
    await doc.save();
    console.log('Saved in-memory lengths:', { topics: doc.topics.length, questions: doc.questions.length });

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After:', {
      topics: (after?.topics || []).length,
      questions: (after?.questions || []).length,
      updatedAt: after?.updatedAt
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Update/verify failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();