require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

function splitContentIntoExplanationAndCommands(text) {
  if (!text) return { explanation: '', content: '' };
  const marker = 'Practical Commands';
  const idx = text.indexOf(marker);
  if (idx === -1) {
    // If there is an "Explanation" header, strip it into explanation
    const cleaned = text.replace(/^Explanation\s*/i, '').trim();
    return { explanation: cleaned, content: '' };
  }
  const before = text.slice(0, idx).replace(/^Explanation\s*/i, '').trim();
  const after = text.slice(idx + marker.length).trim();
  // Rebuild content: keep commands with the heading
  const content = [marker, after].join('\n\n').trim();
  return { explanation: before, content };
}

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = 'networking-beginner-1';
    const doc = await Assignment.findOne({ assignmentId });
    if (!doc) throw new Error(`Assignment not found: ${assignmentId}`);

    const topics = Array.isArray(doc.topics) ? doc.topics : [];
    if (topics.length < 7) throw new Error(`Expected at least 7 topics, found ${topics.length}`);

    for (let i = 0; i < 7; i++) {
      const t = topics[i] || {};
      const { explanation, content } = splitContentIntoExplanationAndCommands(t.content || '');
      t.explanation = explanation;
      t.content = content || t.content || '';
      topics[i] = t;
    }

    doc.topics = topics;
    doc.updatedAt = new Date();
    await doc.save();

    console.log(`✅ Added explanation fields for first 7 topics of '${assignmentId}'.`);
    for (let i = 0; i < 7; i++) {
      const t = doc.topics[i];
      console.log(`  [${i + 1}] ${t.title} | explLen=${(t.explanation || '').length} | contentLen=${(t.content || '').length}`);
    }

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding explanations:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();