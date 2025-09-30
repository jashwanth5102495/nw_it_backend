const { default: fetch } = require('node-fetch');

// Test enrollment endpoint
async function testEnrollment() {
  try {
    console.log('Testing enrollment flow...');
    
    // First, let's login as a student to get a valid token
    const loginData = {
      username: 'rohan6891', // Assuming this user exists
      password: 'password123'
    };
    
    console.log('Attempting to login student...');
    const loginResponse = await fetch('http://localhost:5000/api/students/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult.success ? 'Success' : 'Failed');
    
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.message);
      console.log('Available students:');
      
      // Check what students exist
      const studentsResponse = await fetch('http://localhost:5000/api/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const studentsData = await studentsResponse.json();
      if (studentsData.data && studentsData.data.length > 0) {
        studentsData.data.forEach(student => {
          console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
        });
      }
      return;
    }
    
    const { token, student } = loginResult.data;
    console.log('✅ Login successful for:', student.firstName, student.lastName);
    console.log('Student ID:', student.id);
    
    // Test enrollment
    const enrollmentData = {
      courseId: 'ai-tools-mastery',
      paymentDetails: {
        amount: 12000,
        method: 'testing',
        transactionId: `TEST_${Date.now()}`
      },
      referralCode: null
    };
    
    console.log('Attempting to enroll student in course...');
    const enrollResponse = await fetch(`http://localhost:5000/api/students/${student.id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(enrollmentData)
    });
    
    const enrollResult = await enrollResponse.json();
    console.log('Enrollment result:', enrollResult);
    
    if (enrollResult.success) {
      console.log('✅ Enrollment successful!');
    } else {
      console.log('❌ Enrollment failed:', enrollResult.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEnrollment();
