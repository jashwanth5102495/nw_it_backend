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

const newTopics = [
  {
    topicId: 'linux-bridge-networking',
    title: 'Linux Bridge Networking (brctl / ip link)',
    content: 'Linux bridges act like virtual switches, forwarding Ethernet frames and learning MACs for VMs/containers.',
    explanation: [
      'A Linux bridge works like a virtual switch, allowing VMs, containers, and hosts to communicate as if connected to a real network switch. Bridges forward Ethernet frames and maintain MAC tables. They are heavily used in virtualization platforms like KVM, Proxmox, and Docker/Kubernetes.',
      'Administrators use bridges to separate networks, connect virtual networks to physical interfaces, or simulate enterprise switching. Bridges allow full control over MAC learning, STP, VLAN tagging, and forwarding behavior.'
    ].join('\n\n'),
    examples: [
      'brctl addbr br0',
      'brctl addif br0 eth0',
      'ip link set br0 up'
    ]
  },
  {
    topicId: 'system-load-network-bottleneck-detection',
    title: 'System Load & Network Bottleneck Detection',
    content: 'Correlate CPU, RAM, and I/O with network throughput to find bottlenecks, IRQ overload, or packet drops.',
    explanation: [
      'Network bottlenecks often arise when CPU, RAM, or I/O performance cannot keep up with high data flow. Tools like top, htop, iostat, and sar help pinpoint whether slow speeds result from system limits or network issues. Many times, slow file transfers or latency spikes come from CPU-bound encryption, high interrupts, or overloaded network interfaces.',
      'Admins must understand how to correlate system performance metrics with network activity. High system load, IRQ overload, or packet drops reveal deeper issues behind network slowness. This forms the foundation of advanced troubleshooting.'
    ].join('\n\n'),
    examples: [
      'htop',
      'iostat -x',
      'sar -n DEV 1'
    ]
  },
  {
    topicId: 'switch-port-security-mac-filtering',
    title: 'Switch Port Security & MAC Filtering',
    content: 'Restrict port access via MAC address limits and sticky MAC; block unknown devices to enhance LAN security.',
    explanation: [
      'Port security is used on managed switches to control which MAC addresses can connect to a specific port. This prevents unauthorized devices from accessing the network. Switches can limit MAC count, define allowed addresses, and block unknown devices. This enhances LAN security by eliminating plug-and-play attacks.',
      'MAC filtering is commonly used in enterprise environments, guest networks, and sensitive departments. Port security can trigger alerts or shut down a port entirely when violations occur. It is a key part of physical network defense.'
    ].join('\n\n'),
    examples: [
      'switch(config)# interface fa0/1',
      'switch(config-if)# switchport port-security',
      'switch(config-if)# switchport port-security maximum 1',
      'switch(config-if)# switchport port-security mac-address sticky'
    ]
  },
  {
    topicId: 'arp-spoofing-prevention',
    title: 'ARP Spoofing Prevention',
    content: 'Detect and mitigate MITM via ARP poisoning using inspection, static entries, VLAN segmentation, and encryption.',
    explanation: [
      'ARP spoofing allows attackers to redirect traffic by poisoning ARP tables and pretending to be the gateway. This is used in MITM attacks, session hijacking, credential theft, and sniffing unencrypted traffic. Defending against ARP spoofing is crucial in enterprise and campus networks.',
      'Admins implement dynamic ARP inspection, static ARP entries, VLAN segmentation, and encrypted protocols to prevent manipulation. Monitoring ARP tables and alerts is essential to detect ongoing attacks.'
    ].join('\n\n'),
    examples: [
      'arp -an',
      'ip neigh',
      'arping -c 5 192.168.1.1'
    ]
  },
  {
    topicId: 'dhcp-snooping',
    title: 'DHCP Snooping',
    content: 'Prevent rogue DHCP servers by trusting only specific ports and building secure IP-MAC-port bindings.',
    explanation: [
      'DHCP snooping prevents rogue DHCP servers from assigning incorrect IP addresses on the network. Attackers can use fake DHCP servers to hijack traffic or disrupt connectivity. DHCP snooping ensures only trusted ports can send DHCP offers, protecting clients from malicious configurations.',
      'This security feature builds a secure IP-MAC-port binding table, which also integrates with other protections like ARP inspection. It is widely used on enterprise switches to protect large networks.'
    ].join('\n\n'),
    examples: [
      'switch(config)# ip dhcp snooping',
      'switch(config)# ip dhcp snooping vlan 10',
      'switch(config)# interface fa0/1',
      'switch(config-if)# ip dhcp snooping trust'
    ]
  },
  {
    topicId: 'wireless-security-wpa2-wpa3-psk-enterprise',
    title: 'Wireless Security (WPA2/WPA3, PSK, Enterprise)',
    content: 'Secure Wi‑Fi with WPA2/WPA3; PSK for small sites; Enterprise uses EAP/RADIUS for centralized auth.',
    explanation: [
      'Wireless security has evolved from insecure methods like WEP to strong encryption protocols like WPA2 and WPA3. WPA2-PSK is used in homes and small offices, while WPA3 adds modern cryptography and resistance against offline brute-force attacks. Enterprise networks use WPA2-EAP or WPA3-Enterprise with authentication servers (RADIUS).',
      'Understanding wireless security is essential because Wi-Fi is a common attack vector. Admins must protect networks against deauthentication attacks, rogue APs, handshake capture, and weak passwords.'
    ].join('\n\n'),
    examples: [
      'nmcli dev wifi list',
      'nmcli dev wifi connect "SSID" password "mypassword"',
      'airmon-ng check kill'
    ]
  },
  {
    topicId: 'netfilter-logging-packet-tracing',
    title: 'Netfilter Logging & Packet Tracing',
    content: 'Log accepted/blocked packets and trace kernel hooks to debug firewall, NAT, and routing behavior.',
    explanation: [
      'Netfilter provides detailed logs about accepted, blocked, or forwarded packets. Logging helps identify attacks, misconfigurations, and blocked services. Administrators analyze logs to understand firewall behavior and troubleshoot connectivity issues. Packet-level logging is essential during DDOS attacks or debugging NAT rules.',
      'Tools like ulogd and trace-cmd help capture granular packet flow through kernel hooks. These logs give deep insight into how Linux handles routing, filtering, and packet transformations.'
    ].join('\n\n'),
    examples: [
      'iptables -A INPUT -j LOG --log-prefix "DROP: "',
      'sudo tail -f /var/log/kern.log',
      'sudo conntrack -E'
    ]
  },
  {
    topicId: 'speed-latency-testing-iperf3',
    title: 'Speed & Latency Testing (iperf3)',
    content: 'Measure bandwidth, jitter, loss, and latency across Wi‑Fi/LAN/WAN/VPN to diagnose bottlenecks.',
    explanation: [
      'iperf3 is a network performance testing tool that measures bandwidth, jitter, packet loss, and latency. It is commonly used in data centers, enterprise networks, and troubleshooting sessions. iperf3 allows controlled tests over TCP or UDP and helps identify bottlenecks in Wi-Fi, LAN, WAN, VLAN, or VPN connections.',
      'Engineers run iperf tests before and after network changes to benchmark the impact. It is also essential for capacity planning and detecting physical layer issues.'
    ].join('\n\n'),
    examples: [
      'iperf3 -s',
      'iperf3 -c 192.168.1.10',
      'iperf3 -u -c 192.168.1.10 -b 100M'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byId = new Map(existing.map(t => [t.topicId || t.id || t.title, t]));

    // Merge: update existing by topicId; add new if missing
    newTopics.forEach(nt => {
      const key = nt.topicId;
      if (byId.has(key)) {
        const cur = byId.get(key);
        cur.title = nt.title;
        cur.content = nt.content;
        cur.explanation = nt.explanation;
        cur.examples = nt.examples;
      } else {
        byId.set(key, { topicId: nt.topicId, title: nt.title, content: nt.content, explanation: nt.explanation, examples: nt.examples });
      }
    });

    // Preserve order: keep existing first seven; append 8–15 in provided order
    const ordered = [];
    const firstIds = (existing.map(t => t.topicId)).filter(Boolean);
    firstIds.forEach(id => { const v = byId.get(id); if (v) ordered.push(v); });
    newTopics.forEach(nt => { const v = byId.get(nt.topicId); if (v && !ordered.find(x => (x.topicId||x.id) === nt.topicId)) ordered.push(v); });

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { topics: ordered, updatedAt: new Date() } },
      { new: true }
    );

    const count = (result.topics || []).length;
    console.log(`✅ Topics appended for '${ASSIGNMENT_ID}'. Count=${count}`);
    (result.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      const cmdCount = (t.examples || []).length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId || t.id || 'n/a'} | contentLen=${len} | cmds=${cmdCount}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error appending topics 8–15:', err?.message || err);
    try{ await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

run();