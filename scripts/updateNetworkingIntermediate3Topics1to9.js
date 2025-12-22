require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-3';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const NEW_TITLE = 'Assignment 3: High Availability Networking';
const NEW_DESCRIPTION = 'Design HA networking with redundancy, bonding, LACP, bridges, and rapid failover.';

const topics = [
  {
    topicId: 'ha-fundamentals',
    title: 'High Availability (HA) Networking Fundamentals',
    explanation: (
      'High Availability networking is a design approach focused on minimizing downtime and service disruption by eliminating single points of failure. In Linux environments, HA networking ensures that even if a network interface, switch, router, or server fails, traffic continues to flow without manual intervention.\n\n'
      + 'HA networking relies on redundancy, monitoring, automatic failover, and fast recovery. Redundancy means having multiple network paths or devices performing the same role. Monitoring continuously checks the health of links and services. Failover mechanisms automatically switch traffic to a healthy path when a failure is detected.\n\n'
      + 'Linux is widely used for HA networking because of its flexibility, mature kernel networking stack, and support for advanced features such as bonding, bridging, routing protocols, and heartbeat-based monitoring tools. HA is critical in data centers, cloud platforms, financial systems, and enterprise applications where even seconds of downtime can cause major losses.'
    )
  },
  {
    topicId: 'redundancy-vs-fault-tolerance',
    title: 'Redundancy vs Fault Tolerance in Networks',
    explanation: (
      'Redundancy and fault tolerance are related but not identical concepts. Redundancy means having backup components, such as multiple NICs or switches. Fault tolerance means the system continues operating correctly even when a failure occurs.\n\n'
      + 'A redundant network without proper failover logic may still experience downtime if traffic is not automatically redirected. Fault-tolerant systems combine redundancy with intelligent detection and automatic switching mechanisms.\n\n'
      + 'In Linux, fault tolerance is achieved through technologies like NIC bonding, dynamic routing protocols, VRRP, and health checks. Understanding this distinction is crucial when designing enterprise-grade networks, as simply adding more hardware does not guarantee high availability.'
    )
  },
  {
    topicId: 'linux-nic-bonding-overview',
    title: 'Linux NIC Bonding Overview',
    explanation: (
      'NIC bonding allows multiple network interfaces to be combined into a single logical interface. This provides link redundancy, load balancing, or both, depending on the bonding mode used.\n\n'
      + "From the operating system’s perspective, the bonded interface appears as one device, simplifying configuration for applications and services. Bonding improves availability by allowing traffic to continue even if one physical NIC fails.\n\n"
      + 'Linux bonding operates at the kernel level and supports multiple modes such as active-backup, round-robin, XOR, broadcast, and LACP. Each mode serves different HA and performance requirements.'
    )
  },
  {
    topicId: 'active-backup-bonding',
    title: 'Active-Backup Bonding Mode',
    explanation: (
      'Active-backup is the most commonly used bonding mode for high availability. In this mode, only one interface actively carries traffic, while the others remain on standby.\n\n'
      + 'If the active interface fails, one of the backup interfaces automatically takes over, typically within milliseconds. This ensures uninterrupted network connectivity without requiring switch-side configuration.\n\n'
      + 'Active-backup is ideal for environments where simplicity and reliability are more important than throughput. It is widely used in servers requiring guaranteed uptime, such as authentication servers, monitoring systems, and management networks.'
    )
  },
  {
    topicId: 'load-balancing-bonding-modes',
    title: 'Load Balancing Bonding Modes',
    explanation: (
      'Load balancing bonding modes distribute network traffic across multiple interfaces to improve throughput and reduce congestion. Examples include round-robin and XOR modes.\n\n'
      + 'These modes not only provide redundancy but also maximize bandwidth utilization. However, they often require compatible switch configurations to function correctly.\n\n'
      + 'Load balancing is useful in high-traffic environments like file servers, database clusters, and virtualization hosts where performance and availability are equally important.'
    )
  },
  {
    topicId: 'lacp-8023ad',
    title: 'LACP (802.3ad) Link Aggregation',
    explanation: (
      'LACP is an IEEE standard that allows dynamic negotiation between Linux systems and network switches to form link aggregation groups.\n\n'
      + 'In Linux, LACP provides both redundancy and load balancing while ensuring that only properly configured links are used. If a cable or switch port fails, traffic is automatically redistributed among remaining links.\n\n'
      + 'LACP is widely used in enterprise and data center networks because it is standardized, scalable, and compatible with managed switches.'
    )
  },
  {
    topicId: 'link-monitoring-failure-detection',
    title: 'Link Monitoring and Failure Detection',
    explanation: (
      'Effective HA networking depends on accurate detection of failures. Linux bonding supports multiple link monitoring mechanisms such as MII monitoring and ARP monitoring.\n\n'
      + 'MII monitoring checks the physical link status, while ARP monitoring verifies end-to-end connectivity by sending ARP requests. Combining both improves reliability and reduces false positives.\n\n'
      + 'Fast failure detection ensures that traffic is rerouted quickly, minimizing packet loss and service disruption.'
    )
  },
  {
    topicId: 'linux-bridge-ha',
    title: 'Linux Bridge and High Availability',
    explanation: (
      'Linux bridges connect multiple network interfaces at Layer 2, allowing traffic to pass between them as if they were part of the same switch.\n\n'
      + 'In HA setups, bridges are often combined with bonding to provide redundant uplinks for virtual machines and containers. This ensures that workloads remain accessible even if a physical interface fails.\n\n'
      + 'Bridges are fundamental in virtualization platforms like KVM and cloud environments where high availability is mandatory.'
    )
  },
  {
    topicId: 'stp-linux-bridges',
    title: 'Spanning Tree Protocol (STP) in Linux Bridges',
    explanation: (
      'STP prevents network loops by dynamically disabling redundant paths. While loops can increase availability, they can also cause broadcast storms if unmanaged.\n\n'
      + 'Linux bridges support STP to ensure safe redundancy. When a failure occurs, STP recalculates the topology and re-enables blocked paths.\n\n'
      + 'Understanding STP behavior is essential when deploying redundant Layer 2 networks to avoid instability.'
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

    console.log('Before:', { title: before.title, topics: Array.isArray(before.topics) ? before.topics.length : 0 });

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { title: NEW_TITLE, description: NEW_DESCRIPTION, topics } }
    );

    console.log('Update result:', { matched: res.matchedCount, modified: res.modifiedCount });

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After:', { title: after.title, topics: Array.isArray(after.topics) ? after.topics.length : 0 });
    (after.topics || []).forEach((t, i) => console.log(`  [${i+1}] ${t.title}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();