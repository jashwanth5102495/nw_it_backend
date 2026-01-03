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
const NEW_DESCRIPTION = 'Core ops topics: throughput, processes/CPU/disk, open ports, logs, cron, bash, plus nethogs, MTU, ethtool, iftop, tcpdump, and pmacct.';

// Titles to remove (case-insensitive match)
const REMOVE_TITLES = new Set([
  'Intro to Nmap',
  'Scan Types',
  'Host Discovery',
  'Port States',
  'Service/Version Detection',
  'OS Detection',
  'Timing & Performance',
  'Output Formats',
  'NSE Scripts Basics',
  'Safe Scanning Practices',
  'Firewall/IDS Evasion',
  'IPv6 Scanning',
  'Top Ports vs Full Scans',
  'Privileged vs Unprivileged',
  'Interpreting Results',
]);

function shouldRemove(topic){
  const title = (topic.title || '').trim().toLowerCase();
  // remove exact titles listed
  for(const t of REMOVE_TITLES){
    if(title === t.toLowerCase()) return true;
  }
  // also remove anything clearly nmap-tagged by id/title
  const idStr = (topic.topicId || topic.id || '').toString().toLowerCase();
  if(idStr.includes('nmap')) return true;
  if(title.includes('nmap')) return true;
  return false;
}

async function run(){
  try{
    console.log('[INFO] Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if(!doc){
      throw new Error(`Assignment not found: ${ASSIGNMENT_ID}`);
    }

    const topics = Array.isArray(doc.topics) ? doc.topics : [];
    const beforeCount = topics.length;
    const kept = topics.filter(t => !shouldRemove(t));
    const removed = beforeCount - kept.length;

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { title: NEW_TITLE, description: NEW_DESCRIPTION, topics: kept, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Cleaned '${ASSIGNMENT_ID}'`);
    console.log(`   Removed topics: ${removed}`);
    console.log(`   Remaining topics: ${result.topics?.length || 0}`);
    (result.topics || []).slice(0, 20).forEach((t, i) => {
      console.log(`   [${i+1}] ${t.title} | id=${t.topicId}`);
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