require('dotenv').config();
const mongoose = require('mongoose');

const SourceAssignmentSchema = require('../models/Assignment').schema;
const TargetAssignmentSchema = require('../models/Assignment').schema;

async function connect(uri) {
  return mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

(async () => {
  const assignmentId = process.argv[2] || 'frontend-intermediate-1';
  const sourceURI = process.env.SOURCE_MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
  const targetURI = process.env.TARGET_MONGODB_URI || 'mongodb://localhost:27017/nw_it';

  console.log(`🔗 Source: ${sourceURI}`);
  console.log(`🔗 Target: ${targetURI}`);
  console.log(`🧭 AssignmentId: ${assignmentId}`);

  let sourceConn, targetConn;
  try {
    sourceConn = await connect(sourceURI);
    targetConn = await connect(targetURI);

    const SourceAssignment = sourceConn.model('Assignment', SourceAssignmentSchema, 'assignments');
    const TargetAssignment = targetConn.model('Assignment', TargetAssignmentSchema, 'assignments');

    const sourceAssignment = await SourceAssignment.findOne({ assignmentId }).lean();
    if (!sourceAssignment) {
      console.error(`❌ Source assignment not found for id: ${assignmentId}`);
      process.exit(1);
    }

    const targetAssignment = await TargetAssignment.findOne({ assignmentId }).lean();
    if (!targetAssignment) {
      console.error(`❌ Target assignment not found for id: ${assignmentId}`);
      process.exit(1);
    }

    const srcTopics = sourceAssignment.topics || [];
    const tgtTopics = targetAssignment.topics || [];

    console.log(`📚 Topics count — source: ${srcTopics.length}, target: ${tgtTopics.length}`);

    srcTopics.forEach((t, i) => {
      const srcLen = (t?.content || '').length;
      const tgtLen = ((tgtTopics[i] && tgtTopics[i].content) ? tgtTopics[i].content.length : 0);
      console.log(`  [${i+1}] ${t.title} | src=${srcLen} tgt=${tgtLen}`);
    });

    const res = await TargetAssignment.updateOne(
      { assignmentId },
      { $set: { topics: srcTopics } }
    );

    console.log(`✅ Update acknowledged: matched=${res.matchedCount} modified=${res.modifiedCount}`);

    const verify = await TargetAssignment.findOne({ assignmentId }).lean();
    console.log('🔎 Verification (post-update):');
    (verify.topics || []).forEach((t, i) => {
      console.log(`  [${i+1}] ${t.title} | len=${(t.content || '').length}`);
    });

    await sourceConn.close();
    await targetConn.close();
    console.log('✅ Migration complete.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration error:', e);
    try { if (sourceConn) await sourceConn.close(); } catch {}
    try { if (targetConn) await targetConn.close(); } catch {}
    process.exit(1);
  }
})();