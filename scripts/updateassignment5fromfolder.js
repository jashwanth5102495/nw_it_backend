/*
 * Update Assignment 5 — State Management Beyond Basics topics by loading JSON files
 * from data/assignment5_topics/*.json and updating assignmentId 'frontend-intermediate-5'.
 * Merges topics by topicId: updates if exists, adds if missing. Preserves existing order.
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Assignment = require(path.join(__dirname, '..', 'models', 'Assignment.js'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-5';
const folder = path.join(__dirname, '..', 'data', 'assignment5_topics');

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    // Load JSON files
    const files = fs.existsSync(folder) ? fs.readdirSync(folder).filter(f => f.endsWith('.json')) : [];
    if (files.length === 0) {
      console.log(`❌ No topic files found in ${folder}`);
      process.exit(1);
    }

    const updates = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(folder, f), 'utf8'));
      return data;
    });

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.log(`❌ Assignment not found: ${ASSIGNMENT_ID}`);
      process.exit(1);
    }

    const existing = Array.isArray(assignment.topics) ? assignment.topics : [];

    // Build map of existing topics by topicId
    const indexById = new Map();
    existing.forEach((t, idx) => {
      if (t.topicId) indexById.set(t.topicId, idx);
      else if (t.id) indexById.set(t.id, idx);
      else if (t.title) indexById.set(t.title, idx);
    });

    // Apply updates (merge by topicId/title)
    updates.forEach(u => {
      const key = u.topicId || u.id || u.title;
      const idx = indexById.get(key);
      if (idx !== undefined) {
        // Merge fields while preserving position
        existing[idx] = {
          ...existing[idx],
          topicId: existing[idx].topicId || u.topicId,
          title: u.title || existing[idx].title,
          content: u.content || existing[idx].content,
          syntax: u.syntax ?? existing[idx].syntax,
          examples: Array.isArray(u.examples) ? u.examples : existing[idx].examples,
        };
        console.log(`🔁 Updated: ${u.title} (${key})`);
      } else {
        existing.push({
          topicId: u.topicId,
          title: u.title,
          content: u.content || '',
          syntax: u.syntax,
          examples: Array.isArray(u.examples) ? u.examples : [],
        });
        console.log(`➕ Added: ${u.title} (${key})`);
      }
    });

    assignment.topics = existing;
    await assignment.save();

    console.log(`\n✅ Assignment '${ASSIGNMENT_ID}' updated. Topics=${assignment.topics.length}`);
    assignment.topics.forEach((t, i) => {
      const len = (t.content || '').length;
      console.log(`  [${i + 1}] ${t.title} | id=${t.topicId || t.id || 'n/a'} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment from folder:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();