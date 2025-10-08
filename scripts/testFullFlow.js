const { default: fetch } = require('node-fetch');

// Test student registration and enrollment
async function testFullFlow() {
  try {
    console.log('Testing full registration and enrollment flow...');
    
    // Step 1: Register a new student
    const timestamp = Date.now();
    const registrationData = {
      firstName: 'Test',
      lastName: 'Student',
      email: `teststudent${timestamp}@example.com`,
      phone: '+1234567890',
      username: `teststudent${timestamp}`,
      password: 'password123',
      dateOfBirth: '1995-01-01',
      education: 'bachelors',
      experience: 'beginner',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'United States'
      }
    };
    
    console.log('Step 1: Registering new student...');
    const registerResponse = await fetch('http://localhost:5000/api/students/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult.success ? 'Success' : 'Failed');
    
    if (!registerResult.success) {
      console.log('❌ Registration failed:', registerResult.message);
      return;
    }
    
    const { token, student } = registerResult.data;
    console.log('✅ Registration successful for:', student.firstName, student.lastName);
    console.log('Student ID:', student.id);
    
    // Step 2: Test enrollment
    const enrollmentData = {
      courseId: 'ai-tools-mastery',
      paymentDetails: {
        amount: 12000,
        method: 'testing',
        transactionId: `TEST_${Date.now()}`
      },
      referralCode: null
    };
    
    console.log('Step 2: Attempting to enroll student in course...');
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
      console.log('Course:', enrollResult.data.courseTitle);
      console.log('Enrollment Date:', enrollResult.data.enrollmentDate);
    } else {
      console.log('❌ Enrollment failed:', enrollResult.message);
    }
    
    // Step 3: Verify enrollment by checking student profile
    console.log('Step 3: Verifying enrollment...');
    const profileResponse = await fetch(`http://localhost:5000/api/students/profile/${student.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const profileResult = await profileResponse.json();
    if (profileResult.success) {
      console.log('✅ Profile retrieved successfully');
      console.log('Enrolled courses:', profileResult.data.enrolledCourses.length);
      console.log('Payment history:', profileResult.data.paymentHistory.length);
    } else {
      console.log('❌ Failed to retrieve profile:', profileResult.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFullFlow();
