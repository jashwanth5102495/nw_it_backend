require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-5';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const questions = [
  { questionId: 1, prompt: 'Which Linux command is used to capture live packets directly from the terminal?', options: ['tcpdump', 'netcatch', 'snifferctl', 'tracecap'], correctAnswer: 0 },
  { questionId: 2, prompt: 'In tcpdump, what does the option -i any do?', options: ['Captures only wireless packets', 'Captures packets from the default interface', 'Captures packets from all network interfaces', 'Captures packets only from loopback'], correctAnswer: 2 },
  { questionId: 3, prompt: 'Which command displays layer-2 neighbor information?', options: ['arp -s', 'ip neigh', 'ip ntable', 'netdiscover'], correctAnswer: 1 },
  { questionId: 4, prompt: 'The ARP table stores mappings between:', options: ['IP → Port', 'IP → MAC', 'Port → Service', 'MAC → Hostname'], correctAnswer: 1 },
  { questionId: 5, prompt: 'Which command shows active TCP/UDP sessions in modern Linux systems?', options: ['netstat', 'ss', 'socketmon', 'lsofports'], correctAnswer: 1 },
  { questionId: 6, prompt: 'What does ss -lnt display?', options: ['Listening IPv6 connections', 'Listening TCP connections', 'Listening UDP connections', 'Closed TCP ports'], correctAnswer: 1 },
  { questionId: 7, prompt: 'Which tool is used to view open ports and processes accessing them?', options: ['ps -aux', 'ss -nt', 'lsof -i', 'nettop'], correctAnswer: 2 },
  { questionId: 8, prompt: 'What is the primary purpose of /etc/hosts?', options: ['DNS caching', 'Local hostname → IP mapping', 'DHCP lease tracking', 'Storing MAC addresses'], correctAnswer: 1 },
  { questionId: 9, prompt: 'Which tool displays DNS lookup results including TTL and authoritative servers?', options: ['curl', 'dig', 'dnslookup', 'dnstat'], correctAnswer: 1 },
  { questionId: 10, prompt: 'What is a key difference between dig and nslookup?', options: ['dig is deprecated', 'nslookup shows registry data', 'dig provides more detailed DNS information', 'nslookup only checks IPv6 records'], correctAnswer: 2 },
  { questionId: 11, prompt: 'In firewall logs, which keyword commonly indicates a blocked packet?', options: ['ACCEPT', 'ALLOW', 'DROP', 'ENABLE'], correctAnswer: 2 },
  { questionId: 12, prompt: 'Which command displays the last 50 lines of a log file in real-time?', options: ['grep -r', 'tail -f', 'head -50', 'cat -f'], correctAnswer: 1 },
  { questionId: 13, prompt: 'Which protocol primarily uses port 67/68?', options: ['DNS', 'NTP', 'DHCP', 'FTP'], correctAnswer: 2 },
  { questionId: 14, prompt: 'What command shows active DHCP leases in Linux?', options: ['nmcli dhcp show', 'cat /var/lib/dhcp/dhclient.leases', 'dhcpstatus --list', 'ip dhcp status'], correctAnswer: 1 },
  { questionId: 15, prompt: 'VLAN tagging uses which IEEE standard?', options: ['802.1ac', '802.1w', '802.1Q', '802.11ax'], correctAnswer: 2 },
  { questionId: 16, prompt: 'Which command lists VLAN interfaces on Linux?', options: ['ip vlan list', 'ip link show', 'vlanctl show', 'vconfig list'], correctAnswer: 3 },
  { questionId: 17, prompt: 'The command tcpdump -n -i eth0 port 80 captures:', options: ['HTTPS packets', 'DNS packets', 'HTTP traffic on eth0', 'All broadcast packets'], correctAnswer: 2 },
  { questionId: 18, prompt: 'Which tool helps verify hostname resolution issues?', options: ['ping', 'host', 'curl', 'ifconfig'], correctAnswer: 1 },
  { questionId: 19, prompt: 'A sudden increase in SYN_RECV states indicates:', options: ['Misconfigured DNS', 'Slow WiFi', 'SYN flood attack', 'Weak encryption'], correctAnswer: 2 },
  { questionId: 20, prompt: 'Which file is used to configure static network interfaces in Debian-based systems?', options: ['/etc/network/interfaces', '/etc/sysconfig/network', '/etc/net-static', '/etc/linux-net/ifcfg'], correctAnswer: 0 },
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const exists = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!exists) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      {
        $set: {
          questions: questions,
          totalQuestions: questions.length,
          passingPercentage: 60,
          updatedAt: new Date(),
        },
      }
    );

    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const check = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('Post-update snapshot:', {
      title: check?.title,
      topics: Array.isArray(check?.topics) ? check.topics.length : 0,
      questions: Array.isArray(check?.questions) ? check.questions.length : 0,
      passingPercentage: check?.passingPercentage,
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Force update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();