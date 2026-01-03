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

const ASSIGNMENT_ID = 'networking-beginner-3';

const topic15 = {
  topicId: 'iptables-logging',
  title: 'Using IPTables Logging for Security Monitoring',
  content: 'Use iptables LOG target to capture firewall hits for audit and intrusion detection.',
  explanation: [
    'IPTables logging helps detect unwanted traffic, scan attempts, and firewall hits. Logging rules capture packet details such as source IP, protocol, and port. This is useful for security audits and intrusion detection.',
    'Admins analyze logs for repeated patterns, blocked connections, and suspicious behavior. Combined with syslog or SIEM tools, IPTables logs provide visibility into firewall activities and help identify potential attacks.'
  ].join('\n\n'),
  examples: [
    'iptables -A INPUT -p tcp --dport 22 -j LOG --log-prefix "SSH ATTEMPT: "',
    'grep "SSH ATTEMPT" /var/log/syslog',
    'iptables -L -n --line-numbers'
  ]
};

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if(!doc){
      throw new Error(`Assignment '${ASSIGNMENT_ID}' not found`);
    }

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byId = new Map(existing.map(t => [t.topicId, t]));

    // Merge topic 15 (idempotent)
    byId.set(topic15.topicId, { ...byId.get(topic15.topicId), ...topic15 });

    // Preserve original order for existing topics; append new ones at the end
    const merged = existing.map(t => byId.get(t.topicId) || t);
    if(!existing.find(t => t.topicId === topic15.topicId)){
      merged.push(byId.get(topic15.topicId));
    }

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Updated '${ASSIGNMENT_ID}' with Topic 15`);
    console.log(`  Total topics: ${result.topics?.length || 0}`);
    (result.topics || []).forEach((t, i) => {
      console.log(`    [${i+1}] ${t.title} | id=${t.topicId} | cmds=${(t.examples||[]).length}`);
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