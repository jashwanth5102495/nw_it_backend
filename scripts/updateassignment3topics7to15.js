/*
Add topics 7–15 for assignment 'frontend-intermediate-3'.
Defaults to mongodb://localhost:27017/jasnav_projects to match running server.
Use MONGODB_URI env var to override.
*/

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-3';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const newTopics = [
  {
    topicId: 'react-error-boundaries',
    title: 'Error Boundaries in React',
    content: `Definition:
Error boundaries are special React components that catch errors during rendering.

Use:
Used to protect UI sections from breaking the entire app.

Importance:
Prevents full-page crashes.

Major Use: Complex components like dashboards.
Advantages: Better error handling in UI.

Example:

class ErrorBoundary extends React.Component {
  componentDidCatch(err) { console.log(err); }
  render() { return this.props.children; }
}`
  },
  {
    topicId: 'api-edge-cases',
    title: 'Handling Edge Cases in API Responses',
    content: `Definition:
Edge cases include empty data, slow responses, malformed JSON, or unexpected fields.

Use:
Handling them prevents UI crashes.

Importance:
Real APIs are not perfect—handling exceptions is critical.

Major Uses:
Tables, charts, user lists.
Advantages: Better stability.

Example:

if (!data || data.length === 0) {
  return <p>No records found</p>;
}`
  },
  {
    topicId: 'promise-vs-async-await',
    title: 'Promise Chaining vs async/await',
    content: `Definition:
Promise chaining uses .then() while async/await uses cleaner syntax for asynchronous operations.

Use:
Both methods handle asynchronous API calls.

Importance:
Async/await improves readability.

Major Use: All async frontend operations.
Advantages: Simple syntax.

Example:

const getData = async () => {
  const res = await fetch('/api');
  return res.json();
};`
  },
  {
    topicId: 'cors-understanding',
    title: 'Understanding CORS (Cross-Origin Resource Sharing)',
    content: `Definition:
A browser security feature preventing unauthorized cross-domain API calls.

Use:
Controls which domains can access an API.

Importance:
Protects from CSRF, unauthorized access.

Major Use: API gateways.
Advantages: Stronger security.

Example Error:

CORS policy: No 'Access-Control-Allow-Origin' header`
  },
  {
    topicId: 'rate-limiting-throttling',
    title: 'Rate Limiting & Throttling',
    content: `Definition:
Restriction on number of API calls allowed per minute/hour.

Use:
Prevents abuse, reduces server load.

Importance:
Without limits, APIs crash.

Major Use: Login attempts, public APIs.
Advantages: Improved stability.

Example:

429 Too Many Requests`
  },
  {
    topicId: 'secure-api-keys',
    title: 'Secure Storage of API Keys',
    content: `Definition:
Storing API keys in unsafe places (frontend code) is insecure.

Use:
Keys must be stored server-side or in encrypted vaults.

Importance: Protects backend from unauthorized access.

Major Use: Payment APIs, maps, OAuth.
Advantages: Prevents attacks.`
  },
  {
    topicId: 'env-vars-frontend',
    title: 'Environment Variables in Frontend (React)',
    content: `Definition:
.env files store variable values like API URLs.

Use: Keeps code clean & secure.

Importance:
Values can be changed without modifying core code.

Major Use: API keys, base URLs.
Advantages: Central configuration.

Example:

REACT_APP_API_URL= https://api.example.com`
  },
  {
    topicId: 'input-validation-security',
    title: 'Input Validation to Prevent API Abuse',
    content: `Definition:
Ensures users do not send harmful inputs to APIs.

Use:
Used for forms, search bars, authentication.

Importance:
Protects from SQL injection, XSS, spam.

Major Use: Login forms.
Advantages: Cleaner data.`
  },
  {
    topicId: 'best-practices-secure-api',
    title: 'Best Practices for Secure & Efficient API Consumption',
    content: `Definition:
A set of rules that ensure APIs are fast and safe.

Use:
Guides frontend developers to write better API code.

Importance:
Reduces crashes and security risks.

Major Uses: Production apps.
Advantages: Stability and scalability.

Example:

useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, []);`
  },
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const match = { assignmentId: ASSIGNMENT_ID };
    const doc = await Assignment.findOne(match);
    if (!doc) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const existingTopics = Array.isArray(doc.topics) ? doc.topics : [];
    const firstSix = existingTopics.slice(0, 6);
    doc.topics = [...firstSix, ...newTopics];

    await doc.save();

    console.log(`✅ Updated assignment: ${doc.title}`);
    console.log('Topics count:', (doc.topics || []).length);
    (doc.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      const snippet = (t.content || '').slice(0, 80).replace(/\n/g, ' ');
      console.log(`  [${i+1}] ${t.title} | contentLength=${len} | snippet="${snippet}"`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 3 topics 7–15:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();