require('dotenv').config({path:"../../.env"});
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignments = [
  {
    assignmentId: 'networking-intermediate-1',
    courseId: 'networking-intermediate',
    title: 'Advanced Linux Network Isolation',
    description: 'Hands-on with Linux network namespaces and isolation patterns.',
    topics: [
      { topicId: 'ns-intro', title: 'Linux Network Namespaces', content: 'Overview of network namespaces; isolation of interfaces, routes, and firewall rules.' },
      { topicId: 'veth-pairs', title: 'veth Pairs', content: 'Virtual ethernet device pairs for namespace connectivity; attaching to bridges.' },
      { topicId: 'dns-inside-ns', title: 'DNS Inside Namespaces', content: 'Configuring resolv.conf and per-namespace DNS resolution.' },
      { topicId: 'ns-firewall', title: 'Namespace Firewalling', content: 'iptables/nftables per‑namespace strategies; risks and hardening.' },
      { topicId: 'ns-routing', title: 'Per-Namespace Routing', content: 'Separate routing tables per namespace; default gateways and policies.' }
    ],
    // questions intentionally omitted on updates (seed-only)
    questions: [
      { questionId: '1', prompt: 'Network namespaces primarily isolate?', options: ['CPU', 'Network stack', 'Disk I/O', 'GPU'], correctAnswer: 1 },
      { questionId: '2', prompt: 'A veth pair is used to?', options: ['Connect two namespaces', 'Limit CPU usage', 'Encrypt traffic', 'Change DNS TTL'], correctAnswer: 0 },
      { questionId: '3', prompt: 'Per-namespace DNS often configures?', options: ['/etc/hosts', '/etc/resolv.conf', 'iptables', 'nftables chains'], correctAnswer: 1 },
      { questionId: '4', prompt: 'To provide external access from a namespace you often?', options: ['Add default route', 'Disable loopback', 'Change kernel version', 'Rename interfaces only'], correctAnswer: 0 },
      { questionId: '5', prompt: 'Firewalling inside a namespace is done with?', options: ['sed', 'awk', 'iptables/nftables', 'crontab'], correctAnswer: 2 }
    ],
    passingPercentage: 60
  },
  {
    assignmentId: 'networking-intermediate-2',
    courseId: 'networking-intermediate',
    title: 'Dynamic Firewall and Security Rules',
    description: 'Advanced firewall concepts including conntrack, rule ordering, and monitoring.',
    topics: [
      { topicId: 'stateful', title: 'Stateful vs Stateless', content: 'Understanding connection tracking and implications for firewall rules.' },
      { topicId: 'conntrack', title: 'Conntrack Basics', content: 'Track flows; RELATED/ESTABLISHED handling; performance considerations.' },
      { topicId: 'ordering', title: 'Rule Ordering', content: 'Top‑down evaluation; chains priority; jump targets and defaults.' },
      { topicId: 'rate-limit', title: 'Rate Limiting', content: 'Limit new connections and packets to mitigate abuse.' },
      { topicId: 'logging', title: 'Firewall Logging', content: 'Log strategies; detect anomalies; integrate with SIEM.' }
    ],
    questions: [
      { questionId: '1', prompt: 'Stateful firewalls rely on?', options: ['Routing tables only', 'Conntrack', 'DNS caching', 'ARP tables'], correctAnswer: 1 },
      { questionId: '2', prompt: 'To allow replies for outbound traffic, permit?', options: ['NEW only', 'RELATED/ESTABLISHED', 'INVALID', 'NONE'], correctAnswer: 1 },
      { questionId: '3', prompt: 'Rule ordering matters because?', options: ['Rules are random', 'Rules evaluate sequentially', 'Kernel ignores order', 'DNS resolves order'], correctAnswer: 1 },
      { questionId: '4', prompt: 'Rate limiting mitigates?', options: ['Disk wear', 'Flooding/abuse', 'DNS poisoning', 'MTU mismatch'], correctAnswer: 1 },
      { questionId: '5', prompt: 'Firewall logs help to?', options: ['Compile kernels', 'Diagnose traffic anomalies', 'Change IP addresses', 'Upgrade NIC firmware'], correctAnswer: 1 }
    ],
    passingPercentage: 60
  },
  {
    assignmentId: 'networking-intermediate-3',
    courseId: 'networking-intermediate',
    title: 'High Availability Networking',
    description: 'Designing redundant, resilient networks with bonding and failover.',
    topics: [
      { topicId: 'ha-concepts', title: 'HA Concepts', content: 'Active/passive and active/active designs; redundancy goals.' },
      { topicId: 'bonding', title: 'Linux Bonding', content: 'Modes (active‑backup, 802.3ad), link monitoring; LACP requirements.' },
      { topicId: 'failover', title: 'Failover Detection', content: 'MIIMON, ARP monitoring, BFD; detecting and handling link loss.' },
      { topicId: 'gateways', title: 'Multi-Gateway', content: 'Handling multiple default routes; policy routing.' },
      { topicId: 'testing', title: 'Testing HA', content: 'Simulate failures; verify seamless traffic continuity.' }
    ],
    questions: [
      { questionId: '1', prompt: 'LACP is associated with?', options: ['Bonding/aggregation', 'DNS', 'Firewall logging', 'IPsec'], correctAnswer: 0 },
      { questionId: '2', prompt: 'Active‑backup bonding mode provides?', options: ['Load balancing only', 'Failover redundancy', 'No redundancy', 'DNS failover'], correctAnswer: 1 },
      { questionId: '3', prompt: 'Monitoring link health can use?', options: ['MIIMON/ARP', 'cron only', 'ICMP disable', 'grep logs'], correctAnswer: 0 },
      { questionId: '4', prompt: 'Multiple gateways require?', options: ['Policy based routing', 'DHCP server', 'NAT only', 'MTU changes'], correctAnswer: 0 },
      { questionId: '5', prompt: 'Testing HA involves?', options: ['Ignoring failures', 'Simulating link down', 'Disabling logging', 'Blocking DNS'], correctAnswer: 1 }
    ],
    passingPercentage: 60
  },
  {
    assignmentId: 'networking-intermediate-4',
    courseId: 'networking-intermediate',
    title: 'Enterprise Routing & Segmentation',
    description: 'Policy-based routing, segmentation, and multi-gateway architectures.',
    topics: [
      { topicId: 'routing-basics', title: 'Routing Basics', content: 'Static vs dynamic routing; metrics and priorities.' },
      { topicId: 'pbr', title: 'Policy Based Routing', content: 'Route selection via source/destination policies; table separation.' },
      { topicId: 'segmentation', title: 'Segmentation', content: 'Inter‑VLAN routing; micro‑segmentation; traffic isolation.' },
      { topicId: 'failover-routing', title: 'Routing Failover', content: 'Detect gateway failure; switch to backup routes.' },
      { topicId: 'troubleshoot', title: 'Troubleshooting', content: 'Loop detection; asymmetric paths; route conflicts.' }
    ],
    questions: [
      { questionId: '1', prompt: 'Policy‑based routing selects routes based on?', options: ['Only destination', 'Flexible policies (e.g. source)', 'DNS only', 'ARP only'], correctAnswer: 1 },
      { questionId: '2', prompt: 'Segmentation aims to?', options: ['Mix all traffic', 'Isolate traffic domains', 'Disable routing', 'Disable DNS'], correctAnswer: 1 },
      { questionId: '3', prompt: 'Multiple tables can enable?', options: ['Single gateway', 'PBR scenarios', 'No routing', 'Only DHCP'], correctAnswer: 1 },
      { questionId: '4', prompt: 'Routing failover reacts to?', options: ['CPU spikes', 'Gateway loss', 'DNS cache', 'MTU mismatch'], correctAnswer: 1 },
      { questionId: '5', prompt: 'Routing loops are detected with?', options: ['Traceroute/TTL', 'CSS selectors', 'conntrack only', 'ping without TTL'], correctAnswer: 0 }
    ],
    passingPercentage: 60
  },
  {
    assignmentId: 'networking-intermediate-5',
    courseId: 'networking-intermediate',
    title: 'Secure Network Tunnels and VPNs',
    description: 'Tunneling fundamentals, encryption, performance, and enterprise VPN design.',
    topics: [
      { topicId: 'tunnel-vs-encrypt', title: 'Encryption vs Encapsulation', content: 'Differentiate between encrypting payloads and encapsulating packets.' },
      { topicId: 'site-to-site', title: 'Site‑to‑Site VPN', content: 'Gateway‑to‑gateway tunnels; routing considerations and split vs full.' },
      { topicId: 'remote-access', title: 'Remote Access VPN', content: 'User authentication; secure access for remote employees.' },
      { topicId: 'perf', title: 'Performance', content: 'MTU, MSS, cipher selection, and hardware acceleration impacts.' },
      { topicId: 'failover-vpn', title: 'VPN Failover', content: 'Maintain tunnels across gateway changes; rekeying and resilience.' }
    ],
    questions: [
      { questionId: '1', prompt: 'Encapsulation primarily?', options: ['Encrypts payload', 'Wraps packets in another protocol', 'Changes MAC addresses', 'Disables routing'], correctAnswer: 1 },
      { questionId: '2', prompt: 'Split tunneling allows?', options: ['All traffic via VPN', 'Some traffic via local ISP', 'No routing at all', 'Only DNS via VPN'], correctAnswer: 1 },
      { questionId: '3', prompt: 'Remote access VPNs focus on?', options: ['Gateway pairing', 'User access security', 'Layer 2 only', 'Bonding NICs'], correctAnswer: 1 },
      { questionId: '4', prompt: 'Performance can be improved by?', options: ['Random MTU', 'Correct MTU/MSS and ciphers', 'Ignoring logs', 'Disabling routing'], correctAnswer: 1 },
      { questionId: '5', prompt: 'Failover strategies help to?', options: ['Drop tunnels', 'Maintain connectivity', 'Disable DNS', 'Increase ARP cache only'], correctAnswer: 1 }
    ],
    passingPercentage: 60
  },
  {
    assignmentId: 'networking-intermediate-6',
    courseId: 'networking-intermediate',
    title: 'Monitoring, Logging, and Performance Tools',
    description: 'Enterprise-grade network monitoring, logging, and performance analysis.',
    topics: [
      { topicId: 'monitoring', title: 'Monitoring Basics', content: 'Active vs passive monitoring; baseline creation and KPIs.' },
      { topicId: 'logging', title: 'Centralized Logging', content: 'Collect logs centrally; retention and compliance considerations.' },
      { topicId: 'alerts', title: 'Alerting', content: 'Thresholds and notifications; avoiding alert fatigue.' },
      { topicId: 'incident', title: 'Incident Detection', content: 'Use logs and metrics for rapid identification of issues.' },
      { topicId: 'capacity', title: 'Capacity Planning', content: 'Forecast resource needs; analyze trends for scaling.' }
    ],
    questions: [
      { questionId: '1', prompt: 'A good network baseline includes?', options: ['Random logs', 'Defined KPIs', 'Only DNS cache', 'Packet drops ignored'], correctAnswer: 1 },
      { questionId: '2', prompt: 'Centralized logging helps?', options: ['Lose logs', 'Aggregate and analyze', 'Disable security', 'Reduce retention'], correctAnswer: 1 },
      { questionId: '3', prompt: 'Alert fatigue is mitigated by?', options: ['More alerts', 'Better thresholds and grouping', 'No alerts', 'Only email'], correctAnswer: 1 },
      { questionId: '4', prompt: 'Incident detection uses?', options: ['Logs/metrics', 'Only CSS', 'Only ARP', 'Only DHCP'], correctAnswer: 0 },
      { questionId: '5', prompt: 'Capacity planning relies on?', options: ['Random guess', 'Trend analysis', 'Disabling monitoring', 'DNS TTL'], correctAnswer: 1 }
    ],
    passingPercentage: 60
  }
];

async function upsertAssignments() {
  try {
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    for (const a of assignments) {
      // Check existing to avoid overwriting curated questions
      const existing = await Assignment.findOne({ assignmentId: a.assignmentId }).lean();
      if (!existing) {
        const inserted = await Assignment.findOneAndUpdate(
          { assignmentId: a.assignmentId },
          { $setOnInsert: a },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`✅ Inserted ${inserted.assignmentId} → ${inserted.title} (questions: ${inserted.questions?.length || 0}, topics: ${inserted.topics?.length || 0})`);
      } else {
        // Preserve curated topics and questions when assignment already exists
        const update = {
          title: a.title,
          description: a.description,
          courseId: a.courseId,
          // topics intentionally not overwritten on existing records
          passingPercentage: a.passingPercentage,
          updatedAt: new Date(),
        };
        const updated = await Assignment.findOneAndUpdate(
          { assignmentId: a.assignmentId },
          { $set: update },
          { new: true }
        );
        console.log(`♻️ Updated meta for ${updated.assignmentId} (kept existing topics=${updated.topics?.length || 0}, questions=${updated.questions?.length || 0})`);
      }
    }
  } catch (err) {
    console.error('❌ Error upserting assignments:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  upsertAssignments();
}