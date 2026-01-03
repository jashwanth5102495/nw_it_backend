require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

// Flexible schema to allow topic fields like explanation/examples
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

// Study material provided by user
const newTopics = [
  {
    topicId: 'linux-system-resource-monitoring',
    title: 'Linux System Resource Monitoring (CPU, RAM, GPU, Load Average)',
    content: 'Monitoring CPU, RAM, GPU and load average helps diagnose performance issues that affect network services and stability.',
    explanation: [
      'System resource monitoring is essential to ensure stable and predictable network performance. High CPU usage can delay packet processing, slow down encryption/decryption, and impact routing operations. RAM shortages cause processes to swap to disk, drastically reducing network throughput. GPU monitoring is important in modern systems performing deep packet inspection (DPI) or AI-based network analysis. Load average helps administrators understand how busy the system is over time and detect overload conditions before they cause failures.',
      'Network engineers use tools like top, htop, and vmstat to detect abnormal system behavior. When a device is overloaded, services like DNS, DHCP, firewall filtering, or routing may crash or respond slowly. Monitoring resources helps isolate whether a network issue is caused by congestion or system strain. Proper diagnosis can prevent downtime, improve server responsiveness, and help maintain reliable network operations.'
    ].join('\n\n'),
    examples: [
      'top',
      'htop',
      'vmstat 1',
      'nvidia-smi',
      'uptime'
    ]
  },
  {
    topicId: 'network-daemons-and-services',
    title: 'Network Daemons & Services (systemctl, service)',
    content: 'Manage critical background services like DNS, DHCP, firewalls, SSH and routing daemons using systemd and service tools.',
    explanation: [
      'Network environments rely on multiple background services like DHCP clients, DNS resolvers, firewalls, SSH servers, and routing daemons. Understanding how to start, stop, restart, or check the status of these services is crucial in diagnosing network failures. If critical services fail, the system may lose connectivity, be unable to resolve hostnames, or expose itself to security risks.',
      'Systemd utilities (systemctl) offer powerful control over service management. For example, restarting NetworkManager or dnsmasq often resolves sudden connectivity issues. Checking logs for failing services helps identify configuration errors. Managing daemons is one of the most important skills for Linux network troubleshooting.'
    ].join('\n\n'),
    examples: [
      'systemctl status NetworkManager',
      'systemctl restart sshd',
      'systemctl enable firewalld',
      'service networking restart',
      'journalctl -u NetworkManager'
    ]
  },
  {
    topicId: 'tcpdump-deep-packet-capture',
    title: 'Traffic Monitoring with tcpdump (Deep Packet Capture)',
    content: 'Use tcpdump to capture and filter packets for protocol analysis, troubleshooting DNS/TCP issues, and security investigations.',
    explanation: [
      'Tcpdump is a CLI-based packet capture tool used to analyze network traffic at a very granular level. It allows administrators to inspect headers, protocols, flags, and payloads. This is particularly useful when diagnosing DNS failures, TCP handshake issues, VPN drops, or security incidents. Tcpdump works directly with network interfaces and provides real-time visibility into incoming and outgoing packets.',
      'Using tcpdump effectively requires knowing how to filter traffic. Engineers can capture handshake packets, specific ports, protocols, or packets from specific hosts. The captured .pcap files can be imported into Wireshark for deeper graphical analysis. Tcpdump is widely used in enterprise troubleshooting, cybersecurity, and penetration testing due to its precision and reliability.'
    ].join('\n\n'),
    examples: [
      'tcpdump -i eth0',
      'tcpdump -i wlan0 port 53',
      'tcpdump -nn -w capture.pcap',
      'tcpdump host 192.168.1.10'
    ]
  },
  {
    topicId: 'netcat-port-testing-banner-grabbing',
    title: 'Using Netcat (nc) for Port Testing & Banner Grabbing',
    content: 'Netcat tests open ports, grabs service banners, simulates simple servers, and helps debug connectivity.',
    explanation: [
      'Netcat, known as the “Swiss Army Knife” of networking, allows administrators to test open ports, transfer data, and debug network services. It can perform simple checks like determining if a port is open, as well as advanced operations like simulating a server response. Banner grabbing helps identify services running on remote hosts, which is useful in both auditing and penetration testing.',
      'Netcat is also valuable for troubleshooting connectivity issues. If a server fails to respond on a specific port (e.g., 22, 80, 443), netcat can verify whether the problem is due to a firewall, a routing issue, or a service outage. Security engineers also use netcat for reverse shells and data tunneling during penetration tests, which reinforces the importance of strong firewall policies.'
    ].join('\n\n'),
    examples: [
      'nc -zv 192.168.1.1 80',
      'nc 192.168.1.1 22',
      'nc -lvp 4444',
      'echo "hello" | nc 192.168.1.10 5000'
    ]
  },
  {
    topicId: 'ss-socket-analysis',
    title: 'Using SS Command for Socket Analysis',
    content: 'ss is a fast netstat replacement to inspect listening ports, established sessions, and socket details.',
    explanation: [
      'The ss command is a modern replacement for netstat, built for speed and accuracy. It shows open connections, listening ports, established TCP sessions, and UNIX socket usage. Engineers use it to analyze active connections and identify suspicious processes communicating with remote IPs. The ss -t (TCP) and ss -u (UDP) filters simplify protocol-specific diagnostics.',
      'Socket analysis is essential during attacks like SYN floods, malware activity, or unauthorized ssh/bruteforce attempts. It also helps detect misconfigured services, blocked applications, and network daemons that fail to bind to ports. ss is especially useful on busy servers where thousands of connections occur per second.'
    ].join('\n\n'),
    examples: [
      'ss -tulpn',
      'ss -ant | grep ESTAB',
      'ss -uap',
      'ss -ltn'
    ]
  },
  {
    topicId: 'real-time-log-monitoring',
    title: 'Monitoring Logs in Real Time (tail -f, journalctl -f)',
    content: 'Live log monitoring reveals kernel events, DHCP/DNS issues, SSH attempts, and firewall activity during outages.',
    explanation: [
      'Real-time log monitoring helps administrators react instantly to network issues. Logs reveal kernel events, DHCP requests, DNS failures, SSH login attempts, and firewall drops. Watching logs live allows engineers to quickly isolate the root cause during outages—such as an interface going down or a service crashing unexpectedly.',
      'Security teams rely heavily on live logging to detect brute-force attempts, suspicious network behavior, or misconfigured services. Tools like tail -f and journalctl -f allow continuous monitoring of log files as they update. This reduces troubleshooting time and helps stop incidents before they escalate.'
    ].join('\n\n'),
    examples: [
      'tail -f /var/log/syslog',
      'journalctl -f',
      'tail -f /var/log/auth.log',
      'journalctl -u sshd -f'
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
    const byId = new Map(existing.map(t => [t.topicId, t]));

    // Merge or add each topic idempotently
    for(const t of newTopics){
      byId.set(t.topicId, { ...byId.get(t.topicId), ...t });
    }

    const merged = [...byId.values()];

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, title: 'Assignment 5: System Services & Traffic Analysis', updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Updated topics for '${ASSIGNMENT_ID}'`);
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