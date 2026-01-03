/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/nw_it';

const assignmentId = 'frontend-intermediate-6';

// A=0, B=1, C=2, D=3
const questions = [
  {
    questionId: 1,
    prompt: 'Which tool is commonly used for unit testing JavaScript applications?',
    options: ['Webpack', 'Jest', 'ESLint', 'Babel'],
    correctAnswer: 1, // B
  },
  {
    questionId: 2,
    prompt: 'What does React Testing Library mainly focus on?',
    options: [
      'Testing DOM structure directly',
      'Testing components based on user behavior',
      'Testing only snapshots',
      'Testing database interactions',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 3,
    prompt: 'Which command is used to create a Jest configuration file?',
    options: ['jest --config', 'jest --init', 'jest config', 'npm jest init'],
    correctAnswer: 1, // B
  },
  {
    questionId: 4,
    prompt: 'Snapshot testing is mainly used for:',
    options: [
      'Verifying API responses',
      'Storing component UI structure for comparison',
      'Checking JavaScript performance',
      'Debugging production issues',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 5,
    prompt: 'Which method is used to simulate user actions in React Testing Library?',
    options: ['fire.user()', 'eventUser()', 'userEvent', 'simulateUser'],
    correctAnswer: 2, // C
  },
  {
    questionId: 6,
    prompt: 'What is the purpose of mocking APIs in tests?',
    options: [
      'To test real backend logic',
      'To avoid network calls and return controlled responses',
      'To measure server load',
      'To fetch live data',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 7,
    prompt: 'In Jest, which keyword is used to group related test cases?',
    options: ['block', 'group', 'describe', 'merge'],
    correctAnswer: 2, // C
  },
  {
    questionId: 8,
    prompt: 'Which Jest method runs before each test case?',
    options: ['before()', 'preTest()', 'beforeEach()', 'initTest()'],
    correctAnswer: 2, // C
  },
  {
    questionId: 9,
    prompt: 'Which React Testing Library function renders a component for testing?',
    options: ['mount()', 'render()', 'show()', 'create()'],
    correctAnswer: 1, // B
  },
  {
    questionId: 10,
    prompt: 'What does mocking fetch() help achieve in tests?',
    options: [
      'It slows down the test to match real conditions',
      'It prevents hitting real APIs and provides fake data',
      'It automatically optimizes network calls',
      'It caches the API response',
    ],
    correctAnswer: 1, // B
  },
];

const passingPercentage = 60;

async function main() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI, { dbName: 'nw_it' });
  console.log('Connected.');

  const AssignmentModel = mongoose.connection.collection('assignments');

  console.log(`Updating Assignment: ${assignmentId} with ${questions.length} questions ...`);
  const updateResult = await AssignmentModel.updateOne(
    { assignmentId },
    {
      $set: {
        questions,
        passingPercentage,
      },
    }
  );

  console.log('Update Result:', updateResult);

  const updated = await AssignmentModel.findOne({ assignmentId });
  if (!updated) {
    console.error('Failed to find assignment after update.');
  } else {
    console.log('Verification:');
    console.log('assignmentId:', updated.assignmentId);
    console.log('questions count:', Array.isArray(updated.questions) ? updated.questions.length : 0);
    if (Array.isArray(updated.questions) && updated.questions.length > 0) {
      const q1 = updated.questions[0];
      console.log('first question prompt:', q1.prompt);
      console.log('first question options:', q1.options);
      console.log('first question correctAnswer index:', q1.correctAnswer);
    }
    console.log('passingPercentage:', updated.passingPercentage);
  }

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

main().catch((err) => {
  console.error('Script Error:', err);
  process.exit(1);
});