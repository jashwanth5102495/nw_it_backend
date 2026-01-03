require('dotenv').config();
const database = require('../../config/database');
const Assignment = require('../../models/Assignment');

async function run() {
  const assignmentId = 'networking-intermediate-4';

  const questions = [
    {
      questionId: 1,
      prompt: 'What is the primary purpose of enterprise routing?',
      options: [
        'Encrypt all network traffic',
        'Efficiently move packets across large, segmented networks',
        'Replace firewalls',
        'Reduce IP address usage'
      ],
      correctAnswer: 1
    },
    {
      questionId: 2,
      prompt: 'What does enabling IP forwarding on Linux allow?',
      options: [
        'DNS resolution',
        'Packet filtering',
        'Packet routing between interfaces',
        'VLAN creation'
      ],
      correctAnswer: 2
    },
    {
      questionId: 3,
      prompt: 'Why are static routes commonly used in enterprise networks?',
      options: [
        'They automatically adapt to failures',
        'They require no configuration',
        'They are predictable and resource-efficient',
        'They increase routing convergence time'
      ],
      correctAnswer: 2
    },
    {
      questionId: 4,
      prompt: 'What is the key benefit of dynamic routing?',
      options: [
        'Lower CPU usage',
        'Manual route control',
        'Automatic route updates during failures',
        'Fixed network paths'
      ],
      correctAnswer: 2
    },
    {
      questionId: 5,
      prompt: 'What distinguishes Policy-Based Routing from traditional routing?',
      options: [
        'It routes only IPv6 traffic',
        'It ignores destination addresses',
        'It uses rules beyond destination IP',
        'It disables firewalls'
      ],
      correctAnswer: 2
    },
    {
      questionId: 6,
      prompt: 'Why are multiple routing tables useful in Linux?',
      options: [
        'They increase bandwidth',
        'They allow separate routing logic for different traffic types',
        'They replace VLANs',
        'They simplify IP addressing'
      ],
      correctAnswer: 1
    },
    {
      questionId: 7,
      prompt: 'What role do VLANs play in enterprise networks?',
      options: [
        'Encrypt traffic',
        'Segment networks logically',
        'Improve DNS performance',
        'Replace routing'
      ],
      correctAnswer: 1
    },
    {
      questionId: 8,
      prompt: 'What is the main purpose of inter-VLAN routing?',
      options: [
        'Block traffic between VLANs',
        'Allow controlled communication between VLANs',
        'Create broadcast storms',
        'Reduce routing tables'
      ],
      correctAnswer: 1
    },
    {
      questionId: 9,
      prompt: 'Why is network segmentation important for security?',
      options: [
        'It increases bandwidth',
        'It simplifies IP allocation',
        'It limits lateral movement of attackers',
        'It removes the need for firewalls'
      ],
      correctAnswer: 2
    },
    {
      questionId: 10,
      prompt: 'What is the benefit of route failover mechanisms?',
      options: [
        'They increase latency',
        'They prevent packet filtering',
        'They ensure traffic continuity during failures',
        'They eliminate routing tables'
      ],
      correctAnswer: 2
    }
  ];

  try {
    await database.connect();
    console.log('Connected to MongoDB');

    const before = await Assignment.findOne({ assignmentId }).lean();
    console.log('Before:', {
      questions: Array.isArray(before?.questions) ? before.questions.length : 0,
      passingPercentage: before?.passingPercentage
    });

    const res = await Assignment.updateOne(
      { assignmentId },
      { $set: { questions, passingPercentage: 60 } }
    );
    console.log('Update result:', { matched: res.matchedCount, modified: res.modifiedCount });

    const after = await Assignment.findOne({ assignmentId }).lean();
    console.log('After:', {
      questions: Array.isArray(after?.questions) ? after.questions.length : 0,
      passingPercentage: after?.passingPercentage
    });
    console.log('First question:', after?.questions?.[0]?.prompt);
    const withCorrect = (after?.questions || []).filter(q => typeof q.correctAnswer === 'number').length;
    console.log(`Correct answers present for ${withCorrect}/${after?.questions?.length} questions`);
  } catch (err) {
    console.error('Error updating Assignment 4 questions:', err);
  } finally {
    await database.close();
    console.log('Disconnected from MongoDB');
  }
}

run();