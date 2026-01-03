require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const newTopics = [
  {
    topicId: 'detecting-firewall-rule-conflicts',
    title: 'Detecting Firewall Rule Conflicts',
    content: 'Firewall rule conflicts occur when multiple rules contradict each other. This can lead to unexpected behavior, such as blocked legitimate traffic or exposed services. Detecting conflicts requires careful rule analysis, logging, and testing. Documentation and structured rule design reduce the risk of conflicts. Conflict detection is essential for maintaining predictable and secure firewall behavior.'
  },
  {
    topicId: 'logging-strategies-security-events',
    title: 'Logging Strategies for Security Events',
    content: 'Firewall logging records important security events such as dropped packets, denied connections, and suspicious traffic patterns. Effective logging helps in monitoring, troubleshooting, and forensic analysis. However, excessive logging can impact performance and generate noise. Proper logging strategies balance visibility and efficiency. Security teams rely on firewall logs for threat detection and compliance audits.'
  },
  {
    topicId: 'firewall-hardening-best-practices',
    title: 'Firewall Hardening Best Practices',
    content: 'Firewall hardening involves configuring firewalls with least-privilege principles, strong defaults, and minimal exposure. This includes denying all traffic by default and explicitly allowing only required services. Hardening also involves disabling unused protocols, applying rate limits, and enforcing strict logging and monitoring. A hardened firewall significantly reduces attack surface and improves overall network security posture.'
  },
  {
    topicId: 'automated-firewall-rule-updates',
    title: 'Automated Firewall Rule Updates',
    content: 'Automated firewall updates allow systems to adapt to changing threats without manual intervention. This includes updating IP blocklists, modifying rules based on alerts, or responding to intrusion detection systems. Automation improves response time and reduces human error. However, it must be carefully designed to avoid unintended outages. Automated firewalls are common in modern DevOps and cloud environments.'
  },
  {
    topicId: 'real-time-firewall-monitoring',
    title: 'Real-Time Firewall Monitoring',
    content: 'Real-time monitoring provides continuous visibility into firewall activity. Administrators can observe traffic patterns, detect attacks, and respond quickly to incidents. Monitoring tools display connection states, rule hits, dropped packets, and anomalies. Real-time insights are essential for proactive security management. Effective monitoring transforms firewalls from static defenses into active security components.'
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Confirm document exists and current counts
    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!before) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }
    console.log('Before append:', {
      topics: Array.isArray(before.topics) ? before.topics.length : 0,
      questions: Array.isArray(before.questions) ? before.questions.length : 0,
      passingPercentage: before.passingPercentage
    });

    // Append topics 11–15 atomically
    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $push: { topics: { $each: newTopics } } }
    );

    console.log('Append result:', { matched: res.matchedCount, modified: res.modifiedCount });

    // Verify
    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After append:', {
      topics: Array.isArray(after.topics) ? after.topics.length : 0,
      topicTitles: Array.isArray(after.topics) ? after.topics.slice(-5).map(t => t.title).join(' | ') : '',
      questions: Array.isArray(after.questions) ? after.questions.length : 0,
      passingPercentage: after.passingPercentage,
      title: after.title
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Append failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();