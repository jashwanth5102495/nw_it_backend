require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-1';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// MCQs provided by user (20)
const questions = [
  { questionId: 1,  prompt: 'Which command is the modern replacement for ifconfig?', options: ['netconfig', 'ip', 'netstat', 'ss'], correctAnswer: 1 },
  { questionId: 2,  prompt: 'Which command displays all IP addresses on a Linux machine?', options: ['ip show', 'ip link', 'ip addr', 'show ip'], correctAnswer: 2 },
  { questionId: 3,  prompt: 'Which command brings an interface UP?', options: ['ifconfig eth0 on', 'ip link start eth0', 'ip link set eth0 up', 'ip up eth0'], correctAnswer: 2 },
  { questionId: 4,  prompt: 'What happens when you assign IP using "ip addr add"?', options: ['It becomes permanent', 'It is temporary until reboot', 'It is stored in BIOS', 'It deletes the old IP'], correctAnswer: 1 },
  { questionId: 5,  prompt: 'Which tool shows interface speed and duplex?', options: ['netstat', 'ss', 'ethtool', 'ping'], correctAnswer: 2 },
  { questionId: 6,  prompt: 'Which command displays only link-layer details?', options: ['ip addr', 'ip link', 'ifconfig -l', 'arp -a'], correctAnswer: 1 },
  { questionId: 7,  prompt: 'What does “eth0” represent?', options: ['A hard disk', 'A wireless chipset', 'A network interface', 'A CPU thread'], correctAnswer: 2 },
  { questionId: 8,  prompt: 'Which command disables a network interface?', options: ['ifconfig eth0 disable', 'ip link delete eth0', 'ip link down eth0', 'ifconfig eth0 down'], correctAnswer: 3 },
  { questionId: 9,  prompt: 'Which command shows MAC address?', options: ['ip route', 'ip link show eth0', 'ip mac eth0', 'nslookup'], correctAnswer: 1 },
  { questionId: 10, prompt: 'Which command resets the NetworkManager service?', options: ['nm restart', 'restart net', 'systemctl restart NetworkManager', 'networkctl stop'], correctAnswer: 2 },
  { questionId: 11, prompt: 'What does MTU represent?', options: ['Maximum Track Unit', 'Minimum Transmission Unit', 'Maximum Transmission Unit', 'Maximum Transport Unit'], correctAnswer: 2 },
  { questionId: 12, prompt: 'Which command lists both IPv4 and IPv6 addresses?', options: ['ifconfig all', 'ip addr', 'route -n', 'netstat'], correctAnswer: 1 },
  { questionId: 13, prompt: 'Which command can temporarily change MAC address?', options: ['ip mac', 'ifconfig hw ether', 'macshift', 'macedit'], correctAnswer: 1 },
  { questionId: 14, prompt: 'Which command shows only IPv4 address?', options: ['ip v4', 'ip addr show', 'ip link show ipv4', 'arp -a'], correctAnswer: 1 },
  { questionId: 15, prompt: 'What does DHCP assign?', options: ['Only DNS', 'Only IP', 'IP, Gateway, DNS, Subnet', 'Only MAC'], correctAnswer: 2 },
  { questionId: 16, prompt: 'Which of the following commands is deprecated?', options: ['ip', 'ifconfig', 'ss', 'route'], correctAnswer: 1 },
  { questionId: 17, prompt: 'Which interface naming convention is modern?', options: ['eth0', 'wlan0', 'enp0s3', 'netcard0'], correctAnswer: 2 },
  { questionId: 18, prompt: 'What does “ip addr del” do?', options: ['Deletes the interface', 'Deletes Routing table', 'Deletes assigned IP', 'Restarts the NIC'], correctAnswer: 2 },
  { questionId: 19, prompt: 'Which command shows packet statistics?', options: ['ip link', 'ip net', 'arp show', 'ip stats'], correctAnswer: 0 },
  { questionId: 20, prompt: 'Which is true about ifconfig?', options: ['It is preferred over ip command', 'It supports advanced routing', 'It is deprecated but still usable', 'It works only on Windows'], correctAnswer: 2 }
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

    assignment.questions = questions.map(q => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    assignment.totalQuestions = questions.length;
    assignment.passingPercentage = 60; // Pass at 60% or above

    await assignment.save();
    console.log('✅ Updated questions for', ASSIGNMENT_ID, 'Total:', questions.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Patch failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();