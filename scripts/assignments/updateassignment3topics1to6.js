/*
Patch topics 1–6 and metadata for assignment 'frontend-intermediate-3' in the 'nw_it' database.
Sets title to "Assignment 3 — API Consumption, Error Handling & Data Security Basics" and updates description.
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
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
    topicId: 'api-intro',
    title: 'Introduction to APIs & API Consumption',
    content: `Definition:
An API (Application Programming Interface) is a communication system that allows applications to exchange data. In web development, APIs deliver structured data—typically JSON—from a server to the frontend. API consumption refers to the process of sending requests from the client-side and receiving responses from external or internal servers.

Use:
APIs are used to fetch user data, submit forms, authenticate sessions, modify databases, and integrate external services such as payment gateways, weather data, or social media login. They connect the frontend interface with backend logic.

Importance:
Without APIs, modern applications cannot function dynamically. They enable real-time interactions, personalized dashboards, and live updates. They allow the frontend to remain lightweight while backend servers process heavy computations.

Major Use: Data retrieval, form submission, authentication, notifications.
Advantages: Modular applications, faster development, flexible data exchange.

Syntax Example:
fetch("https://api.example.com/users")
  .then(res => res.json())
  .then(data => console.log(data));`
  },
  {
    topicId: 'rest-vs-graphql',
    title: 'REST APIs vs GraphQL APIs',
    content: `Definition:
REST is a standard API architecture using endpoints and HTTP methods. GraphQL is a flexible query language for APIs that allows clients to request specific data in one endpoint.

Use:
REST is used for traditional CRUD operations with multiple endpoints. GraphQL is used when clients must fetch custom-shaped data or minimize network calls.

Importance:
Understanding the difference helps developers choose the best tool depending on scalability, bandwidth limitations, and frontend complexity.

Major Use:
REST for large distributed systems; GraphQL for mobile apps & dashboards.
Advantages: REST is simple; GraphQL reduces over-fetching.

Example REST vs GraphQL Query:
REST
GET /users/1

GraphQL
{ user(id: 1) { name, email } }`
  },
  {
    topicId: 'http-methods-status',
    title: 'HTTP Methods & Status Codes',
    content: `Definition:
HTTP defines how clients communicate with servers using methods like GET, POST, PUT, DELETE and status codes like 200, 404, 500.

Use:
Methods represent action types, and status codes indicate success or failure.

Importance:
Correct method usage ensures proper communication and predictable backend behavior.

Major Use: CRUD operations.
Advantages: Standardized communication.

Example:
POST /login  → 200 OK
GET /data    → 404 Not Found`
  },
  {
    topicId: 'fetch-api-advanced',
    title: 'Fetch API: Basics & Advanced Usage',
    content: `Definition:
The Fetch API is a modern JavaScript interface used to make network requests.

Use:
Used to call APIs, submit forms, upload files, and handle streams.

Importance:
It is built into browsers and supports Promises, making it modern and flexible.

Major Use: Most frontend API calls.
Advantages: Lightweight, easy to use, supports async/await.

Advanced Example:
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John" }),
});`
  },
  {
    topicId: 'axios-usage',
    title: 'Axios: Advantages & Practical Usage',
    content: `Definition:
Axios is a popular HTTP client library that simplifies API requests using promises.

Use:
Used in React and Node.js for consistent API calling.

Importance:
It automatically converts JSON, handles request cancellation, and supports interceptors.

Major Use: Large frontend projects.
Advantages: Cleaner syntax, supports older browsers.

Example:
axios.get('/users').then(res => console.log(res.data));`
  },
  {
    topicId: 'api-errors-http-failures',
    title: 'Handling API Errors & HTTP Failures',
    content: `Definition:
API errors occur when a request fails due to invalid input, server issues, or network problems.

Use:
Error handling ensures apps do not crash and users see meaningful messages.

Importance:
A stable user experience requires robust error handling.

Major Use: Login failures, expired tokens, invalid forms.
Advantages: Better reliability and UX.

Example:
try {
  const res = await fetch('/api');
  if (!res.ok) throw new Error('Failed!');
} catch (err) {
  console.error(err.message);
}`
  }
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const match = { assignmentId: ASSIGNMENT_ID };
    const update = {
      $set: {
        title: 'Assignment 3 — API Consumption, Error Handling & Data Security Basics',
        description: 'Focus: Secure API consumption, error boundaries in React, handling edge cases, rate limits, CORS.',
        topics: newTopics,
      }
    };

    const res = await Assignment.updateOne(match, update, { upsert: false });
    console.log('Update result:', res);

    const after = await Assignment.findOne(match).lean();
    if (!after) {
      console.log('❌ Assignment not found after update:', ASSIGNMENT_ID);
    } else {
      console.log(`✅ Updated assignment: ${after.title}`);
      console.log('Topics count:', (after.topics || []).length);
      (after.topics || []).forEach((t, i) => {
        const len = (t.content || '').length;
        console.log(`  [${i+1}] ${t.title} | contentLength=${len}`);
      });
    }

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 3:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();