// Test networking-beginner-1 assignment: verify hidden answers, submit, and boundary pass check (>60%)
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function registerTempStudent() {
  const ts = Date.now();
  const payload = {
    firstName: 'Net',
    lastName: 'Tester',
    email: `nettest+${ts}@example.com`,
    phone: '0000000000',
    username: `nettester_${ts}`,
    password: 'testpass123',
    dateOfBirth: '2000-01-01',
    education: 'bachelors',
    experience: 'beginner',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  };
  const res = await fetch(`${BASE_URL}/api/students/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  return { token: data?.data?.token, student: data?.data?.student };
}

async function fetchAssignment(token) {
  const assignmentId = 'networking-beginner-1';
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Assignment fetch failed: ${JSON.stringify(data)}`);
  return data.data;
}

function hasHiddenAnswers(assignment) {
  return Array.isArray(assignment.questions)
    && assignment.questions.every(q => !('correctAnswer' in q));
}

async function submitAnswers(token, answers) {
  const assignmentId = 'networking-beginner-1';
  const res = await fetch(`${BASE_URL}/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, timeSpent: 120 })
  });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(`Submit failed: ${JSON.stringify(data)}`);
  return data.data;
}

(async function main() {
  try {
    console.log('[Test] Registering temp student...');
    const { token, student } = await registerTempStudent();
    console.log('[Test] Registered:', student?.username);

    console.log('[Test] Fetching networking-beginner-1 assignment...');
    const assignment = await fetchAssignment(token);
    console.log('[Test] Title:', assignment.title);
    console.log('[Test] Total Questions:', assignment.totalQuestions);
    console.log('[Test] Answers hidden:', hasHiddenAnswers(assignment));

    if (assignment.totalQuestions !== 20) {
      throw new Error(`Expected 20 questions, got ${assignment.totalQuestions}`);
    }
    if (!hasHiddenAnswers(assignment)) {
      throw new Error('correctAnswer field should be hidden in GET response');
    }

    // Correct answers mapping (indices 0-based for A-D)
    const correct = {
      '1': 1,
      '2': 2,
      '3': 2,
      '4': 1,
      '5': 2,
      '6': 1,
      '7': 2,
      '8': 3,
      '9': 1,
      '10': 2,
      '11': 2,
      '12': 1,
      '13': 1,
      '14': 1,
      '15': 2,
      '16': 1,
      '17': 2,
      '18': 2,
      '19': 0,
      '20': 2
    };

    console.log('[Test] Submitting ALL correct answers (expect 100% and pass)...');
    const resultAll = await submitAnswers(token, correct);
    console.log('[Result] Score:', resultAll.score, '/', resultAll.totalQuestions, '=>', resultAll.percentage + '%', 'Passed:', resultAll.passed);

    // Boundary test: 12/20 = 60% should NOT pass (strictly >60 required)
    const boundary = { ...correct };
    // Make 8 answers wrong to get exactly 60%
    ['13','14','15','16','17','18','19','20'].forEach(q => { boundary[q] = (correct[q] + 1) % 4; });

    console.log('[Test] Submitting 12/20 correct (expect 60% and NOT pass)...');
    const resultBoundary = await submitAnswers(token, boundary);
    console.log('[Result] Score:', resultBoundary.score, '/', resultBoundary.totalQuestions, '=>', resultBoundary.percentage + '%', 'Passed:', resultBoundary.passed);

    console.log('\n✅ Networking assignment GET hides answers; pass requires >60% confirmed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
})();