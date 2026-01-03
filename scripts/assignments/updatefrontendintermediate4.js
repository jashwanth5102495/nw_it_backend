/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/nw_it';

const assignmentId = 'frontend-intermediate-4';

const questions = [
  {
    questionId: 1,
    prompt: 'Which of the following best describes “Design Thinking”?',
    options: [
      'A method that focuses only on improving project timelines',
      'A problem-solving approach centered around user needs',
      'A technique used only for visual design aesthetics',
      'A tool used to create wireframes',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 2,
    prompt: 'Which principle is NOT part of Nielsen’s Usability Heuristics?',
    options: [
      'Visibility of system status',
      'Match between system and real world',
      'Unlimited user control',
      'Flexibility and efficiency of use',
    ],
    correctAnswer: 2, // C
  },
  {
    questionId: 3,
    prompt: 'What does “a11y” stand for in frontend development?',
    options: ['Accessibility', 'Alternative version', 'Allowance', 'API Layer'],
    correctAnswer: 0, // A
  },
  {
    questionId: 4,
    prompt: 'The primary purpose of ARIA roles is to:',
    options: [
      'Improve color contrast',
      'Define how elements should behave for assistive technologies',
      'Apply animations to UI components',
      'Reduce website loading time',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 5,
    prompt: 'Which of the following is TRUE about color psychology in UI?',
    options: [
      'Colors have no impact on user emotions',
      'Colors influence user perception and decision-making',
      'Colors are used only for aesthetic appeal',
      'Color meaning is identical in all cultures',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 6,
    prompt: 'What is the main goal of accessibility compliance?',
    options: [
      'Making websites expensive',
      'Making websites visually appealing',
      'Ensuring websites are usable by people with disabilities',
      'Increasing search engine ranking',
    ],
    correctAnswer: 2, // C
  },
  {
    questionId: 7,
    prompt: 'Which ARIA attribute is used to label a UI element for screen readers?',
    options: ['aria-name', 'aria-role', 'aria-label', 'aria-tag'],
    correctAnswer: 2, // C
  },
  {
    questionId: 8,
    prompt: 'In UI/UX, a wireframe is used to:',
    options: [
      'Apply high-resolution designs',
      'Represent the structure and layout of a page',
      'Add animations and transitions',
      'Improve backend performance',
    ],
    correctAnswer: 1, // B
  },
  {
    questionId: 9,
    prompt: 'What does “visual hierarchy” help users do?',
    options: [
      'Identify which backend API is used',
      'Flexibly navigate between browser tabs',
      'Understand which elements on a page are most important',
      'Change CSS styles automatically',
    ],
    correctAnswer: 2, // C
  },
  {
    questionId: 10,
    prompt: 'Which of the following improves usability?',
    options: [
      'Overusing animations',
      'Using consistent UI patterns',
      'Using too many new visual styles',
      'Removing feedback messages',
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