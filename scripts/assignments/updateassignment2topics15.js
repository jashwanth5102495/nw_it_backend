/*
Patch topic 15 for assignment 'frontend-intermediate-2' in the 'nw_it' database.
Adds or updates the topic: 'Best Practices for Git & Team Collaboration'.
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-2';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  topics: [ { topicId: String, title: String, content: String } ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const topic15 = {
  topicId: 'git-best-practices',
  title: 'Best Practices for Git & Team Collaboration',
  content: `Effective Git usage requires consistent habits and team conventions. Use clear, concise commit messages written in the imperative mood (e.g., "Add login validation"). Keep commits small and focused; avoid bundling unrelated changes.

Adopt a branching strategy (Git Flow or GitHub Flow) and enforce PR reviews. Sync often with the remote to minimize conflicts and rebase feature branches for a tidy history when appropriate. Protect main branches with required reviews and CI checks.

Encourage code owners, descriptive PR titles, and checklists. Use issues with labels and milestones to plan work. Automate with CI (lint, tests) and keep the repository clean: remove dead branches and archive stale issues.

Recommended Practices:

- Write atomic commits with meaningful messages
- Pull/rebase frequently; avoid long-lived un-synced branches
- Use feature branches and PR reviews for all changes
- Protect main with required status checks
- Use Issues, Labels, and Projects for planning
- Keep .gitignore accurate; avoid committing secrets
- Document workflows in CONTRIBUTING.md`
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
    const idx = existing.findIndex(t => (t.topicId === topic15.topicId));
    if (idx >= 0) {
      existing[idx].title = topic15.title;
      existing[idx].content = topic15.content;
    } else {
      existing.push(topic15);
    }

    const res = await Assignment.updateOne({ assignmentId: ASSIGNMENT_ID }, { $set: { topics: existing } });
    console.log('Update result:', res);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const count = (after.topics || []).length;
    console.log(`✅ Topic 15 applied. Count=${count}`);
    (after.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId || 'n/a'} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating topic 15:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();