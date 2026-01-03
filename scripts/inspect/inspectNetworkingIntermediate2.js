require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!doc) {
      console.log('❌ Not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const topics = Array.isArray(doc.topics) ? doc.topics : [];
    const questions = Array.isArray(doc.questions) ? doc.questions : [];

    console.log(`✅ ${ASSIGNMENT_ID}`);
    console.log('  Title:', doc.title);
    console.log('  Description:', doc.description);
    console.log('  Topics:', topics.length);
    topics.forEach((t, i) => console.log(`    [${i+1}] ${t.title}`));
    console.log('  Questions:', questions.length);
    questions.slice(0, 3).forEach((q, i) => console.log(`    Q${q.questionId}: ${q.prompt || q.question}`));
    console.log('  Passing %:', doc.passingPercentage);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Inspect failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();