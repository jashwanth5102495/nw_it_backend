require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String, examples: [String], syntax: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const ASSIGNMENT_ID = 'networking-beginner-4';
const NEW_TITLE = 'Assignment 4: System Performance & Network Operations Monitoring';
const NEW_DESCRIPTION = 'Measure throughput; monitor processes/CPU/disk; inspect ports/logs; automate tasks; and use nethogs, ethtool, iftop, tcpdump, and pmacct effectively.';

// Desired order for topics 1–15 (by topicId)
const desiredOrder = [
  // 1–8 from updateNetworkingAssignment4Topics1to8.js
  'throughput-bandwidth',
  'ps-top-network-processes',
  'cpu-load-impact',
  'iostat-disk-bottlenecks',
  'ss-lsof-open-ports',
  'system-logs-network',
  'cronjobs-automation',
  'bash-network-automation',
  // 9–15 from updateNetworkingAssignment4Topics9to15.js
  'nethogs-per-process-bandwidth',
  'mtu-fragmentation',
  'ethtool-interface-monitoring',
  'iftop-realtime-bandwidth',
  'system-resource-bottlenecks-network',
  'tcpdump-lightweight-sniffing',
  'pmacct-advanced-accounting',
];

async function run(){
  try{
    console.log('[INFO] Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if(!doc){
      throw new Error(`Assignment not found: ${ASSIGNMENT_ID}`);
    }

    const existingTopics = Array.isArray(doc.topics) ? doc.topics : [];
    const mapById = new Map(existingTopics.map(t => [t.topicId || t.id || t.title, t]));

    // Build reordered list: first desiredOrder items (if present), then any remaining topics
    const reordered = [];
    for(const id of desiredOrder){
      const t = mapById.get(id);
      if(t){
        reordered.push(t);
        mapById.delete(id);
      }
    }
    // Append leftovers (keep existing relative order)
    for(const t of existingTopics){
      const key = t.topicId || t.id || t.title;
      if(mapById.has(key)){
        reordered.push(mapById.get(key));
        mapById.delete(key);
      }
    }

    // Apply title/description update and topic reorder
    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { title: NEW_TITLE, description: NEW_DESCRIPTION, topics: reordered, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Updated '${ASSIGNMENT_ID}'`);
    console.log(`   Title: ${result.title}`);
    console.log(`   Description: ${result.description?.slice(0,100)}...`);
    console.log(`   Topics: ${result.topics?.length || 0}`);
    (result.topics || []).slice(0, 15).forEach((t, i) => {
      const explLen = (t.explanation || '').length;
      const exCount = (t.examples || []).length;
      console.log(`   [${i+1}] ${t.title} | id=${t.topicId} | explanation=${explLen} chars | examples=${exCount}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error:', err?.message || err);
    try{ await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

run();