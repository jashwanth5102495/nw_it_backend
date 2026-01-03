require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentUpdateInt6', assignmentSchema, 'assignments');

const topics = [
  {
    topicId: 'network-monitoring-fundamentals',
    title: 'Network Monitoring Fundamentals',
    content: 'Network monitoring is the continuous observation of network performance, availability, and reliability. In enterprise environments, monitoring ensures that services remain operational and performance issues are detected before users are impacted.\n\nLinux-based monitoring tools collect metrics such as bandwidth usage, latency, packet loss, and device availability. Monitoring helps administrators identify failures, capacity issues, and security threats early.\n\nWithout proper monitoring, networks become reactive instead of proactive, leading to downtime and poor user experience.'
  },
  {
    topicId: 'active-vs-passive-monitoring',
    title: 'Active vs Passive Monitoring',
    content: 'Active monitoring involves sending test traffic (such as pings or probes) to measure network health. Passive monitoring observes existing traffic without generating additional packets.\n\nActive monitoring is useful for availability checks, while passive monitoring provides insight into real user behavior. Enterprises typically use a combination of both for complete visibility.\n\nLinux supports both approaches through a wide range of tools and protocols.'
  },
  {
    topicId: 'snmp-architecture-and-operation',
    title: 'SNMP Architecture and Operation',
    content: 'SNMP (Simple Network Management Protocol) is a widely used protocol for monitoring network devices.\n\nIt works using managers, agents, and Management Information Bases (MIBs). Linux systems can act as both SNMP managers and agents, making them central components in monitoring systems.\n\nSNMP allows centralized visibility into routers, switches, servers, and applications.'
  },
  {
    topicId: 'snmp-security-considerations',
    title: 'SNMP Security Considerations',
    content: 'Early SNMP versions lacked encryption and strong authentication. Modern deployments use SNMPv3, which provides authentication, integrity, and encryption.\n\nSecuring SNMP is critical in enterprises to prevent unauthorized access and information leakage.\n\nLinux administrators must carefully configure SNMP access controls and credentials.'
  },
  {
    topicId: 'centralized-monitoring-systems',
    title: 'Centralized Monitoring Systems',
    content: 'Centralized monitoring systems collect data from multiple devices into a single dashboard.\n\nThis approach simplifies management, troubleshooting, and reporting. Linux-based tools are often used as the monitoring core due to scalability and flexibility.\n\nCentralization is essential for large enterprise networks with hundreds or thousands of devices.'
  },
  {
    topicId: 'nagios-monitoring-architecture',
    title: 'Nagios Monitoring Architecture',
    content: 'Nagios is a powerful open-source monitoring system used to monitor hosts, services, and network devices.\n\nIt uses plugins to perform checks and triggers alerts when thresholds are exceeded. Nagios is highly customizable and widely used in enterprises.\n\nLinux is the primary platform for Nagios deployments.'
  },
  {
    topicId: 'zabbix-monitoring-and-alerting',
    title: 'Zabbix Monitoring and Alerting',
    content: 'Zabbix provides integrated monitoring, visualization, and alerting in a single platform.\n\nUnlike plugin-based tools, Zabbix uses agents and templates for automated monitoring. It supports real-time graphs, dashboards, and advanced alerting logic.\n\nZabbix is suitable for modern enterprise environments requiring automation and scalability.'
  },
  {
    topicId: 'alerting-strategies-and-escalation-policies',
    title: 'Alerting Strategies and Escalation Policies',
    content: 'Alerting ensures administrators are notified when issues occur.\n\nEffective alerting avoids false positives and alert fatigue. Escalation policies ensure unresolved issues are automatically forwarded to higher-level teams.\n\nLinux monitoring tools support flexible alerting and notification mechanisms.'
  },
  {
    topicId: 'syslog-architecture',
    title: 'Syslog Architecture',
    content: 'Syslog is the standard logging protocol used by Linux and network devices.\n\nIt collects logs related to system events, security incidents, and application activity. Centralized syslog servers simplify troubleshooting and auditing.\n\nProper syslog design is essential for enterprise visibility.'
  },
  {
    topicId: 'log-rotation-and-retention-policies',
    title: 'Log Rotation and Retention Policies',
    content: 'Logs grow rapidly in enterprise environments. Log rotation prevents disk space exhaustion by archiving and deleting old logs.\n\nRetention policies define how long logs are stored for compliance and forensic analysis.\n\nLinux provides automated tools to manage log rotation efficiently.'
  },
  {
    topicId: 'bandwidth-monitoring-fundamentals',
    title: 'Bandwidth Monitoring Fundamentals',
    content: 'Bandwidth monitoring tracks how much data is transmitted and received on network interfaces.\n\nUnderstanding bandwidth usage helps detect congestion, abuse, and capacity planning needs.\n\nLinux offers lightweight and powerful tools for real-time bandwidth monitoring.'
  },
  {
    topicId: 'real-time-network-monitoring-tools',
    title: 'Real-Time Network Monitoring Tools',
    content: 'Tools like iftop, nload, and bmon provide live views of network traffic.\n\nThese tools help administrators identify top talkers, abnormal traffic patterns, and performance issues in real time.\n\nThey are essential for quick diagnostics during incidents.'
  },
  {
    topicId: 'system-performance-monitoring',
    title: 'System Performance Monitoring',
    content: 'Network performance is closely tied to system resources like CPU, memory, and disk I/O.\n\nLinux tools such as htop and vmstat help correlate network issues with system performance problems.\n\nHolistic monitoring ensures accurate root cause analysis.'
  },
  {
    topicId: 'network-baseline-creation',
    title: 'Network Baseline Creation',
    content: 'A network baseline defines what “normal” performance looks like.\n\nBaselines are used to detect anomalies and deviations that may indicate failures or attacks.\n\nLinux monitoring tools help establish and maintain accurate baselines.'
  },
  {
    topicId: 'anomaly-detection-and-troubleshooting',
    title: 'Anomaly Detection and Troubleshooting',
    content: 'Anomaly detection identifies unusual patterns in network behavior.\n\nEarly detection allows faster response to security incidents and performance degradation.\n\nLinux-based monitoring systems play a crucial role in enterprise troubleshooting workflows.'
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics, updatedAt: new Date() } }
    );
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const topicsLen = Array.isArray(after.topics) ? after.topics.length : 0;
    console.log(`✅ Updated topics for ${ASSIGNMENT_ID}. Topics: ${topicsLen}`);
    (after.topics || []).slice(0, 5).forEach((t, i) => console.log(`  [${i+1}] ${t.title} | id=${t.topicId}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();