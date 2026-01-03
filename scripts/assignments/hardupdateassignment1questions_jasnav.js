require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'frontend-intermediate-1';

const questions = [
  { questionId: 1, prompt: 'Which Chrome DevTools panel is primarily used to inspect HTML and CSS?', options: ['Sources', 'Elements', 'Network', 'Application'], correctAnswer: 1 },
  { questionId: 2, prompt: 'What is the purpose of placing a breakpoint in DevTools?', options: ['To increase the execution speed', 'To pause JavaScript execution', 'To reload the browser', 'To clear console logs'], correctAnswer: 1 },
  { questionId: 3, prompt: 'Which DevTools tool allows you to view all network requests made by the website?', options: ['Elements', 'Lighthouse', 'Network', 'Performance'], correctAnswer: 2 },
  { questionId: 4, prompt: 'Lighthouse audits help developers improve:', options: ['Browser extensions', 'SEO, performance & accessibility', 'DOM manipulation', 'Database speed'], correctAnswer: 1 },
  { questionId: 5, prompt: 'Where can a developer inspect cookies, localStorage, and sessionStorage?', options: ['Application Panel', 'Performance Panel', 'Console Panel', 'Sources Panel'], correctAnswer: 0 },
  { questionId: 6, prompt: 'What is the primary use of React DevTools?', options: ['Checking internet speed', 'Monitoring React components, props & state', 'Styling components', 'Deploying code'], correctAnswer: 1 },
  { questionId: 7, prompt: 'Which error is caused when a website tries to access a resource on another domain without proper headers?', options: ['Memory leak', 'CORS error', 'Syntax error', 'React error boundary'], correctAnswer: 1 },
  { questionId: 8, prompt: 'What are source maps used for?', options: ['Compressing JavaScript files', 'Mapping minified code to original source code', 'Inspecting HTML elements', 'Improving CSS performance'], correctAnswer: 1 },
  { questionId: 9, prompt: 'Which feature allows developers to test how a website behaves in 3G or offline situations?', options: ['Console logs', 'Device toolbar', 'Network throttling', 'Memory profiler'], correctAnswer: 2 },
  { questionId: 10, prompt: 'The Performance panel in DevTools helps developers to:', options: ['Debug backend services', 'Record runtime performance and detect slow rendering', 'Change device emulator size', 'Test API endpoints'], correctAnswer: 1 }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const res = await mongoose.connection.collection('assignments').updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { questions, passingPercentage: 60 } }
    );
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const doc = await mongoose.connection.collection('assignments').findOne({ assignmentId: ASSIGNMENT_ID });
    console.log('First question after update:', doc?.questions?.[0]?.prompt);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Patch failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();