require('dotenv').config();
const mongoose = require('mongoose');
const AssignmentAttempt = require('../models/AssignmentAttempt');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const assignmentId = 'frontend-beginner-7';
    const attempts = await AssignmentAttempt.find({ assignmentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!attempts || attempts.length === 0) {
      console.log('ℹ️ No attempts found for assignment:', assignmentId);
    } else {
      console.log(`\n📚 Found ${attempts.length} recent attempts for ${assignmentId}:`);
      attempts.forEach((a, idx) => {
        console.log(`\n#${idx+1} ${a.studentEmail || 'unknown'} | score ${a.score}/${a.totalQuestions} | ${a.percentage}% | passed=${a.passed}`);
        (a.answers || []).forEach(ans => {
          console.log(`  Q${ans.questionId}: selected=${ans.selectedAnswer}, correct=${ans.isCorrect}`);
        });
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inspecting attempts:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();