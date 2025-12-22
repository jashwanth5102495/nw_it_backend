require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function registerTempStudent() {
  const ts = Date.now();
  const payload = {
    firstName: 'Tunnel',
    lastName: 'Tester',
    email: `tunneltest+${ts}@example.com`,
    phone: '0000000000',
    username: `tunneltester_${ts}`,
    password: 'testpass123',
    dateOfBirth: '2000-01-01',
    education: 'bachelors',
    experience: 'beginner',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  };
  const res = await fetch(`${BASE_URL}/api/students/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  return { token: data?.data?.token, student: data?.data?.student };
}

async function fetchAssignment(token) {
  const assignmentId = 'networking-intermediate-5';
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Assignment fetch failed: ${JSON.stringify(data)}`);
  return data.data;
}

function answersHidden(assignment) {
  return Array.isArray(assignment.questions) && assignment.questions.every(q => !('correctAnswer' in q));
}

async function submitAnswers(token, answers) {
  const assignmentId = 'networking-intermediate-5';
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, timeSpent: 150 })
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Submit failed: ${JSON.stringify(data)}`);
  return data.data;
}

(async function main() {
  try {
    console.log('[Test5] Registering temp student...');
    const { token, student } = await registerTempStudent();
    console.log('[Test5] Registered:', student?.username);

    console.log('[Test5] Fetching assignment 5...');
    const assignment = await fetchAssignment(token);
    console.log('[Test5] Title:', assignment.title);
    console.log('[Test5] Total Questions:', assignment.totalQuestions);
    console.log('[Test5] Passing %:', assignment.passingPercentage);
    console.log('[Test5] Answers hidden:', answersHidden(assignment));

    if (assignment.totalQuestions !== 10) throw new Error(`Expected 10 questions, got ${assignment.totalQuestions}`);
    if (!answersHidden(assignment)) throw new Error('correctAnswer must be hidden in GET response');
    if (assignment.passingPercentage !== 60) throw new Error(`Expected passingPercentage=60, got ${assignment.passingPercentage}`);

    // Correct answers mapping (indices 0-based for A-D)
    const correct = { '1': 2, '2': 1, '3': 2, '4': 2, '5': 1, '6': 2, '7': 2, '8': 1, '9': 2, '10': 2 };

    console.log('[Test5] Submitting ALL correct (expect 100% pass)...');
    const resultAll = await submitAnswers(token, correct);
    console.log('[Result] Score:', resultAll.score, '/', resultAll.totalQuestions, '=>', resultAll.percentage + '%', 'Passed:', resultAll.passed);
    if (!resultAll.passed) throw new Error('All-correct submission should pass');

    // Boundary pass: 6/10 correct => 60% should pass (>= policy)
    const pass6 = { ...correct };
    // Flip 4 answers to wrong to get 6 correct
    ['7','8','9','10'].forEach(q => { pass6[q] = (correct[q] + 1) % 4; });
    console.log('[Test5] Submitting 6/10 correct (expect pass)...');
    const result6 = await submitAnswers(token, pass6);
    console.log('[Result] Score:', result6.score, '/', result6.totalQuestions, '=>', result6.percentage + '%', 'Passed:', result6.passed);
    if (!result6.passed) throw new Error('6/10 should pass per >=60% policy');

    // Fail case: 5/10 correct => 50% should fail
    const fail5 = { ...correct };
    // Flip 5 answers to wrong
    ['6','7','8','9','10'].forEach(q => { fail5[q] = (correct[q] + 1) % 4; });
    console.log('[Test5] Submitting 5/10 correct (expect fail)...');
    const result5 = await submitAnswers(token, fail5);
    console.log('[Result] Score:', result5.score, '/', result5.totalQuestions, '=>', result5.percentage + '%', 'Passed:', result5.passed);
    if (result5.passed) throw new Error('5/10 should fail and require retake');

    console.log('\n✅ Assignment 5 Take Test validated: answers hidden, correct grading, pass/fail thresholds work.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test5 failed:', err.message);
    process.exit(1);
  }
})();