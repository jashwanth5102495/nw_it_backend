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

const topics = [
  {
    topicId: 'nethogs-per-process-bandwidth',
    title: 'nethogs for Per-Process Bandwidth Tracking',
    content: 'Track bandwidth per process to catch heavy apps, updates, or malware.',
    explanation: [
      "Unlike traditional bandwidth tools, nethogs shows which processes consume the most data. This helps detect background updates, malware, torrents, or heavy applications that slow down the network. It's extremely useful in troubleshooting sudden bandwidth spikes.",
      "System administrators use nethogs to identify suspicious processes using network resources without permission. It provides real-time insights into per-process data flows."
    ].join('\n\n'),
    examples: [
      'nethogs',
      'sudo nethogs -d 1'
    ]
  },
  {
    topicId: 'mtu-fragmentation',
    title: 'Understanding MTU & Fragmentation Issues',
    content: 'Tune MTU to prevent fragmentation, packet loss, VPN issues, and slow browsing.',
    explanation: [
      'MTU (Maximum Transmission Unit) defines the largest packet that can be transmitted without fragmentation. Incorrect MTU settings cause packet loss, slow browsing, VPN problems, and broken connections. Many tunneling protocols modify MTU values, requiring proper adjustments.',
      'Troubleshooting MTU involves testing using ping -M do, adjusting router settings, and optimizing tunnels. Understanding fragmentation is crucial for maintaining efficient network performance.'
    ].join('\n\n'),
    examples: [
      'ping -M do -s 1472 8.8.8.8',
      'ip link set eth0 mtu 1400',
      'ip link show eth0'
    ]
  },
  {
    topicId: 'ethtool-interface-monitoring',
    title: 'Monitoring Network Interfaces with ethtool',
    content: 'Inspect link speed, duplex, driver, and errors; fix duplex mismatches and offloading.',
    explanation: [
      'ethtool displays hardware-level interface details such as link speed, duplex, driver information, and error counters. Duplex mismatch (half vs full duplex) is a major cause of slow networks and excessive collisions. This tool helps diagnose physical layer issues.',
      "Administrators use ethtool to adjust speed, disable offloading, and monitor cable/connectivity quality. It's especially useful on servers and switches."
    ].join('\n\n'),
    examples: [
      'ethtool eth0',
      'ethtool -K eth0 gro off',
      'ethtool -s eth0 speed 100 duplex full'
    ]
  },
  {
    topicId: 'iftop-realtime-bandwidth',
    title: 'Using iftop for Real-Time Bandwidth Monitoring',
    content: 'Visualize host-pair traffic to spot heavy IPs, abnormal flows, and slowdowns.',
    explanation: [
      'iftop shows real-time network traffic between host pairs, allowing you to see which devices communicate most. This is useful when diagnosing slow networks, abnormal traffic, or unknown IPs on the network.',
      'It visualizes bandwidth usage in both directions, helping locate heavy internal or external communication patterns. It’s an essential tool for on-premise and cloud environments.'
    ].join('\n\n'),
    examples: [
      'iftop',
      'iftop -i eth0'
    ]
  },
  {
    topicId: 'system-resource-bottlenecks-network',
    title: 'System Resource Bottlenecks Affecting Networking',
    content: 'Check CPU, RAM, disk I/O, and NIC stats to find true bottlenecks.',
    explanation: [
      'Network performance depends on CPU, RAM, disk I/O, and NIC capabilities. Bottlenecks in any of these areas lead to slow connections, latency, or dropped packets. Understanding the role of each component allows better diagnosis.',
      'Admins must check memory usage, buffer sizes, disk queues, and NIC statistics to pinpoint the exact issue. Networking is not just about packets—it’s about how the system processes them.'
    ].join('\n\n'),
    examples: [
      'free -h',
      'vmstat 1',
      'dmesg | grep -i error'
    ]
  },
  {
    topicId: 'tcpdump-lightweight-sniffing',
    title: 'Using tcpdump for Lightweight Packet Sniffing',
    content: 'Capture live traffic to debug protocols, DNS, handshakes, and firewall drops.',
    explanation: [
      'tcpdump is a powerful CLI packet analyzer used to examine live traffic, debug protocols, and check if packets reach a destination. Unlike Wireshark, tcpdump is lightweight and usable on remote servers or routers.',
      'It helps identify dropped packets, handshake issues, DNS failures, or blocked firewall traffic. Engineers rely on tcpdump for quick diagnosis before doing deep analysis with Wireshark.'
    ].join('\n\n'),
    examples: [
      'tcpdump -i eth0',
      'tcpdump -i eth0 port 53',
      'tcpdump -w capture.pcap'
    ]
  },
  {
    topicId: 'pmacct-advanced-accounting',
    title: 'Using pmacct for Advanced Network Accounting',
    content: 'Collect flows, bandwidth, AS-paths, and protocol stats; integrate with SIEM/DB.',
    explanation: [
      'pmacct is a powerful network accounting tool used in ISPs, data centers, and enterprise firewalls for tracking traffic flows, bandwidth usage, AS-paths, and protocol statistics. It integrates with databases, SIEM tools, and monitoring dashboards.',
      'It generates detailed traffic summaries that help in billing, capacity planning, and security analysis. pmacct is often used when standard tools cannot handle enterprise-scale data.'
    ].join('\n\n'),
    examples: [
      'pmacctd -f /etc/pmacct/pmacctd.conf',
      'pmacct -s',
      'pmacct -e'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Ensure base assignment exists but do not override existing title/description
    const base = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $setOnInsert: { assignmentId: ASSIGNMENT_ID } },
      { upsert: true, new: true }
    );

    const existing = Array.isArray(base.topics) ? base.topics : [];
    const byId = new Map(existing.map(t => [t.topicId, t]));

    // Merge topics 9–15 idempotently
    for(const t of topics){
      byId.set(t.topicId, { ...byId.get(t.topicId), ...t });
    }

    // Preserve existing order and append any truly new topics
    const merged = existing.map(t => byId.get(t.topicId) || t);
    for(const t of topics){
      if(!existing.find(et => et.topicId === t.topicId)) merged.push(byId.get(t.topicId));
    }

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Upserted topics 9–15 into '${ASSIGNMENT_ID}'`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Total topics: ${result.topics?.length || 0}`);
    (result.topics || []).forEach((t, i) => {
      if(['nethogs-per-process-bandwidth','mtu-fragmentation','ethtool-interface-monitoring','iftop-realtime-bandwidth','system-resource-bottlenecks-network','tcpdump-lightweight-sniffing','pmacct-advanced-accounting'].includes(t.topicId)){
        console.log(`    [${i+1}] ${t.title} | id=${t.topicId} | cmds=${(t.examples||[]).length}`);
      }
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