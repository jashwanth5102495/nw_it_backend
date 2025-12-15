require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String, examples: [String] }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const ASSIGNMENT_ID = 'networking-beginner-6';

const topics = [
  {
    topicId: 'stateful-vs-stateless-firewalls',
    title: 'Stateful vs Stateless Firewalls',
    content: 'Compare firewall packet filtering approaches; state tracking, sessions, and anomaly detection.',
    explanation: [
      'Firewalls operate by inspecting inbound and outbound traffic, but their intelligence depends on whether they use stateful or stateless filtering. Stateless firewalls check packets individually based only on IPs, ports, and rules. They are fast but lack context, meaning they cannot understand whether a packet belongs to an existing session. This makes them suitable only for simple packet filtering on low-power devices or edge networks.',
      'Stateful firewalls, however, maintain a connection table tracking each active session. They understand TCP handshakes, connection status, and can detect anomalies like unsolicited packets, half-open connections, or flooding attempts. Almost all modern enterprise firewalls—Cisco ASA, Palo Alto, FortiGate—use stateful inspection because it allows deeper security analysis and prevents spoofed or unexpected packets.'
    ].join('\n\n'),
    examples: [
      'sudo iptables -L -v',
      'sudo nft list ruleset',
      'sudo conntrack -L'
    ]
  },
  {
    topicId: 'basic-nat-snat-dnat',
    title: 'Basic NAT (SNAT, DNAT, Masquerading)',
    content: 'NAT concepts and firewall translation rules: SNAT, DNAT, and masquerading for IPv4 egress/ingress.',
    explanation: [
      'Network Address Translation (NAT) allows private IP addresses to communicate on the internet. SNAT changes the source IP, letting many internal devices share a single public IP. This is essential for home routers, corporate gateways, and cloud load balancers. Masquerading is a dynamic form of SNAT where the outbound interface automatically determines the public IP.',
      'DNAT, on the other hand, modifies the destination IP, commonly used for port forwarding. It allows external users to reach internal servers like web servers, SSH servers, or CCTV systems. NAT is a foundational concept for firewalls because it hides internal networks, conserves public IPs, and defines controlled access points.'
    ].join('\n\n'),
    examples: [
      'sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
      'sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to 192.168.0.10:80'
    ]
  },
  {
    topicId: 'port-forwarding-hairpin-nat',
    title: 'Port Forwarding & Hairpin NAT',
    content: 'Expose internal services via DNAT and support internal loopback access with hairpin NAT (DNAT+SNAT).',
    explanation: [
      'Port forwarding is used to allow external users to reach internal devices that do not have public IPs. Firewall NAT rules map ports like 80, 22, or 443 to internal servers. This is commonly used for remote SSH access, hosting websites, game servers, CCTV streams, and IoT devices. Port forwarding must be carefully configured to avoid exposing vulnerable systems.',
      'Hairpin NAT allows internal devices to access a public IP that refers to a service inside the same network. Without hairpinning, internal-to-internal traffic would fail because packets would bounce incorrectly. Firewalls implement both DNAT and SNAT simultaneously to fix this loopback behavior.'
    ].join('\n\n'),
    examples: [
      'sudo iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -d 192.168.0.10 -j MASQUERADE',
      'sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j DNAT --to 192.168.0.10'
    ]
  },
  {
    topicId: 'network-monitoring-netdata',
    title: 'Network Monitoring with Netdata',
    content: 'Real-time system, network, and app metrics; dashboards, alarms, and anomaly detection.',
    explanation: [
      'Netdata is a real-time performance monitoring tool designed for systems, networks, and applications. It provides second-by-second metrics with an interactive web dashboard showing bandwidth usage, packet drops, firewall activity, CPU load, disk I/O, and more. It is lightweight and ideal for diagnosing performance bottlenecks or attacks like DoS or brute force attempts.',
      'Admins prefer Netdata because it supports alarms, anomaly detection, and distributed monitoring across multiple servers. It can detect spikes in TCP connections, latency, SYN floods, routing errors, or hardware bottlenecks instantly. For home labs and professional infrastructure, Netdata is one of the simplest monitoring solutions.'
    ].join('\n\n'),
    examples: [
      'bash <(curl -Ss https://my-netdata.io/kickstart.sh)',
      'sudo systemctl status netdata'
    ]
  },
  {
    topicId: 'network-monitoring-vnstat',
    title: 'Network Monitoring with vnStat',
    content: 'Lightweight bandwidth accounting using kernel interface counters; daily, monthly, yearly views.',
    explanation: [
      'vnStat is a lightweight bandwidth monitoring tool that logs traffic over long periods using minimal system resources. Instead of capturing packets, it reads interface statistics from the kernel, making it ideal for servers and routers where performance is critical. It keeps daily, monthly, and yearly network usage reports.',
      'Network administrators use vnStat for data usage auditing, planning bandwidth upgrades, and identifying unusual network behavior. Since it stores historical data, it is excellent for long-term capacity planning and ISP speed verification.'
    ].join('\n\n'),
    examples: [
      'sudo apt install vnstat',
      'vnstat -l',
      'vnstat -d',
      'vnstat -m'
    ]
  },
  {
    topicId: 'ids-vs-ips-snort-suricata',
    title: 'IDS vs IPS (Snort, Suricata)',
    content: 'Threat detection vs prevention; alerting-only IDS and real-time blocking IPS modes.',
    explanation: [
      'Intrusion Detection Systems (IDS) monitor network traffic for threats, suspicious patterns, or violations of policies. They detect malware, scanning attempts, brute-force attacks, and abnormal packet signatures. An IDS only alerts but does not block traffic, making it ideal for monitoring and forensic analysis.',
      'Intrusion Prevention Systems (IPS) go a step further by actively blocking malicious traffic. Tools like Snort and Suricata can operate in IPS mode, dropping packets in real time. IPS requires careful configuration to avoid false positives that might disrupt legitimate traffic.'
    ].join('\n\n'),
    examples: [
      'sudo snort -A console -i eth0',
      'sudo suricata -i eth0 -v'
    ]
  },
  {
    topicId: 'traffic-shaping-qos-tc-fq_codel',
    title: 'Traffic Shaping & QoS (tc, fq_codel)',
    content: 'Control bandwidth and latency with Linux tc; prioritize services and mitigate bufferbloat with fq_codel.',
    explanation: [
      'Traffic shaping is used to control network bandwidth, prioritize certain types of traffic, and manage congestion. Tools like tc allow administrators to limit upload/download rates or give priority to voice, video, or gaming traffic. QoS ensures smooth performance even under heavy load by preventing bufferbloat and packet drops.',
      'Modern systems use algorithms like fq_codel to eliminate latency caused by queue buildup. Organizations apply QoS rules on routers, firewalls, and switches to maintain consistent performance for critical services.'
    ].join('\n\n'),
    examples: [
      'tc qdisc add dev eth0 root fq_codel',
      'tc qdisc add dev eth0 root tbf rate 5mbit burst 10kb latency 50ms',
      'tc qdisc show dev eth0'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    const count = (result.topics || []).length;
    console.log(`✅ Upserted '${ASSIGNMENT_ID}' — topics=${count}`);
    (result.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      const cmdCount = (t.examples || []).length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId} | contentLen=${len} | cmds=${cmdCount}`);
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