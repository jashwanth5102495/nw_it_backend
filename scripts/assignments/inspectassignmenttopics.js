require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = process.argv[2] || 'frontend-intermediate-1';
    console.log('Inspecting topics for assignmentId:', assignmentId);

    const assignment = await Assignment.findOne({ assignmentId }).lean();
    if (!assignment) {
      console.log('❌ Assignment not found:', assignmentId);
      process.exit(1);
    }

    const topics = assignment.topics || [];
    console.log(`\n📚 Topics (${topics.length}):`);
    topics.forEach((t, idx) => {
      const content = (t.content || '').trim();
      const contentPreview = content.slice(0, 140).replace(/\n/g, ' ');
      console.log(`\n${idx + 1}. ${t.title || t.topic || t.topicId}`);
      console.log(`   id: ${t.topicId || 'n/a'}`);
      console.log(`   contentLength: ${content.length}`);
      console.log(`   preview: ${contentPreview || '[empty]'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inspecting assignment topics:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();