require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const assignmentId = 'frontend-beginner-7';
    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      console.log('❌ Assignment not found:', assignmentId);
      process.exit(1);
    }

    let updated = 0;
    assignment.questions = assignment.questions.map(q => {
      // All correct answers are the second option (index 1)
      if (typeof q.correctAnswer !== 'number') {
        q.correctAnswer = 1;
        updated++;
      }
      return q;
    });

    await assignment.save();
    console.log(`✅ Patched ${updated} questions with correctAnswer=1 for ${assignmentId}`);

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error patching assignment:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();