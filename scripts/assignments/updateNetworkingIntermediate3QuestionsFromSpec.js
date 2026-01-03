require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-3';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const questions = [
  {
    questionId: '1',
    prompt: 'What is the primary goal of High Availability (HA) networking?',
    options: [
      'Increase network speed',
      'Reduce hardware cost',
      'Minimize downtime and service disruption',
      'Simplify routing tables'
    ],
    correctAnswer: 2
  },
  {
    questionId: '2',
    prompt: 'Which concept ensures a system continues operating correctly even after a failure occurs?',
    options: [
      'Redundancy',
      'Fault tolerance',
      'Load balancing',
      'Segmentation'
    ],
    correctAnswer: 1
  },
  {
    questionId: '3',
    prompt: 'What does Linux NIC bonding achieve?',
    options: [
      'Encrypts network traffic',
      'Combines multiple NICs into a single logical interface',
      'Filters packets at Layer 7',
      'Assigns IP addresses dynamically'
    ],
    correctAnswer: 1
  },
  {
    questionId: '4',
    prompt: 'Which bonding mode is best suited purely for high availability without load balancing?',
    options: [
      'Round-robin',
      'XOR',
      'Active-backup',
      'LACP'
    ],
    correctAnswer: 2
  },
  {
    questionId: '5',
    prompt: 'What is the key advantage of LACP (802.3ad)?',
    options: [
      'Requires no switch configuration',
      'Supports dynamic link negotiation and load balancing',
      'Works only on wireless networks',
      'Disables redundancy'
    ],
    correctAnswer: 1
  },
  {
    questionId: '6',
    prompt: 'Which mechanism is used to detect physical link failures in Linux bonding?',
    options: [
      'Syslog monitoring',
      'MII monitoring',
      'SNMP traps',
      'DHCP probing'
    ],
    correctAnswer: 1
  },
  {
    questionId: '7',
    prompt: 'Why is STP important in redundant Layer 2 networks?',
    options: [
      'It increases bandwidth',
      'It encrypts traffic',
      'It prevents network loops',
      'It assigns MAC addresses'
    ],
    correctAnswer: 2
  },
  {
    questionId: '8',
    prompt: 'What problem does VRRP primarily solve?',
    options: [
      'Packet filtering',
      'Gateway redundancy',
      'Traffic encryption',
      'Bandwidth throttling'
    ],
    correctAnswer: 1
  },
  {
    questionId: '9',
    prompt: 'What is a split-brain scenario in HA networking?',
    options: [
      'Network congestion',
      'Multiple nodes acting as active simultaneously',
      'Slow routing convergence',
      'Link flapping'
    ],
    correctAnswer: 1
  },
  {
    questionId: '10',
    prompt: 'Why is automatic failback sometimes avoided in HA environments?',
    options: [
      'It increases bandwidth usage',
      'It can cause instability if the primary is not fully healthy',
      'It requires manual configuration',
      'It disables redundancy'
    ],
    correctAnswer: 1
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const before = {
      title: assignment.title,
      questions: Array.isArray(assignment.questions) ? assignment.questions.length : 0,
      passingPercentage: assignment.passingPercentage
    };

    assignment.questions = questions;
    assignment.passingPercentage = 60; // require 6/10 correct to pass
    assignment.updatedAt = new Date();

    await assignment.save();

    const after = {
      title: assignment.title,
      questions: Array.isArray(assignment.questions) ? assignment.questions.length : 0,
      passingPercentage: assignment.passingPercentage
    };

    console.log('Before:', before);
    console.log('After :', after);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();