require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const assignment = await Assignment.findOne({ assignmentId: 'frontend-beginner-7' }).lean();

    const answers = {};
    (assignment.questions || []).forEach(q => { answers[q.questionId] = 1; });

    let correct = 0;
    const detailed = [];
    for (const q of assignment.questions) {
      const selected = Number(answers[q.questionId]);
      const normalizedCorrect = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer);
      const isCorrect = Number.isInteger(selected) && Number.isInteger(normalizedCorrect) && selected === normalizedCorrect;
      if (isCorrect) correct++;
      detailed.push({ id: q.questionId, selected, normalizedCorrect, isCorrect });
    }

    console.log('Score:', correct, '/', assignment.questions.length);
    console.log('Details:', detailed);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();