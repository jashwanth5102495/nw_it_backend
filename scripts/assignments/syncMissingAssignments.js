require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Assignment = require('../../models/Assignment');

// Helper to ensure topics length
function ensureMinTopics(assignment) {
  const MIN_TOPICS = 15;
  const topics = Array.isArray(assignment.topics) ? assignment.topics : [];
  if (topics.length >= MIN_TOPICS) return assignment;
  return { ...assignment, topics: [...topics] };
}

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    console.log(`[Start] Connecting to ${uri}`);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const jsonPath = path.join(__dirname, '..', 'data', 'assignmentSeedData.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    const existing = await Assignment.find({}, 'assignmentId').lean();
    const existingIds = new Set(existing.map(a => a.assignmentId));
    const missing = data.filter(a => !existingIds.has(a.assignmentId));

    if (missing.length === 0) {
      console.log('📚 No missing assignments to insert.');
    } else {
      const preparedMissing = missing.map(ensureMinTopics);
      const inserted = await Assignment.insertMany(preparedMissing);
      console.log(`✅ Inserted ${inserted.length} missing assignments`);
      inserted.forEach(a => console.log(`  • Added ${a.assignmentId} | ${a.title}`));
    }

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();