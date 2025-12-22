require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-3';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const newTopics = [
  {
    topicId: 'vrrp-ha',
    title: 'High Availability with VRRP',
    explanation: (
      'VRRP (Virtual Router Redundancy Protocol) allows multiple routers to share a virtual IP address. One router acts as the master, while others remain in standby mode.\n\n'
      + 'If the master router fails, a backup router automatically takes over, ensuring continuous gateway availability for clients.\n\n'
      + 'In Linux, VRRP is commonly implemented using tools like Keepalived and is critical in HA gateway designs.'
    )
  },
  {
    topicId: 'keepalived-health-checks',
    title: 'Keepalived and Health Checks',
    explanation: (
      'Keepalived monitors network services and interfaces and triggers failover actions when problems are detected.\n\n'
      + 'It uses VRRP and custom health check scripts to ensure that not only the interface but also the application is functioning correctly.\n\n'
      + 'This makes Keepalived suitable for HA load balancers, reverse proxies, and gateway systems.'
    )
  },
  {
    topicId: 'ha-load-balancers',
    title: 'High Availability Load Balancers',
    explanation: (
      'HA load balancers distribute traffic across multiple backend servers while ensuring availability if one backend fails.\n\n'
      + 'Linux-based load balancers often use HAProxy or Nginx combined with VRRP for redundancy.\n\n'
      + 'These setups are widely used in web hosting, microservices architectures, and cloud-native platforms.'
    )
  },
  {
    topicId: 'failover-vs-failback',
    title: 'Failover vs Failback Strategies',
    explanation: (
      'Failover refers to switching to a backup system during failure, while failback is the process of returning to the primary system once it is restored.\n\n'
      + 'Automatic failback may not always be desirable, as it can cause instability if the primary system is not fully healthy.\n\n'
      + 'Understanding when and how to implement failback is crucial for stable HA environments.'
    )
  },
  {
    topicId: 'split-brain-scenarios',
    title: 'Split-Brain Scenarios in HA Networks',
    explanation: (
      'A split-brain scenario occurs when multiple nodes believe they are the active system due to communication failure.\n\n'
      + 'This can cause data corruption, routing conflicts, or service duplication. Proper quorum mechanisms and monitoring prevent split-brain conditions.\n\n'
      + 'Linux HA solutions often include safeguards to ensure only one active node exists at a time.'
    )
  },
  {
    topicId: 'enterprise-ha-architecture',
    title: 'Designing an Enterprise HA Network Architecture',
    explanation: (
      'Designing an HA network requires balancing cost, complexity, and reliability. It involves choosing appropriate redundancy levels, monitoring strategies, and failover mechanisms.\n\n'
      + 'Linux offers powerful tools to build enterprise-grade HA networks, but careful planning is essential to avoid misconfiguration.\n\n'
      + 'A well-designed HA architecture ensures maximum uptime, predictable performance, and long-term scalability.'
    )
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!before) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const existing = Array.isArray(before.topics) ? before.topics : [];
    const existingIds = new Set(existing.map(t => String(t.topicId)));
    const toAppend = newTopics.filter(t => !existingIds.has(String(t.topicId)));

    const merged = [...existing, ...toAppend];

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } }
    );

    console.log('Before:', { topics: existing.length });
    console.log('Append candidates:', toAppend.length);
    console.log('Update result:', { matched: res.matchedCount, modified: res.modifiedCount });

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const afterTopics = Array.isArray(after.topics) ? after.topics : [];
    console.log('After:', { topics: afterTopics.length });
    afterTopics.forEach((t, i) => console.log(`  [${i+1}] ${t.title}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Append failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();