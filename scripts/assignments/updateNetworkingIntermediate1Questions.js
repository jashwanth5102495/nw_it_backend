require('dotenv').config();
const mongoose = require('mongoose');

// Match backend default DB used elsewhere
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-1';

// Use flexible schema against 'assignments' collection
const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// MCQs (10) — zero-based correctAnswer indices
const questions = [
  {
    questionId: 1,
    prompt: 'What is the primary purpose of Linux network namespaces?',
    options: [
      'To improve CPU performance',
      'To create multiple user accounts',
      'To isolate network resources within the same kernel',
      'To virtualize storage devices'
    ],
    correctAnswer: 2,
  },
  {
    questionId: 2,
    prompt: 'Which of the following network components is isolated by a network namespace?',
    options: [
      'CPU scheduling',
      'File permissions',
      'Routing tables',
      'Process memory'
    ],
    correctAnswer: 2,
  },
  {
    questionId: 3,
    prompt: 'Why are veth pairs used in network namespace configurations?',
    options: [
      'To encrypt traffic between namespaces',
      'To act as virtual cables connecting namespaces',
      'To assign MAC addresses',
      'To create VLANs'
    ],
    correctAnswer: 1,
  },
  {
    questionId: 4,
    prompt: 'What happens to network visibility between two namespaces by default?',
    options: [
      'They can freely communicate',
      'They share the same interfaces',
      'They are completely isolated',
      'They share routing tables'
    ],
    correctAnswer: 2,
  },
  {
    questionId: 5,
    prompt: 'Why must the loopback interface be enabled inside a network namespace?',
    options: [
      'To enable internet access',
      'To allow internal application communication',
      'To assign a MAC address',
      'To connect to VLANs'
    ],
    correctAnswer: 1,
  },
  {
    questionId: 6,
    prompt: 'How are firewall rules applied in network namespaces?',
    options: [
      'Shared globally across all namespaces',
      'Applied per namespace independently',
      'Only applied on the host system',
      'Disabled by default'
    ],
    correctAnswer: 1,
  },
  {
    questionId: 7,
    prompt: 'What is a common real-world use case of network namespaces?',
    options: [
      'Increasing disk I/O speed',
      'Running multiple kernels',
      'Container network isolation',
      'Hardware virtualization'
    ],
    correctAnswer: 2,
  },
  {
    questionId: 8,
    prompt: 'What tool is commonly used to manage network namespaces in Linux?',
    options: [
      'netstat',
      'ifconfig',
      'ip netns',
      'brctl'
    ],
    correctAnswer: 2,
  },
  {
    questionId: 9,
    prompt: 'Which statement about routing in network namespaces is TRUE?',
    options: [
      'All namespaces share the same routing table',
      'Routing tables are isolated per namespace',
      'Only the host can have routing rules',
      'Routing is disabled inside namespaces'
    ],
    correctAnswer: 1,
  },
  {
    questionId: 10,
    prompt: 'What is a potential security risk when using network namespaces?',
    options: [
      'Excessive disk usage',
      'Kernel recompilation required',
      'Misconfigured routes or firewall rules',
      'Reduced CPU availability'
    ],
    correctAnswer: 2,
  },
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Use atomic update to avoid any schema or save hooks interfering
    const update = {
      $set: {
        questions: questions.map(q => ({
          questionId: q.questionId,
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
        totalQuestions: questions.length,
        passingPercentage: 60,
        updatedAt: new Date(),
      }
    };

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      update,
      { new: true }
    ).lean();

    if (!result) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    console.log(`✅ Updated '${ASSIGNMENT_ID}': totalQuestions=${result.totalQuestions}, passingPercentage=${result.passingPercentage}`);
    (result.questions || []).forEach(q => {
      console.log(`  Q${q.questionId} | options=${(q.options || []).length} | correctIndex=${q.correctAnswer}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment questions:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();