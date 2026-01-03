require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = process.argv[2] || 'frontend-beginner-6';
    const docs = await Assignment.find({ assignmentId }).lean();
    console.log(`Found ${docs.length} assignment documents for id: ${assignmentId}`);

    docs.forEach((a, idx) => {
      const correctCount = (a.questions || []).filter(q => typeof q.correctAnswer === 'number').length;
      const invalidCount = (a.questions || []).filter(q => {
        const n = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer);
        return !(Number.isInteger(n) && Array.isArray(q.options) && n >= 0 && n < q.options.length);
      }).length;
      console.log(`\n#${idx+1}: _id=${a._id} | title=${a.title} | withCorrect=${correctCount}/${a.questions?.length || 0} | invalidCorrect=${invalidCount}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();