require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-5';

// Flexible schema to update questions only
const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Assignment 5 – Secure Network Tunnels and VPNs (MCQs)
// correctAnswer is zero-based index of the correct option (a=0, b=1, c=2, d=3)
const questions = [
  {
    questionId: 1,
    prompt: 'What is the primary purpose of secure tunneling?',
    options: [
      'Increase network speed',
      'Hide routing tables',
      'Protect data over untrusted networks',
      'Replace firewalls'
    ],
    correctAnswer: 2
  },
  {
    questionId: 2,
    prompt: 'What does a VPN make a remote user feel like?',
    options: [
      'They are browsing anonymously',
      'They are directly connected to the private network',
      'They are using public DNS',
      'They are accessing a proxy'
    ],
    correctAnswer: 1
  },
  {
    questionId: 3,
    prompt: 'Which VPN architecture connects entire networks together?',
    options: [
      'Remote access VPN',
      'Client-based VPN',
      'Site-to-site VPN',
      'Browser VPN'
    ],
    correctAnswer: 2
  },
  {
    questionId: 4,
    prompt: 'What is a key advantage of OpenVPN?',
    options: [
      'Extremely small codebase',
      'Hardware-only support',
      'Flexible authentication and strong encryption',
      'No encryption overhead'
    ],
    correctAnswer: 2
  },
  {
    questionId: 5,
    prompt: 'Why is WireGuard considered more secure by design?',
    options: [
      'It supports older encryption algorithms',
      'It has a minimal and auditable codebase',
      'It uses no authentication',
      'It runs only in user space'
    ],
    correctAnswer: 1
  },
  {
    questionId: 6,
    prompt: 'What is the primary difference between OpenVPN and WireGuard?',
    options: [
      'OpenVPN does not use encryption',
      'WireGuard supports TCP only',
      'OpenVPN offers flexibility, WireGuard prioritizes simplicity and performance',
      'WireGuard replaces IPsec'
    ],
    correctAnswer: 2
  },
  {
    questionId: 7,
    prompt: 'What role does encryption play in VPNs?',
    options: [
      'It speeds up traffic',
      'It hides IP addresses only',
      'It protects data confidentiality',
      'It assigns routing paths'
    ],
    correctAnswer: 2
  },
  {
    questionId: 8,
    prompt: 'What is the purpose of SSH tunneling?',
    options: [
      'Replace VPNs entirely',
      'Encrypt specific network traffic',
      'Block all incoming traffic',
      'Increase bandwidth'
    ],
    correctAnswer: 1
  },
  {
    questionId: 9,
    prompt: 'What does dynamic SSH port forwarding create?',
    options: [
      'Static route',
      'VPN tunnel',
      'SOCKS proxy',
      'Firewall rule'
    ],
    correctAnswer: 2
  },
  {
    questionId: 10,
    prompt: 'Why is GRE often combined with IPsec?',
    options: [
      'GRE provides encryption',
      'IPsec improves routing speed',
      'GRE lacks encryption and needs security',
      'IPsec supports multicast'
    ],
    correctAnswer: 2
  }
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

    console.log('Before update: questions length =', Array.isArray(assignment.questions) ? assignment.questions.length : 0);

    const newQuestions = questions.map(q => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    const updateRes = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { questions: newQuestions, totalQuestions: newQuestions.length, passingPercentage: 60 } }
    );
    console.log('UpdateOne result:', updateRes && updateRes.modifiedCount);

    const reloaded = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After update: questions length =', Array.isArray(reloaded.questions) ? reloaded.questions.length : 0);
    console.log('✅ Updated questions for', ASSIGNMENT_ID, 'Total:', newQuestions.length, 'Passing %:', reloaded.passingPercentage);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Patch failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();