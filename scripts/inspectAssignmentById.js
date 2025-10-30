require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = process.argv[2] || 'frontend-beginner-6';
    console.log('Inspecting assignmentId:', assignmentId);

    const assignment = await Assignment.findOne({ assignmentId }).lean();
    if (!assignment) {
      console.log('❌ Assignment not found:', assignmentId);
      process.exit(1);
    }

    console.log(`\n📘 ${assignment.title} (${assignment.assignmentId})`);
    (assignment.questions || []).forEach((q) => {
      console.log(`\nQ${q.questionId}: ${q.prompt}`);
      (q.options || []).forEach((opt, idx) => {
        console.log(`  [${idx}] ${opt}`);
      });
      const hasCorrect = typeof q.correctAnswer === 'number';
      console.log('  correctAnswer:', hasCorrect ? q.correctAnswer : 'none');
    });

    const total = assignment.questions?.length || 0;
    const withCorrect = (assignment.questions || []).filter(q => typeof q.correctAnswer === 'number').length;
    const withoutCorrect = total - withCorrect;
    console.log(`\n📊 Correct answer presence: { total: ${total}, withCorrect: ${withCorrect}, withoutCorrect: ${withoutCorrect} }`);

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inspecting assignment:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();