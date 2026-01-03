/*
Patch topic 15 for assignment 'frontend-intermediate-2' in the 'nw_it' database.
Merges by topicId: updates if exists, adds if missing. Preserves existing topic order and appends topic 15.
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-2';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const topic15 = {
  topicId: 'git-team-best-practices',
  title: 'Best Practices for Git & Team Collaboration',
  content: `Best practices include writing meaningful commits, updating branches frequently, reviewing code thoroughly, and writing descriptive PRs. Teams follow naming conventions and maintain clean histories.

Main use: stable and predictable development. These practices prevent conflicts, maintain quality, and ensure everyone works smoothly.

Importance: essential in professional environments. Major use: scaling development across teams. Advantages include better productivity, fewer bugs, and cleaner codebases.`
};

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byId = new Map(existing.map(t => [t.topicId || t.id || t.title, t]));

    // Upsert topic 15
    const key = topic15.topicId;
    if (byId.has(key)) {
      const cur = byId.get(key);
      cur.title = topic15.title;
      cur.content = topic15.content;
    } else {
      byId.set(key, { topicId: topic15.topicId, title: topic15.title, content: topic15.content });
    }

    // Preserve order: keep existing as-is, then append topic 15 if not already present
    const ordered = [];
    const firstIds = (existing.map(t => t.topicId)).filter(Boolean);
    firstIds.forEach(id => { const v = byId.get(id); if (v) ordered.push(v); });
    const v15 = byId.get(topic15.topicId);
    if (v15 && !ordered.find(x => (x.topicId||x.id) === topic15.topicId)) ordered.push(v15);

    const res = await Assignment.updateOne({ assignmentId: ASSIGNMENT_ID }, { $set: { topics: ordered } });
    console.log('Update result:', res);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const count = (after.topics || []).length;
    console.log(`✅ Topics updated. Count=${count}`);
    (after.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId || 'n/a'} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 2 topic 15:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();