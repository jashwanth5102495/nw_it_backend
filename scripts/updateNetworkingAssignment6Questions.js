require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-6';

// Flexible schema to update questions only
const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const questions = [
  { questionId: 1,  prompt: 'Which firewall type maintains a connection table and tracks session states?', options: ['Stateless firewall', 'Packet filter', 'Stateful firewall', 'Proxy server'], correctAnswer: 2 },
  { questionId: 2,  prompt: 'Which NAT technique automatically uses the outbound interface IP?', options: ['DNAT', 'SNAT', 'PAT', 'Masquerading'], correctAnswer: 3 },
  { questionId: 3,  prompt: 'Port forwarding internally sending traffic back to the same LAN network is known as:', options: ['Split tunneling', 'Proxy NAT', 'Hairpin NAT', 'Masquerading'], correctAnswer: 2 },
  { questionId: 4,  prompt: 'Which tool provides real-time system and network monitoring through a web dashboard?', options: ['Netcat', 'Netdata', 'tcpdump', 'Nmap'], correctAnswer: 1 },
  { questionId: 5,  prompt: 'Which command displays daily bandwidth usage in vnStat?', options: ['vnstat -h', 'vnstat -l', 'vnstat -d', 'vnstat -i'], correctAnswer: 2 },
  { questionId: 6,  prompt: 'Which of the following is an IDS/IPS tool?', options: ['iperf', 'Snort', 'wget', 'dig'], correctAnswer: 1 },
  { questionId: 7,  prompt: 'Which Linux command applies the fq_codel queue discipline to reduce latency?', options: ['tc qdisc add dev eth0 root fq_codel', 'ip link add fq_codel', 'iftop -codel', 'codel -apply'], correctAnswer: 0 },
  { questionId: 8,  prompt: 'A Linux bridge functions similarly to a:', options: ['Router', 'Firewall', 'Switch', 'Proxy'], correctAnswer: 2 },
  { questionId: 9,  prompt: 'Which tool is best for checking system load and CPU bottlenecks?', options: ['htop', 'traceroute', 'dig', 'Wireshark'], correctAnswer: 0 },
  { questionId: 10, prompt: 'Switch port security prevents:', options: ['DNS poisoning', 'Unauthorized MAC addresses', 'ARP spoofing', 'DHCP starvation'], correctAnswer: 1 },
  { questionId: 11, prompt: 'Which feature prevents rogue DHCP servers in a network?', options: ['DNSSEC', 'ARP Cache', 'DHCP Snooping', 'Port trunking'], correctAnswer: 2 },
  { questionId: 12, prompt: 'ARP spoofing attacks can be detected using which command?', options: ['ip neigh', 'dig', 'netstat -an', 'dhclient'], correctAnswer: 0 },
  { questionId: 13, prompt: 'Which Wi-Fi security protocol is currently the most secure?', options: ['WEP', 'WPA', 'WPA2', 'WPA3'], correctAnswer: 3 },
  { questionId: 14, prompt: 'Which command enables wireless interface scanning on Linux?', options: ['nmcli dev wifi list', 'netstat -wlan', 'arp-scan -wifi', 'iftop -w'], correctAnswer: 0 },
  { questionId: 15, prompt: 'Which command logs dropped packets using Netfilter?', options: ['tcpdump -log', 'iptables -L -dropped', 'iptables -A INPUT -j LOG', 'nft log input'], correctAnswer: 2 },
  { questionId: 16, prompt: 'iperf3 is primarily used for:', options: ['Packet filtering', 'Bandwidth and latency testing', 'Malware detection', 'DNS resolution'], correctAnswer: 1 },
  { questionId: 17, prompt: 'Which protocol change does DNAT typically handle?', options: ['Changing source IP', 'Changing destination IP', 'Encrypting packets', 'Compressing traffic'], correctAnswer: 1 },
  { questionId: 18, prompt: 'Suricata can operate in which mode?', options: ['Router', 'DNS-server', 'IDS/IPS', 'DHCP client'], correctAnswer: 2 },
  { questionId: 19, prompt: 'fq_codel is used to reduce:', options: ['DNS latency', 'Bufferbloat', 'Wi-Fi range', 'DHCP issues'], correctAnswer: 1 },
  { questionId: 20, prompt: 'The command conntrack -L is used to:', options: ['Clear logs', 'View active network connections tracked by the firewall', 'Update routing tables', 'Restart network services'], correctAnswer: 1 },
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const updated = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { questions, updatedAt: new Date() } },
      { new: true }
    );

    console.log(`✅ Updated questions for '${ASSIGNMENT_ID}'. Total=${updated.questions?.length || 0}`);
    (updated.questions || []).forEach((q) => {
      console.log(`Q${q.questionId}: ${q.prompt}`);
      console.log('  correctAnswer index:', q.correctAnswer);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating questions:', err?.message || err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();