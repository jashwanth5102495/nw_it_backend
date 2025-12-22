require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// MCQs for Assignment 2 from spec
// correctAnswer is zero-based index of the correct option (a=0, b=1, c=2, d=3)
const questions = [
  {
    questionId: 1,
    prompt: 'What is the main difference between a stateful and stateless firewall?',
    options: [
      'Stateful firewalls use encryption',
      'Stateless firewalls are faster and more secure',
      'Stateful firewalls track connection states',
      'Stateless firewalls use routing tables'
    ],
    correctAnswer: 2
  },
  {
    questionId: 2,
    prompt: 'Which Linux component is responsible for tracking active network connections?',
    options: [
      'iptables',
      'netfilter',
      'conntrack',
      'syslog'
    ],
    correctAnswer: 2
  },
  {
    questionId: 3,
    prompt: 'What does the connection state “ESTABLISHED” indicate?',
    options: [
      'A new incoming connection',
      'An invalid packet',
      'A packet belonging to an existing connection',
      'A blocked connection'
    ],
    correctAnswer: 2
  },
  {
    questionId: 4,
    prompt: 'Why is firewall rule ordering important?',
    options: [
      'It improves DNS resolution',
      'Firewall rules are executed randomly',
      'Rules are evaluated sequentially',
      'It affects IP address allocation'
    ],
    correctAnswer: 2
  },
  {
    questionId: 5,
    prompt: 'What is the primary purpose of rate limiting in firewall rules?',
    options: [
      'Increase network speed',
      'Encrypt traffic',
      'Prevent brute-force and flood attacks',
      'Allow unlimited connections'
    ],
    correctAnswer: 2
  },
  {
    questionId: 6,
    prompt: 'Why are temporary IP blocking mechanisms preferred over permanent blocks?',
    options: [
      'They reduce firewall rule size',
      'They allow legitimate users to regain access',
      'They require no logging',
      'They consume less memory'
    ],
    correctAnswer: 1
  },
  {
    questionId: 7,
    prompt: 'What is a key benefit of time-based firewall rules?',
    options: [
      'They reduce CPU usage',
      'They allow dynamic port scanning',
      'They enforce access based on time policies',
      'They improve routing efficiency'
    ],
    correctAnswer: 2
  },
  {
    questionId: 8,
    prompt: 'What is the main limitation of Geo-IP based firewall filtering?',
    options: [
      'It cannot block traffic',
      'IP locations are always accurate',
      'It can be bypassed using VPNs or proxies',
      'It works only on IPv6'
    ],
    correctAnswer: 2
  },
  {
    questionId: 9,
    prompt: 'Why is excessive firewall logging considered risky?',
    options: [
      'It disables firewall rules',
      'It can consume system resources and hide important events',
      'It blocks legitimate traffic',
      'It breaks routing tables'
    ],
    correctAnswer: 1
  },
  {
    questionId: 10,
    prompt: 'What is the primary goal of firewall hardening?',
    options: [
      'Increase network throughput',
      'Reduce routing complexity',
      'Minimize attack surface and enforce least privilege',
      'Allow all incoming traffic'
    ],
    correctAnswer: 2
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!before) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }
    console.log('Before:', { title: before.title, totalQuestions: Array.isArray(before.questions) ? before.questions.length : 0, passingPercentage: before.passingPercentage });

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      {
        $set: {
          questions,
          passingPercentage: 60
        }
      }
    );

    console.log('Update result:', { matched: res.matchedCount, modified: res.modifiedCount });

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After:', { totalQuestions: Array.isArray(after.questions) ? after.questions.length : 0, passingPercentage: after.passingPercentage });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();