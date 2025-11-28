// Quick diagnostic: register a temp student, fetch assignment via API, print content lengths
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function main() {
  try {
    const ts = Date.now();
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: `test+${ts}@example.com`,
      phone: '0000000000',
      username: `testuser_${ts}`,
      password: 'testpass123',
      dateOfBirth: '2000-01-01',
      education: 'bachelors', // valid enum per Student schema
      experience: 'beginner',
      address: { street: '', city: '', state: '', zipCode: '', country: '' }
    };

    console.log('[Register] Creating temp student...');
    const regRes = await fetch(`${BASE_URL}/api/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData?.success) {
      console.error('Registration failed:', regData);
      process.exit(1);
    }
    const token = regData?.data?.token;
    const student = regData?.data?.student;
    console.log('[Register] OK. Student:', student?.username, 'Token len:', token?.length);

    const assignmentId = process.env.ASSIGNMENT_ID || 'frontend-intermediate-1';
    console.log(`[Fetch] GET /api/assignments/${assignmentId}`);
    const aRes = await fetch(`${BASE_URL}/api/assignments/${assignmentId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const aData = await aRes.json();
    if (!aRes.ok || !aData?.success) {
      console.error('Assignment fetch failed:', aData);
      process.exit(1);
    }

    const assignment = aData.data;
    console.log('[Assignment] Title:', assignment?.title);
    console.log('[Assignment] Topics count:', assignment?.topics?.length);

    // Print per-topic content length and snippet
    assignment?.topics?.forEach((t, idx) => {
      const len = (t?.content || '').length;
      const snippet = (t?.content || '').slice(0, 120).replace(/\n/g, ' ');
      console.log(`  [Topic ${idx+1}] ${t?.title} | contentLength=${len} | snippet="${snippet}"`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();