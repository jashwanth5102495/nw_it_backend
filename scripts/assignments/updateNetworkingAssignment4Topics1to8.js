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
const DEFAULT_TITLE = 'Assignment 4: System Performance & Network Operations Monitoring';
const DEFAULT_DESCRIPTION = 'Key system and network operations topics: throughput, process and CPU monitoring, disk I/O, ports, logs, scheduling, and automation with Bash.';

const topics = [
  {
    topicId: 'throughput-bandwidth',
    title: 'Understanding Network Throughput & Bandwidth Measurement',
    content: 'Differentiate throughput (actual speed) from bandwidth (theoretical capacity). Measure and validate performance.',
    explanation: [
      'Network throughput represents the actual speed at which data is transferred between systems, while bandwidth is the theoretical maximum capacity of a network link. Engineers use throughput analysis to diagnose slow downloads, buffering, file transfer delays, and application performance issues. Throughput is influenced by latency, packet loss, congestion, device limits, and duplex mismatches.',
      'Tools like iperf3, nload, and bmon help measure send/receive speeds in real time. These tests are important for validating ISP speeds, checking server performance, and benchmarking LAN/WAN infrastructure. Without throughput measurement, you cannot verify whether your network hardware and routing are functioning properly.'
    ].join('\n\n'),
    examples: [
      'iperf3 -s',
      'iperf3 -c <IP>',
      'nload',
      'bmon'
    ]
  },
  {
    topicId: 'ps-top-network-processes',
    title: 'PS & TOP for Monitoring Network-Related Processes',
    content: 'Monitor processes driving network load; detect anomalies, malware, or misconfigurations.',
    explanation: [
      'Linux network services run as processes such as sshd, dhclient, NetworkManager, or application servers. Tools like top and ps allow administrators to see which processes consume CPU, memory, or cause network load. This is essential when troubleshooting spikes, slow applications, or unknown background network traffic.',
      'By identifying suspicious processes, administrators can detect malware, crypto miners, unauthorised VPNs, or misconfigured services. Monitoring process resource usage also helps optimize performance and prevent system hangs.'
    ].join('\n\n'),
    examples: [
      'ps aux | grep ssh',
      'top',
      'htop',
      'ps -eo pid,cmd,%cpu,%mem --sort=-%cpu'
    ]
  },
  {
    topicId: 'cpu-load-impact',
    title: 'Understanding CPU Load & Its Impact on Network Performance',
    content: 'High CPU affects packet processing, routing, firewalling, and encryption, impacting network performance.',
    explanation: [
      'CPU load affects how quickly a system can process network packets, routing rules, firewall filtering, and encryption tasks like SSL/TLS. High CPU usage may cause dropped packets, slow SSH sessions, delayed DNS resolution, or sluggish web servers. This becomes critical on firewalls, routers, and VPN servers where traffic must be processed quickly.',
      'Monitoring load average helps diagnose bottlenecks and determine whether hardware upgrades are needed. A system overloaded with tasks can affect even a fast network link, making performance appear poor even when bandwidth is plentiful.'
    ].join('\n\n'),
    examples: [
      'uptime',
      'top | grep load',
      'mpstat 1'
    ]
  },
  {
    topicId: 'iostat-disk-bottlenecks',
    title: 'iostat & Disk Bottlenecks in Networking',
    content: 'Disk I/O impacts network services (logs, caching, DB). Monitor I/O to find true bottlenecks.',
    explanation: [
      'Disk performance affects network operations because logs, caching, database queries, and web servers rely on fast read/write speed. When disk I/O is slow, services like DNS, DHCP, or HTTP may become unresponsive. Firewalls generating large logs can also suffer delays if storage is unable to keep up.',
      'The iostat tool monitors disk usage, read/write speeds, and I/O wait times. High I/O wait values indicate that networking delays are due to storage bottlenecks rather than network issues, helping engineers diagnose the real root cause.'
    ].join('\n\n'),
    examples: [
      'iostat -x 1',
      'df -h',
      'du -sh /var/log'
    ]
  },
  {
    topicId: 'ss-lsof-open-ports',
    title: 'Using ss & lsof for Monitoring Open Network Ports',
    content: 'Identify listening services, active sessions, and owners of sockets for security and troubleshooting.',
    explanation: [
      'Open ports indicate which services are listening for incoming connections. Monitoring them is essential for security, troubleshooting, and performance analysis. Tools like ss and lsof reveal port usage, active sessions, and which processes own network sockets.',
      'This helps detect unauthorized services, malware, misconfigured servers, or duplicate services competing for the same port. It also assists administrators in confirming whether firewalls and routing rules are functioning correctly.'
    ].join('\n\n'),
    examples: [
      'ss -tulpn',
      'lsof -i :22',
      'ss -ant'
    ]
  },
  {
    topicId: 'system-logs-network',
    title: 'System Logs Relevant to Network Troubleshooting',
    content: 'Use logs to diagnose DHCP, firewall, VPN, routing issues; filter and follow system events.',
    explanation: [
      'System logs hold information about network failures, DHCP issues, firewall drops, VPN errors, and routing problems. Reading logs is crucial for diagnosing issues and verifying the state of network services. Without logs, administrators would have no visibility into what caused a connection failure.',
      'Tools such as journalctl, tail, and grep help search and monitor logs efficiently. Using log filters helps isolate errors quickly, making troubleshooting faster and more accurate.'
    ].join('\n\n'),
    examples: [
      'journalctl -u NetworkManager',
      'grep -i "error" /var/log/syslog',
      'tail -f /var/log/kern.log'
    ]
  },
  {
    topicId: 'cronjobs-automation',
    title: 'Using Cronjobs for Automated Network Tasks',
    content: 'Schedule recurring tasks for backups, logs, reports, firewall reloads, and monitoring.',
    explanation: [
      'Cronjobs allow scheduling network tasks such as backups, log rotation, bandwidth reports, or automated firewall reloads. Automating network tasks ensures consistency, reduces manual workload, and prevents human errors. It also allows monitoring jobs to run on a recurring basis for performance tracking.',
      'Cron can also be used for sending network alerts, updating threat lists, and performing daily diagnostic scans. This is essential for team-based environments where automated tasks provide stability and predictability.'
    ].join('\n\n'),
    examples: [
      'crontab -e',
      '0 * * * * ip -s link > /var/log/netstats.log',
      'systemctl status cron'
    ]
  },
  {
    topicId: 'bash-network-automation',
    title: 'Bash Scripting for Networking Automation',
    content: 'Automate scans, backups, service restarts, reports, packet captures, and uptime checks.',
    explanation: [
      'Bash scripting enables administrators to combine commands into automated routines such as scanning networks, backing up configurations, restarting services, or generating reports. Automation is essential in large networks where manual operations are slow and error-prone.',
      'Scripts can also help with packet captures, backup of router configurations, log parsing, and monitoring uptime. Learning Bash is a foundation for DevOps, SysAdmin, and Network Automation roles.'
    ].join('\n\n'),
    examples: [
      '#!/bin/bash',
      'echo "Checking connectivity..."',
      'ping -c 4 google.com',
      'chmod +x test.sh',
      './test.sh'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Upsert base assignment if not exists
    const base = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $setOnInsert: { assignmentId: ASSIGNMENT_ID, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION } },
      { upsert: true, new: true }
    );

    const existing = Array.isArray(base.topics) ? base.topics : [];
    const byId = new Map(existing.map(t => [t.topicId, t]));

    // Merge topics 1–8 idempotently
    for(const t of topics){
      byId.set(t.topicId, { ...byId.get(t.topicId), ...t });
    }

    // Preserve order (existing first), append any new topics
    const merged = existing.map(t => byId.get(t.topicId) || t);
    for(const t of topics){
      if(!existing.find(et => et.topicId === t.topicId)) merged.push(byId.get(t.topicId));
    }

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Upserted topics 1–8 into '${ASSIGNMENT_ID}'`);
    console.log(`  Title: ${result.title}`);
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