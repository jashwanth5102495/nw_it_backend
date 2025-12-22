require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-5';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentInspectAll5', assignmentSchema, 'assignments');

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const docs = await Assignment.find({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!docs || docs.length === 0) {
      console.log('❌ Not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    console.log(`Found ${docs.length} documents for ${ASSIGNMENT_ID}`);
    docs.forEach((doc, idx) => {
      const topics = Array.isArray(doc.topics) ? doc.topics : [];
      const questions = Array.isArray(doc.questions) ? doc.questions : [];
      console.log(`— [${idx}] _id=${doc._id} title='${doc.title}' topics=${topics.length} questions=${questions.length} updatedAt=${doc.updatedAt}`);
      const firstTopics = topics.slice(0, 3).map(t => t.title).join(' | ');
      console.log(`    topics sample: ${firstTopics || '(none)'}`);
      const firstQs = questions.slice(0, 3).map(q => q.prompt || q.question).join(' | ');
      console.log(`    questions sample: ${firstQs || '(none)'}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Inspect all failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();