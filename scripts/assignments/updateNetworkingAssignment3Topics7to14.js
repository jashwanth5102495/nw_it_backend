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

// Topics 7–14 provided by user
const newTopics = [
  {
    topicId: 'netcat-usage',
    title: 'Using Netcat for Networking & Security Testing',
    content: 'Netcat is a versatile tool for connectivity tests, port scanning, data streaming, and manual TCP/UDP connections.',
    explanation: [
      'Netcat (nc) is often called the “Swiss Army Knife” of networking. It can be used for port scanning, transferring files, streaming data, and creating manual TCP/UDP connections. Netcat is useful for testing firewalls, verifying open ports, and debugging client/server applications.',
      'Netcat also supports reverse shells and bind shells, making it a powerful tool in penetration testing and red-team activities. Security engineers use it to validate firewall rules, simulate services, and perform simple connectivity tests without needing heavyweight tools.'
    ].join('\n\n'),
    examples: [
      'nc -zv 192.168.1.10 22',
      'nc -lvp 4444',
      'nc 192.168.1.10 4444',
      'echo "Hello" | nc 192.168.1.20 5000'
    ]
  },
  {
    topicId: 'linux-permissions-hardening',
    title: 'Hardening Linux File Permissions for Security',
    content: 'Harden file permissions to protect sensitive configs, credentials, keys, and firewall rules from unauthorized access.',
    explanation: [
      'File permissions are critical for network security because configuration files often contain sensitive information such as credentials, keys, and firewall rules. Misconfigured permissions can allow unauthorized users to access or modify important system files, leading to security breaches.',
      'Linux allows granular control through chmod, chown, and ACLs. Security engineers apply the principle of least privilege by restricting permissions to only those who require access. Permission-hardening is essential on servers hosting SSH, DNS, DHCP, web services, and network monitoring tools.'
    ].join('\n\n'),
    examples: [
      'chmod 600 /etc/ssh/sshd_config',
      'chown root:root /etc/fstab',
      'getfacl /var/www/html',
      'setfacl -m u:user:r /secure/file'
    ]
  },
  {
    topicId: 'firewalld-zones',
    title: 'Linux FirewallD – Zone-Based Firewalls',
    content: 'FirewallD provides dynamic zone-based policies (public, internal, trusted, dmz, home) for segmented security.',
    explanation: [
      'FirewallD introduces dynamic firewall management through zones such as public, internal, trusted, dmz, and home. Each zone has predefined rules that simplify the process of creating secure firewall policies. This helps segment networks and apply different trust levels.',
      "FirewallD allows runtime and permanent rules, service-based filtering, and integrates easily with systemd. It's widely used in CentOS, RHEL, and Fedora environments for server security. Zone-specific policies help prevent unauthorized access and protect network services."
    ].join('\n\n'),
    examples: [
      'sudo firewall-cmd --list-all',
      'sudo firewall-cmd --zone=public --add-service=http --permanent',
      'sudo firewall-cmd --reload',
      'sudo firewall-cmd --zone=trusted --add-source=192.168.1.0/24'
    ]
  },
  {
    topicId: 'sysctl-network-tuning',
    title: 'Linux Kernel Network Parameters (sysctl tuning)',
    content: 'Tune kernel networking via sysctl for performance, security, and protocol behavior (TCP/IPv4/IPv6).',
    explanation: [
      'sysctl allows administrators to modify kernel-level networking parameters such as buffer sizes, TCP optimization options, and security restrictions. Tuning parameters like TCP window size, SYN retries, and IP forwarding helps improve performance and harden systems.',
      'These settings are essential for high-performance servers, firewalls, routers, and VPN devices. sysctl also controls IPv4/IPv6 behavior, filtering rules, and ICMP handling. Proper tuning prevents attacks like SYN floods and reduces latency across networks.'
    ].join('\n\n'),
    examples: [
      'sudo sysctl -a | grep net',
      'sudo sysctl -w net.ipv4.ip_forward=1',
      'echo "net.ipv4.tcp_syncookies=1" >> /etc/sysctl.conf',
      'sudo sysctl -p'
    ]
  },
  {
    topicId: 'conntrack-monitoring',
    title: 'Monitoring Connections with conntrack',
    content: 'Inspect and manage connection tracking tables to troubleshoot NAT, floods, and suspicious traffic.',
    explanation: [
      'conntrack is used to view and manage connection tracking tables in Linux firewalls. These tables store details about every active connection passing through the firewall, such as source, destination, protocol, and state.',
      'Security engineers monitor conntrack to troubleshoot NAT issues, diagnose connection floods, and detect suspicious traffic. Overloaded conntrack tables can cause dropped packets, making monitoring essential on busy firewalls.'
    ].join('\n\n'),
    examples: [
      'sudo apt install conntrack',
      'sudo conntrack -L',
      'sudo conntrack -D -s 192.168.1.10',
      'sudo conntrack -F'
    ]
  },
  {
    topicId: 'arp-inspection',
    title: 'ARP Inspection & Spoofing Detection',
    content: 'Detect ARP spoofing/MITM via DAI, monitoring tables, static entries, arpwatch, and arping.',
    explanation: [
      'ARP is vulnerable to spoofing attacks, where attackers impersonate a gateway to hijack traffic. Dynamic ARP Inspection (DAI) helps detect and block these malicious ARP packets at the switch level. Linux tools can also help identify spoofing attempts on local networks.',
      'ARP spoofing is often used in MITM attacks. Detecting abnormal MAC-IP mappings, monitoring ARP tables, and using static ARP entries help prevent unauthorized interception. Tools like arpwatch and arping make this process easier.'
    ].join('\n\n'),
    examples: [
      'arp -a',
      'arping 192.168.1.1',
      'sudo arpwatch',
      'ip neigh'
    ]
  },
  {
    topicId: 'dns-security',
    title: 'DNS Security – Preventing Spoofing & Cache Poisoning',
    content: 'Use DNSSEC, secure resolvers, validation, monitoring, and restricted recursion to protect DNS.',
    explanation: [
      'DNS plays a central role in network communication, making it a major target for spoofing and poisoning attacks. Attackers try to redirect traffic to malicious servers by forging DNS responses. Implementing DNSSEC, using secure resolvers, and validating DNS replies help protect networks.',
      'DNS monitoring, query logging, and disabling open recursion are additional security measures. Corporate networks often deploy internal DNS servers with strict policies to prevent data exfiltration and ensure reliable name resolution.'
    ].join('\n\n'),
    examples: [
      'dig example.com',
      'dig +trace google.com',
      'sudo journalctl -u bind9',
      'sudo rndc flush'
    ]
  },
  {
    topicId: 'ethtool-monitoring',
    title: 'Monitoring Network Interfaces with ethtool',
    content: 'Inspect NIC speed/duplex/driver, adjust offloads and buffers to troubleshoot performance.',
    explanation: [
      'ethtool provides information about network interfaces, including link speed, duplex mode, driver details, and hardware capabilities. This is useful for diagnosing physical connectivity issues and performance bottlenecks.',
      'Engineers use ethtool to enable or disable offload settings, modify ring buffers, and optimize interface performance. It is a valuable tool for troubleshooting slow connections, packet drops, and hardware compatibility issues.'
    ].join('\n\n'),
    examples: [
      'sudo ethtool eth0',
      'sudo ethtool -s eth0 speed 1000 duplex full',
      'sudo ethtool -K eth0 gro off',
      'sudo ethtool -i eth0'
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

    // Merge new topics by topicId (idempotent)
    for(const t of newTopics){
      byId.set(t.topicId, { ...byId.get(t.topicId), ...t });
    }

    const merged = [...byId.values()];

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: merged, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Merged topics into '${ASSIGNMENT_ID}'`);
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