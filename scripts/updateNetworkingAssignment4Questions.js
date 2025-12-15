require('dotenv').config();
const mongoose = require('mongoose');

// Force default to jasnav_projects to match backend server config
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-4';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Assignment 4 — System Performance & Network Operations Monitoring (MCQs)
const questions = [
  { questionId: 1,  prompt: 'Which tool is primarily used to measure actual network throughput between two devices?', options: ['ping', 'iperf3', 'traceroute', 'ethtool'], correctAnswer: 1 },
  { questionId: 2,  prompt: 'Which command shows live bandwidth usage in real time?', options: ['nload', 'ss', 'lsof', 'ip addr'], correctAnswer: 0 },
  { questionId: 3,  prompt: 'The top command is mainly used to monitor:', options: ['Routing tables', 'Process resource consumption', 'MTU values', 'DNS queries'], correctAnswer: 1 },
  { questionId: 4,  prompt: 'High CPU load can directly affect network performance by:', options: ['Increasing file permissions', 'Reducing packet processing speed', 'Decreasing RAM size', 'Increasing disk capacity'], correctAnswer: 1 },
  { questionId: 5,  prompt: 'Which tool helps identify disk bottlenecks affecting network services?', options: ['ifconfig', 'iostat', 'tcpdump', 'traceroute'], correctAnswer: 1 },
  { questionId: 6,  prompt: 'ss -tulpn displays:', options: ['DNS logs', 'Packet captures', 'Open ports and listening services', 'Disk partitions'], correctAnswer: 2 },
  { questionId: 7,  prompt: 'To monitor NetworkManager logs, which command is used?', options: ['top', 'dmesg', 'journalctl -u NetworkManager', 'traceroute'], correctAnswer: 2 },
  { questionId: 8,  prompt: 'Cronjobs are used for:', options: ['Real-time packet capture', 'Scheduling automated tasks', 'Increasing RAM speed', 'Testing firewall logs'], correctAnswer: 1 },
  { questionId: 9,  prompt: 'Which tool displays per-process bandwidth usage?', options: ['nethogs', 'ping', 'uname', 'bmon'], correctAnswer: 0 },
  { questionId: 10, prompt: 'MTU represents:', options: ['Maximum Transmission Unit', 'Minimum Transfer Utility', 'Maximum Trace Utility', 'Multipath Transaction Unit'], correctAnswer: 0 },
  { questionId: 11, prompt: 'Which command helps test MTU issues?', options: ['ping -M do -s 1472 8.8.8.8', 'ss -ant', 'tcpdump -i eth0', 'uname -r'], correctAnswer: 0 },
  { questionId: 12, prompt: 'Which tool shows NIC speed, duplex, and driver info?', options: ['iftop', 'ethtool', 'nload', 'ps'], correctAnswer: 1 },
  { questionId: 13, prompt: 'iftop primarily displays:', options: ['Running kernel version', 'Disk access speed', 'Real-time host-to-host bandwidth usage', 'Open network ports'], correctAnswer: 2 },
  { questionId: 14, prompt: 'Which command shows memory usage relevant to network buffering?', options: ['free -h', 'traceroute', 'tcpdump', 'ip route'], correctAnswer: 0 },
  { questionId: 15, prompt: 'tcpdump is used for:', options: ['Editing firewall rules', 'Packet capture and analysis', 'Creating cronjobs', 'Adjusting MTU values'], correctAnswer: 1 },
  { questionId: 16, prompt: 'What does the command tcpdump -w file.pcap do?', options: ['Writes packets to a Wireshark-readable file', 'Displays routing table', 'Starts SSH service', 'Clears system logs'], correctAnswer: 0 },
  { questionId: 17, prompt: 'Which command lists processes using port 22?', options: ['ss -tulpn', 'lsof -i :22', 'bmon', 'iperf3 -s'], correctAnswer: 1 },
  { questionId: 18, prompt: 'High I/O wait in iostat indicates:', options: ['GPU overheating', 'Network card failure', 'Slow storage affecting performance', 'DNS cache malfunction'], correctAnswer: 2 },
  { questionId: 19, prompt: 'Which tool is used in ISP-grade traffic accounting?', options: ['pmacct', 'traceroute', 'htop', 'uname'], correctAnswer: 0 },
  { questionId: 20, prompt: 'Which command shows real-time processes consuming CPU per core?', options: ['mpstat 1', 'ping 8.8.8.8', 'traceroute google.com', 'df -h'], correctAnswer: 0 }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update questions and passing threshold (require >60% to complete)
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