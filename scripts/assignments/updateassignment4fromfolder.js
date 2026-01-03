/*
 * Update Assignment 4 — UI/UX Fundamentals topics by loading JSON files
 * from data/assignment4_topics/*.json and updating assignmentId
 * 'frontend-intermediate-4'. Applies upsert if assignment does not exist.
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Assignment = require(path.join(__dirname, '..', 'models', 'Assignment.js'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';

function readTopicsFromDir(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Topics directory not found: ${dir}`);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().startsWith('topic') && f.toLowerCase().endsWith('.json'))
    .sort((a, b) => {
      const ai = parseInt(a.replace(/[^0-9]/g, ''), 10);
      const bi = parseInt(b.replace(/[^0-9]/g, ''), 10);
      return ai - bi;
    });
  const topics = files.map((file) => {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, 'utf-8');
    const obj = JSON.parse(raw);
    // Ensure minimal shape
    return {
      id: obj.id,
      title: obj.title,
      content: Array.isArray(obj.content)
        ? obj.content.join('\n\n')
        : String(obj.content || ''),
    };
  });
  return topics;
}

(async () => {
  try {
    console.log(`[Start] Connecting to ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[DB] Connected.');

    const topicsDir = path.join(__dirname, '..', 'data', 'assignment4_topics');
    const topics = readTopicsFromDir(topicsDir);
    console.log(`[Load] Topics loaded: ${topics.length}`);
    topics.forEach((t) => {
      const len = (t.content || '').length;
      console.log(`  [${t.id}] ${t.title} | contentLength=${len}`);
    });

    const assignmentId = 'frontend-intermediate-4';
    const title = 'Assignment 4 — UI/UX Fundamentals Every Frontend Engineer Must Know';

    const result = await Assignment.findOneAndUpdate(
      { assignmentId },
      {
        $set: {
          title,
          topics,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[Update] assignmentId=${assignmentId} topics=${result.topics?.length || 0}`);
    console.log('✅ Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[DB] Disconnected.');
  }
})();