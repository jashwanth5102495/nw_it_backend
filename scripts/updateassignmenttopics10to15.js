/*
 Patch topics 10–15 content for assignment 'frontend-intermediate-1' in the 'nw_it' database.
 Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-1';

// Minimal schema to allow flexible document shape
const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  topics: [
    {
      id: String,
      title: String,
      content: String,
    },
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const entries = [
  {
    id: 'cors-network',
    title: 'Handling CORS Errors & Network-Level Debugging',
    content: [
      'Handling CORS Errors & Network-Level Debugging',
      '',
      'CORS (Cross-Origin Resource Sharing) errors occur when a webpage tries to access resources from another domain without proper permissions. These errors appear in the Network and Console panels of DevTools. Understanding CORS is essential for frontend developers who consume external APIs.',
      '',
      'The main use of DevTools here is identifying why a request failed. Developers can inspect request headers and determine whether the backend incorrectly configured CORS rules. This helps resolve issues quickly by confirming if the problem lies in the frontend or the backend server.',
      '',
      'Its importance comes from the fact that CORS issues commonly occur in full-stack development. The major use is debugging API integration failures where headers like Access-Control-Allow-Origin are missing. The advantage is precise error identification, helping developers fix cross-domain issues efficiently.'
    ].join('\n'),
  },
  {
    id: 'memory-leaks',
    title: 'Identifying Memory Leaks & Using the Memory Profiler',
    content: [
      'Identifying Memory Leaks & Using the Memory Profiler',
      '',
      'Memory leaks happen when an application keeps consuming memory without releasing unused resources, causing slowdowns and crashes. DevTools provides a Memory panel that allows developers to track heap usage, analyze snapshots, and detect memory retention.',
      '',
      'The primary use is identifying components or functions that do not release memory properly. React apps, especially with event listeners and timers, are prone to leaks. By using the profiler, developers can track down the source of unwanted memory growth.',
      '',
      'Its importance lies in avoiding performance degradation over time. The major use is during optimization of long-running React apps or dashboard-style applications. Advantages include preventing crashes, improving performance, and maintaining smooth user experiences. Memory profiling is crucial for professional-grade applications.'
    ].join('\n'),
  },
  {
    id: 'mobile-responsive',
    title: 'Mobile View Debugging & Responsive Design Tooling',
    content: [
      'Mobile View Debugging & Responsive Design Tooling',
      '',
      'DevTools includes tools to simulate mobile devices, screen sizes, resolutions, and touch interactions. Developers can preview their UI on various screen dimensions without physical devices. This is essential for building responsive websites.',
      '',
      'The main use is testing responsiveness. Developers can check breakpoints, alignment, text resizing, and overall layout behavior across different devices. This helps prevent layout issues on mobile screens.',
      '',
      'Its importance is tied to the rise of mobile-first development. The major use is ensuring websites work perfectly on small screens. Advantages include faster testing, no dependency on physical devices, and accurate UI previews. This tool ensures your website is mobile-friendly.'
    ].join('\n'),
  },
  {
    id: 'network-throttle',
    title: 'Simulating Network Speed, Offline Mode & Throttling',
    content: [
      'Simulating Network Speed, Offline Mode & Throttling',
      '',
      'DevTools allows developers to simulate different network conditions such as 3G, 4G, slow WiFi, or even offline mode. This helps test how applications behave under real-world constraints and poor connectivity.',
      '',
      'The main use is ensuring the website loads gracefully even when network speed is slow. Developers can test features like loading indicators, retries, and offline warnings. This is crucial for improving user experience.',
      '',
      'Its importance comes from the fact that users often browse on slow networks. The major use is debugging slow-loading resources and testing progressive loading techniques. Advantages include realistic testing, improved app resilience, and better user satisfaction.'
    ].join('\n'),
  },
  {
    id: 'stack-traces',
    title: 'Error Stack Tracing & Debugging Minified Production Code',
    content: [
      'Error Stack Tracing & Debugging Minified Production Code',
      '',
      'Stack traces are logs that show the sequence of function calls leading to an error. DevTools displays stack traces in the Console, helping developers locate the exact source of a problem. Even in minified production builds, stack traces can be mapped back using source maps.',
      '',
      'The main use is identifying the root cause of errors quickly. Developers can click on stack trace entries to jump directly to lines of code. This makes error debugging faster and more precise.',
      '',
      'Its importance lies in reducing debugging time and improving code stability. The major use is during production debugging when code is compressed. Advantages include deep visibility into function calls, accurate error tracking, and simplified root cause analysis.'
    ].join('\n'),
  },
  {
    id: 'debug-best-practices',
    title: 'Best Practices for Debugging & Writing Debug-Friendly Code',
    content: [
      'Best Practices for Debugging & Writing Debug-Friendly Code',
      '',
      'Debug-friendly code is written in a way that makes future debugging easier. This includes writing clean functions, using meaningful variable names, avoiding deeply nested logic, and adding proper error handling. Such practices reduce complexity and make issues easier to locate.',
      '',
      'The main use is improving long-term maintainability of applications. When code is organized well, tools like DevTools become even more effective. Developers can trace data flow more easily and catch errors without confusion.',
      '',
      'Its importance is seen in team environments where multiple developers work on the same codebase. The major use is preventing hard-to-fix bugs and ensuring faster development cycles. Advantages include clean code, fewer regressions, and reduced debugging time.'
    ].join('\n'),
  },
];

const topicContentById = Object.fromEntries(entries.map(e => [e.id, e.content]));
const topicContentByTitle = Object.fromEntries(entries.map(e => [e.title, e.content]));

async function run() {
  console.log(`[Patch] Connecting to ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI, { dbName: undefined });

  const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
  if (!assignment) {
    console.error(`[Patch] Assignment not found: ${ASSIGNMENT_ID}`);
    process.exit(1);
  }

  let updatedCount = 0;
  if (Array.isArray(assignment.topics)) {
    assignment.topics = assignment.topics.map(t => {
      const idMatch = t && t.id && topicContentById[t.id];
      const titleMatch = t && t.title && topicContentByTitle[t.title];
      if (idMatch || titleMatch) {
        const prevLen = (t.content || '').length;
        const newContent = idMatch || titleMatch;
        t.content = newContent;
        const newLen = t.content.length;
        updatedCount += 1;
        console.log(` - Updated topic '${t.id || t.title}' content length ${prevLen} -> ${newLen}`);
      }
      return t;
    });
  }

  if (updatedCount === 0) {
    console.log('[Patch] No matching topics found to update.');
  } else {
    await assignment.save();
    console.log(`[Patch] Successfully updated ${updatedCount} topics for '${ASSIGNMENT_ID}'.`);
  }

  await mongoose.disconnect();
  console.log('[Patch] Done.');
}

run().catch(err => {
  console.error('[Patch] Error:', err);
  process.exit(1);
});