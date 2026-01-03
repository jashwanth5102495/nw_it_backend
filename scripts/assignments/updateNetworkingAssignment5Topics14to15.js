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

const ASSIGNMENT_ID = 'networking-beginner-5';

const newTopics = [
  {
    topicId: 'vpn-tunnels',
    title: 'VPN Tunnels (IPSec, OpenVPN, WireGuard)',
    content: 'Create encrypted tunnels with IPSec, OpenVPN, and WireGuard to protect data in transit.',
    explanation: [
      'VPNs create encrypted tunnels between devices, protecting data from interception. IPSec is used extensively in enterprise and site-to-site configurations. OpenVPN provides flexible SSL-based tunneling and is widely deployed. WireGuard is a modern VPN protocol known for speed, simplicity, and high security.',
      'Understanding VPN behavior helps diagnose tunneling issues like MTU mismatch, routing conflicts, or DNS leaks. Administrators must ensure proper encryption settings and firewall rules to avoid exposing internal networks.'
    ].join('\n\n'),
    examples: [
      'wg',
      'wg show',
      'openvpn --config client.ovpn',
      'ipsec status'
    ]
  },
  {
    topicId: 'network-config-backups',
    title: 'Network Configuration Backups & Restore (rsync, scp, tar)',
    content: 'Back up and restore critical configs using rsync, scp, and tar to support DR and maintenance.',
    explanation: [
      'Backing up network configurations is a critical part of disaster recovery and system maintenance. Tools like rsync and scp allow secure copying of configuration files to backup servers. Tar archives entire directories, making it easy to store and restore configurations after system failures or migrations.',
      'Administrators rely on regular backups to preserve router settings, firewall rules, dhcp/dns configs, and system files. Automated backups reduce downtime, prevent data loss, and simplify server rebuilding.'
    ].join('\n\n'),
    examples: [
      'rsync -av /etc/ /backup/etc/',
      'scp /etc/ssh/sshd_config user@server:/backup/',
      'tar -czvf backup.tar.gz /etc/network'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if(!doc){
      throw new Error(`Assignment '${ASSIGNMENT_ID}' not found`);
    }

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const merged = [...existing];

    for(const t of newTopics){
      const idx = merged.findIndex(x => x.topicId === t.topicId);
      if(idx >= 0){
        merged[idx] = { ...merged[idx], ...t };
      } else {
        merged.push(t);
      }
    }

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Merged topics 14–15 into '${ASSIGNMENT_ID}'`);
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