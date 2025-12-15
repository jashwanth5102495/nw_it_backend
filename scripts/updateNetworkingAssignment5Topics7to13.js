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
    topicId: 'dns-testing-verification',
    title: 'DNS Testing & Verification Tools (dig, nslookup, resolvectl)',
    content: 'Use dig, nslookup, and resolvectl to diagnose DNS resolution, caching, and configuration issues.',
    explanation: [
      'DNS is one of the most critical components of networking, and diagnosing DNS problems requires the right tools. dig provides detailed DNS query information including authoritative answers, query time, and TTL values. nslookup is simpler and useful for quick testing. Modern Linux systems also use resolvectl to check DNS configurations under systemd.',
      'DNS failures often create the illusion of "no internet" even when the network is fully operational. These tools allow administrators to confirm whether DNS servers are reachable, whether caching is correct, and whether a domain resolves properly. They are also used in penetration testing to analyze DNS records, subdomains, and misconfigurations.'
    ].join('\n\n'),
    examples: [
      'dig google.com',
      'nslookup example.com',
      'resolvectl dns',
      'resolvectl query github.com'
    ]
  },
  {
    topicId: 'firewall-log-analysis',
    title: 'Analyzing Firewall Logs (UFW, Firewalld, IPTables)',
    content: 'Firewall logs reveal blocked packets, intrusion attempts, port scans, and rule conflicts that impact connectivity.',
    explanation: [
      'Firewall logs provide insight into blocked packets, intrusion attempts, port scans, and misconfigured NAT rules. By analyzing logs, administrators can detect unauthorized access attempts or rule conflicts. UFW and Firewalld are user-friendly frontends, while IPTables gives detailed low-level control over packet flows.',
      'Monitoring firewall logs helps diagnose connection drops or unexpected service behavior. Misconfigured rules can break DNS, SSH, or routing, causing significant downtime. Understanding these logs is essential for detecting security threats and verifying whether firewall rules are functioning correctly.'
    ].join('\n\n'),
    examples: [
      'sudo tail -f /var/log/ufw.log',
      'sudo firewall-cmd --list-all',
      'sudo iptables -L -v -n',
      'sudo journalctl -u firewalld'
    ]
  },
  {
    topicId: 'tcp-retransmissions-latency',
    title: 'TCP Retransmissions & Network Latency Analysis',
    content: 'Investigate packet loss, congestion, and delays using ping, mtr, ss, and tcpdump to optimize performance.',
    explanation: [
      'TCP retransmissions occur when packets are lost or delayed in transit. High retransmission rates indicate congestion, unstable links, interference (WiFi), or faulty cables. Latency analysis helps understand delays between hosts and is crucial for real-time applications like VoIP, gaming, or video streaming.',
      'Analyzing retransmissions can reveal problematic routers, overloaded servers, or misconfigured MTU sizes. Tools like ping, mtr, and Wireshark help identify latency spikes and packet loss across network paths. Understanding these metrics is vital for optimizing network performance and ensuring stability.'
    ].join('\n\n'),
    examples: [
      'ping -c 5 google.com',
      'mtr 8.8.8.8',
      'ss -s',
      'tcpdump -nnvvv | grep retransmission'
    ]
  },
  {
    topicId: 'ssh-security-hardening',
    title: 'SSH Security & Hardening',
    content: 'Harden SSH by using keys, limiting users, changing ports, and enforcing firewall restrictions and logging.',
    explanation: [
      'SSH is the primary remote administration tool in Linux environments. Securing it is critical to prevent brute-force attacks, unauthorized logins, and remote exploitation. Hardening techniques include disabling password login, using SSH keys, limiting user access, changing the default port, and restricting access with firewalls.',
      'Monitoring SSH logs helps detect intrusion attempts and compromised systems. Proper SSH hardening significantly reduces attack surfaces and is considered an essential practice in corporate environments and cloud servers.'
    ].join('\n\n'),
    examples: [
      'sudo nano /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
      'ssh-keygen -t rsa',
      'ssh-copy-id user@server'
    ]
  },
  {
    topicId: 'nmap-nse',
    title: 'Nmap Scripting Engine (NSE)',
    content: 'Use NSE scripts to automate discovery, enumeration, vulnerability checks, and firewall analysis during audits.',
    explanation: [
      'NSE enhances Nmap with powerful scripts used for vulnerability scanning, service enumeration, firewall detection, DNS brute-forcing, and more. Scripts automate complex scanning tasks, making Nmap suitable for penetration testing and network auditing. Engineers rely on NSE to detect outdated software, weak configurations, and exposed services.',
      'NSE provides categories like safe, default, vuln, discovery, and intrusive, each serving different purposes. Proper use of NSE helps identify risks before attackers exploit them.'
    ].join('\n\n'),
    examples: [
      'nmap --script=default 192.168.1.1',
      'nmap --script=vuln target.com',
      'nmap --script=http-enum 192.168.1.10'
    ]
  },
  {
    topicId: 'http-header-inspection',
    title: 'HTTP Header Inspection (curl, wget)',
    content: 'Inspect headers to troubleshoot caching, redirects, SSL/TLS, CORS, cookies, and server metadata.',
    explanation: [
      'Inspecting HTTP headers helps troubleshoot web server behavior, caching issues, redirects, and SSL/TLS configurations. Headers contain critical metadata such as server type, content type, cookies, caching rules, CORS settings, and compression. Tools like curl and wget allow engineers to examine this information directly from the CLI.',
      'In security analysis, headers can reveal outdated server software, missing security flags (HSTS, CSP), and vulnerable configurations. Header analysis is also crucial for optimizing performance in CDNs and load balancers.'
    ].join('\n\n'),
    examples: [
      'curl -I https://example.com',
      'curl -v https://google.com',
      'wget --server-response https://example.com'
    ]
  },
  {
    topicId: 'load-balancing-l4-l7',
    title: 'Load Balancing Concepts (L4 vs L7)',
    content: 'Contrast transport-layer (L4) vs application-layer (L7) load balancing for scalability and intelligent routing.',
    explanation: [
      'Load balancing distributes traffic across multiple servers to improve reliability, speed, and availability. Layer 4 load balancers work at the TCP/UDP level, routing packets without inspecting their content. Layer 7 load balancers analyze application-level data (like HTTP headers), enabling intelligent routing based on URLs, cookies, or user sessions.',
      'Understanding the difference is essential for designing scalable systems. L4 is used for fast and simple distribution, while L7 is used for advanced traffic management. Both are critical in enterprise environments, CDNs, and cloud platforms.'
    ].join('\n\n'),
    examples: [
      'ipvsadm -Ln',
      'haproxy -c -f /etc/haproxy/haproxy.cfg'
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

    console.log(`✅ Merged topics 7–13 into '${ASSIGNMENT_ID}'`);
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