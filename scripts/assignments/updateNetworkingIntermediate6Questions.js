require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentUpdateInt6Q', assignmentSchema, 'assignments');

const questions = [
  {
    questionId: 1,
    prompt: 'What is the primary goal of network monitoring?',
    options: [
      'Increase bandwidth',
      'Detect issues and ensure availability',
      'Replace firewalls',
      'Encrypt traffic'
    ],
    correctAnswer: 1
  },
  {
    questionId: 2,
    prompt: 'What is passive monitoring based on?',
    options: [
      'Sending probes',
      'Capturing existing traffic',
      'Blocking packets',
      'Encrypting logs'
    ],
    correctAnswer: 1
  },
  {
    questionId: 3,
    prompt: 'Which SNMP version provides encryption and authentication?',
    options: [
      'SNMPv1',
      'SNMPv2',
      'SNMPv3',
      'SNMPv0'
    ],
    correctAnswer: 2
  },
  {
    questionId: 4,
    prompt: 'Why is centralized monitoring important in enterprises?',
    options: [
      'It reduces routing complexity',
      'It provides a single visibility point',
      'It replaces switches',
      'It blocks attacks'
    ],
    correctAnswer: 1
  },
  {
    questionId: 5,
    prompt: 'What is the main role of Nagios plugins?',
    options: [
      'Route traffic',
      'Perform monitoring checks',
      'Encrypt logs',
      'Assign IP addresses'
    ],
    correctAnswer: 1
  },
  {
    questionId: 6,
    prompt: 'What makes Zabbix suitable for large environments?',
    options: [
      'Manual configuration',
      'Template-based automation',
      'No alerting',
      'Limited scalability'
    ],
    correctAnswer: 1
  },
  {
    questionId: 7,
    prompt: 'Why is log rotation important?',
    options: [
      'Improve routing',
      'Prevent disk space exhaustion',
      'Encrypt logs',
      'Reduce CPU usage'
    ],
    correctAnswer: 1
  },
  {
    questionId: 8,
    prompt: 'What do bandwidth monitoring tools help identify?',
    options: [
      'DNS errors',
      'Traffic usage and congestion',
      'Encryption strength',
      'Routing loops'
    ],
    correctAnswer: 1
  },
  {
    questionId: 9,
    prompt: 'What is a network baseline used for?',
    options: [
      'Assigning IPs',
      'Detecting anomalies',
      'Blocking traffic',
      'Routing packets'
    ],
    correctAnswer: 1
  },
  {
    questionId: 10,
    prompt: 'Why is anomaly detection critical?',
    options: [
      'It improves encryption',
      'It speeds up routing',
      'It enables early issue and attack detection',
      'It replaces monitoring'
    ],
    correctAnswer: 2
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const beforeLen = Array.isArray(before?.questions) ? before.questions.length : 0;
    console.log('Before questions length:', beforeLen);

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { questions, totalQuestions: questions.length, passingPercentage: 60, updatedAt: new Date() } }
    );
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const afterLen = Array.isArray(after?.questions) ? after.questions.length : 0;
    console.log('After questions length:', afterLen);
    console.log(`✅ Updated questions for ${ASSIGNMENT_ID} Total: ${questions.length} Passing %: 60`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();