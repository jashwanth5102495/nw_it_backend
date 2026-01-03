require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const assignmentId = 'frontend-beginner-7';
    const assignment = await Assignment.findOne({ assignmentId }).lean();
    if (!assignment) {
      console.log('❌ Assignment not found:', assignmentId);
      process.exit(1);
    }

    console.log(`\n📘 Assignment: ${assignment.title} (${assignment.assignmentId})`);
    console.log(`Questions: ${assignment.questions?.length ?? 0}, Passing: ${assignment.passingPercentage}%`);

    console.log('\n🔍 Full questions and options:');
    (assignment.questions || []).forEach(q => {
      console.log(`\nQ${q.questionId}: ${(q.prompt || q.question || '').trim()}`);
      (q.options || []).forEach((opt, idx) => {
        console.log(`  [${idx}] ${opt}`);
      });
      console.log(`  correctAnswer: ${typeof q.correctAnswer === 'number' ? q.correctAnswer : 'none'}`);
    });

    const summary = (assignment.questions || []).map(q => ({
      questionId: q.questionId,
      hasCorrect: typeof q.correctAnswer === 'number',
      correctAnswer: q.correctAnswer,
      optionsLength: Array.isArray(q.options) ? q.options.length : 0,
      questionSample: (q.prompt || q.question || '').slice(0, 60)
    }));

    console.log('\n📊 Correct answer presence:', summary.reduce((acc, s) => {
      acc.total++;
      if (s.hasCorrect) acc.withCorrect++;
      else acc.withoutCorrect++;
      return acc;
    }, { total: 0, withCorrect: 0, withoutCorrect: 0 }));

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inspecting assignment:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();