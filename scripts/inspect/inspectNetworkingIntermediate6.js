require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentInspectInt6', assignmentSchema, 'assignments');

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const nTopics = Array.isArray(doc.topics) ? doc.topics.length : 0;
    const nQuestions = Array.isArray(doc.questions) ? doc.questions.length : 0;
    const passing = doc.passingPercentage;

    console.log(`✅ ${doc.title}`);
    console.log(`Topics: ${nTopics}`);
    console.log(`Questions: ${nQuestions}`);
    console.log(`Passing %: ${passing}`);

    (doc.topics || []).slice(0, 5).forEach((t, i) => console.log(`  [T${i+1}] ${t.title}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Inspect failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();