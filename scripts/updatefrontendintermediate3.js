// Update Assignment 3 (frontend-intermediate-3) questions to API/Error Handling MCQs
// Uses MONGODB_URI from .env or defaults to mongodb://localhost:27017/nw_it

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.set('strictQuery', false);

const Assignment = require('../models/Assignment');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';

// Note: correctAnswer is the 0-based index of the correct option
const QUESTIONS = [
  {
    questionId: 1,
    prompt: 'Which HTTP method is primarily used for sending data to a server to create a resource?',
    options: ['GET', 'POST', 'DELETE', 'HEAD'],
    correctAnswer: 1
  },
  {
    questionId: 2,
    prompt: 'What does CORS primarily prevent?',
    options: ['SQL Injection', 'Cross-domain API calls without permission', 'Memory leaks', 'Slow network requests'],
    correctAnswer: 1
  },
  {
    questionId: 3,
    prompt: 'Which response code indicates a successful API request?',
    options: ['301', '404', '200', '500'],
    correctAnswer: 2
  },
  {
    questionId: 4,
    prompt: 'What is the main purpose of an Error Boundary in React?',
    options: ['Improving UI design', 'Preventing backend failures', 'Catching JavaScript errors in the component tree', 'Storing API tokens'],
    correctAnswer: 2
  },
  {
    questionId: 5,
    prompt: 'Which function is commonly used in JavaScript to consume REST APIs?',
    options: ['parse()', 'eval()', 'fetch()', 'json()'],
    correctAnswer: 2
  },
  {
    questionId: 6,
    prompt: 'What should you do when an API returns a 429 status code?',
    options: ['Retry immediately', 'Stop all requests', 'Reduce request frequency', 'Replace the API key'],
    correctAnswer: 2
  },
  {
    questionId: 7,
    prompt: 'Which header is required to allow cross-origin requests?',
    options: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'Server'],
    correctAnswer: 2
  },
  {
    questionId: 8,
    prompt: 'Which is the safest way to store an API key in a frontend React app?',
    options: ['Hardcoding it inside the component', 'Storing in localStorage', 'Storing in .env and using a backend', 'Adding to public folder'],
    correctAnswer: 2
  },
  {
    questionId: 9,
    prompt: 'What does .json() do in a fetch API response?',
    options: ['Validates data', 'Converts response body into JSON format', 'Encrypts the output', 'Creates HTML elements'],
    correctAnswer: 1
  },
  {
    questionId: 10,
    prompt: 'What is the purpose of API rate limiting?',
    options: ['Speed up APIs', 'Protect servers from overuse or abuse', 'Increase memory usage', 'Change the response format'],
    correctAnswer: 1
  }
];

async function run() {
  console.log('[Update-A3] Connecting to MongoDB:', uri);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    const assignmentId = 'frontend-intermediate-3';

    const before = await Assignment.findOne({ assignmentId }).lean();
    if (!before) {
      console.error(`[Update-A3] Assignment not found: ${assignmentId}`);
      process.exitCode = 1;
      return;
    }
    console.log('[Before-A3] Title:', before.title);
    console.log('[Before-A3] Total Questions:', before.questions?.length || 0);
    console.log('[Before-A3] First Question:', before.questions?.[0]?.prompt || before.questions?.[0]?.question);

    const update = await Assignment.updateOne(
      { assignmentId },
      {
        $set: {
          questions: QUESTIONS,
          passingPercentage: 60,
          updatedAt: new Date()
        }
      }
    );

    console.log('[Update-A3] Matched:', update.matchedCount, 'Modified:', update.modifiedCount);

    const after = await Assignment.findOne({ assignmentId }).lean();
    console.log('[After-A3] Total Questions:', after.questions?.length || 0);
    console.log('[After-A3] First Question:', after.questions?.[0]?.prompt || after.questions?.[0]?.question);
    console.log('[After-A3] Passing %:', after.passingPercentage);
    console.log('[Success-A3] Assignment 3 questions updated to API/Error Handling MCQs.');
  } catch (err) {
    console.error('[Error-A3] Failed to update Assignment 3:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[Update-A3] Disconnected.');
  }
}

run();