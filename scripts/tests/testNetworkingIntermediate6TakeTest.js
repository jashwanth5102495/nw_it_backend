require('dotenv').config();
const mongoose = require('mongoose');
const fetchFn = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ASSIGNMENT_ID = 'networking-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentTestInt6', assignmentSchema, 'assignments');

async function registerTempStudent() {
  const ts = Date.now();
  const payload = {
    firstName: 'Monitor', lastName: 'Tester',
    email: `monitor+${ts}@example.com`, phone: '0000000000',
    username: `monitor_tester_${ts}`, password: 'testpass123',
    dateOfBirth: '2000-01-01', education: 'bachelors', experience: 'beginner',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  };
  const res = await fetchFn(`${BASE_URL}/api/students/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  return { token: data?.data?.token, student: data?.data?.student };
}

async function fetchAssignment(token) {
  const res = await fetchFn(`${BASE_URL}/api/assignments/${ASSIGNMENT_ID}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Assignment fetch failed: ${JSON.stringify(data)}`);
  return data.data;
}

async function submitAnswers(token, answers) {
  const res = await fetchFn(`${BASE_URL}/api/assignments/${ASSIGNMENT_ID}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, timeSpent: 150 })
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Submit failed: ${JSON.stringify(data)}`);
  return data.data;
}

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Student auth
    console.log('[Test6] Registering temp student...');
    const { token, student } = await registerTempStudent();
    console.log('[Test6] Registered:', student?.username);

    // DB doc for correct answers mapping
    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) throw new Error('Assignment not found in DB');

    console.log('[Test6] Fetching assignment 6...');
    const assignment = await fetchAssignment(token);
    console.log('[Test6] Title:', assignment.title);
    console.log('[Test6] Total Questions:', assignment.totalQuestions);
    console.log('[Test6] Passing %:', assignment.passingPercentage);

    if (assignment.totalQuestions !== 10) throw new Error(`Expected 10 questions, got ${assignment.totalQuestions}`);
    const answersHidden = Array.isArray(assignment.questions) && assignment.questions.every(q => !('correctAnswer' in q));
    if (!answersHidden) throw new Error('correctAnswer must be hidden in GET response');
    if (assignment.passingPercentage !== 60) throw new Error(`Expected passingPercentage=60, got ${assignment.passingPercentage}`);

    // Build correct mapping from DB
    const correct = {};
    (doc.questions || []).forEach(q => { correct[String(q.questionId)] = q.correctAnswer; });

    console.log('[Test6] Submitting ALL correct (expect pass)...');
    const resultAll = await submitAnswers(token, correct);
    console.log('[Result] Score:', resultAll.score, '/', resultAll.totalQuestions, '=>', resultAll.percentage + '%', 'Passed:', resultAll.passed, 'Completed:', resultAll.passed);
    if (!resultAll.passed) throw new Error('All-correct submission should pass');

    console.log('[Test6] Submitting 6/10 correct (expect pass)...');
    const pass6 = { ...correct };
    const ids = Object.keys(pass6).slice(0, 4);
    ids.forEach(id => { pass6[id] = (pass6[id] + 1) % 4; });
    const result6 = await submitAnswers(token, pass6);
    console.log('[Result] Score:', result6.score, '/', result6.totalQuestions, '=>', result6.percentage + '%', 'Passed:', result6.passed);
    if (!result6.passed || result6.score !== 6) throw new Error('6/10 should pass per >=60% policy');

    console.log('[Test6] Submitting 5/10 correct (expect fail)...');
    const fail5 = { ...pass6 };
    const oneMore = Object.keys(fail5)[4];
    fail5[oneMore] = (correct[oneMore] + 1) % 4;
    const result5 = await submitAnswers(token, fail5);
    console.log('[Result] Score:', result5.score, '/', result5.totalQuestions, '=>', result5.percentage + '%', 'Passed:', result5.passed);
    if (result5.passed || result5.score !== 5) throw new Error('5/10 should fail and require retake');

    console.log('\n✅ Assignment 6 Take Test validated: answers hidden, correct grading, pass/fail thresholds work.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Test6 failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();