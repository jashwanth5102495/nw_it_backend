require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// MCQs provided by user (20)
// Note: correctAnswer is the zero-based index of the correct option.
const questions = [
  { questionId: 1,  prompt: "Which TCP state indicates the server is waiting for the client’s ACK after receiving SYN?", options: ['ESTABLISHED', 'TIME_WAIT', 'SYN_RECV', 'CLOSE_WAIT'], correctAnswer: 2 },
  { questionId: 2,  prompt: 'A large number of TIME_WAIT connections generally indicates:', options: ['SYN flood attack', 'Normal connection closure', 'Application crash', 'DNS failure'], correctAnswer: 1 },
  { questionId: 3,  prompt: 'Which command shows all TCP connections including their states?', options: ['netstat -r', 'ss -ant', 'ip a', 'top'], correctAnswer: 1 },
  { questionId: 4,  prompt: 'Which IPTables chain is used to filter incoming packets?', options: ['OUTPUT', 'NAT', 'INPUT', 'MANGLE'], correctAnswer: 2 },
  { questionId: 5,  prompt: 'Which IPTables command allows incoming SSH traffic?', options: ['iptables -A INPUT -j DROP', 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT', 'iptables -A OUTPUT -p udp --dport 22 -j ACCEPT', 'iptables -A FORWARD -p tcp --dport 22 -j ACCEPT'], correctAnswer: 1 },
  { questionId: 6,  prompt: 'Which log file records SSH login attempts on Linux?', options: ['/var/log/kern.log', '/var/log/auth.log', '/var/log/network.log', '/var/log/boot.log'], correctAnswer: 1 },
  { questionId: 7,  prompt: 'What does the command tail -f /var/log/syslog do?', options: ['Deletes the log file', 'Shows log file size', 'Monitors log updates in real time', 'Archives the log file'], correctAnswer: 2 },
  { questionId: 8,  prompt: 'Which tool allows crafting custom TCP packets?', options: ['ping', 'traceroute', 'hping3', 'mtr'], correctAnswer: 2 },
  { questionId: 9,  prompt: 'Which hping3 command sends a SYN packet to port 80?', options: ['hping3 -1', 'hping3 -S -p 80', 'hping3 --udp', 'hping3 --scan'], correctAnswer: 1 },
  { questionId: 10, prompt: 'Which tool provides real-time packet loss and latency per hop?', options: ['netstat', 'mtr', 'ping', 'dig'], correctAnswer: 1 },
  { questionId: 11, prompt: 'Which command uses ICMP mode in traceroute?', options: ['traceroute -U', 'traceroute -T', 'traceroute -I', 'traceroute -M'], correctAnswer: 2 },
  { questionId: 12, prompt: 'systemd-networkd configuration files are stored in:', options: ['/etc/netplan', '/etc/network/interfaces', '/etc/systemd/network/', '/etc/systemd/system/'], correctAnswer: 2 },
  { questionId: 13, prompt: 'Which command restarts systemd-networkd?', options: ['systemctl reload networking', 'networkctl restart', 'systemctl restart systemd-networkd', 'ip restart'], correctAnswer: 2 },
  { questionId: 14, prompt: 'Which file type defines network interfaces for systemd-networkd?', options: ['.iface', '.network', '.linkonly', '.routes'], correctAnswer: 1 },
  { questionId: 15, prompt: 'Network namespaces allow:', options: ['Only separate DNS servers', 'Only separate MAC addresses', 'Full isolated network stacks', 'Only isolated routing tables'], correctAnswer: 2 },
  { questionId: 16, prompt: 'Which command creates a new network namespace?', options: ['ip netns create', 'ip netns add', 'ip create ns', 'iproute ns new'], correctAnswer: 1 },
  { questionId: 17, prompt: 'Which command runs a ping command inside a namespace?', options: ['ping ns1', 'exec ip ns1 ping', 'ip netns exec ns1 ping', 'netns ping ns1'], correctAnswer: 2 },
  { questionId: 18, prompt: 'Which TCP state usually indicates a buggy or stuck application?', options: ['CLOSE_WAIT', 'SYN_SENT', 'TIME_WAIT', 'LISTEN'], correctAnswer: 0 },
  { questionId: 19, prompt: 'Which IPTables table handles NAT operations?', options: ['filter', 'mangle', 'raw', 'nat'], correctAnswer: 3 },
  { questionId: 20, prompt: 'Which command shows real-time status of systemd network interfaces?', options: ['ip monitor', 'netstat -i', 'networkctl', 'ss -l'], correctAnswer: 2 },
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update questions and passing threshold (require >60% to pass)
    assignment.questions = questions.map(q => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    assignment.totalQuestions = questions.length;
    assignment.passingPercentage = 60;

    await assignment.save();
    console.log('✅ Updated questions for', ASSIGNMENT_ID, 'Total:', questions.length, 'Passing %:', assignment.passingPercentage);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Patch failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();