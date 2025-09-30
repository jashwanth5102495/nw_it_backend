const mongoose = require('mongoose');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jasnav_it_solutions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testPaymentFlow() {
  try {
    console.log('🚀 Starting Payment Flow Test...\n');

    // Step 1: Find or create a test user first
    let testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      testUser = new User({
        username: 'testuser',
        password: hashedPassword,
        role: 'student'
      });
      await testUser.save();
      console.log('✅ Created test user:', testUser.username);
    } else {
      console.log('✅ Found existing test user:', testUser.username);
    }

    // Step 2: Find or create a test student
    let testStudent = await Student.findOne({ email: 'test@example.com' });
    if (!testStudent) {
      testStudent = new Student({
        user_id: testUser._id,
        studentId: 'STU_' + Date.now(),
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        phone: '1234567890',
        education: 'bachelors',
        experience: 'beginner',
        dateOfBirth: new Date('1995-01-01'),
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'United States'
        },
        enrolledCourses: []
      });
      await testStudent.save();
      console.log('✅ Created test student:', testStudent.firstName + ' ' + testStudent.lastName);
    } else {
      console.log('✅ Found existing test student:', testStudent.firstName + ' ' + testStudent.lastName);
    }

    // Step 3: Find a test course
    let testCourse = await Course.findOne({ title: { $regex: /frontend/i } });
    if (!testCourse) {
      testCourse = new Course({
        courseId: 'COURSE_' + Date.now(),
        title: 'Frontend Development - Beginner',
        description: 'Learn the basics of frontend development including HTML, CSS, and JavaScript',
        price: 4800,
        duration: '8 weeks',
        level: 'Beginner',
        category: 'Frontend Development',
        modules: [{
          title: 'HTML Basics',
          duration: '2 weeks',
          topics: ['HTML Elements', 'Forms', 'Semantic HTML']
        }],
        prerequisites: ['Basic computer knowledge'],
        learningOutcomes: ['Build responsive websites', 'Understand web fundamentals'],
        instructor: {
          name: 'Test Instructor',
          bio: 'Experienced frontend developer',
          experience: '5+ years in web development'
        }
      });
      await testCourse.save();
      console.log('✅ Created test course:', testCourse.title);
    } else {
      console.log('✅ Found existing test course:', testCourse.title);
    }

    // Step 4: Create a test payment
    const paymentData = {
      paymentId: 'PAY_' + Date.now(),
      studentId: testStudent._id,
      courseId: testCourse._id,
      courseName: testCourse.title,
      amount: testCourse.price,
      originalAmount: testCourse.price,
      paymentMethod: 'manual_qr',
      transactionId: 'TEST_TXN_' + Date.now(),
      status: 'pending',
      confirmationStatus: 'waiting_for_confirmation',
      studentName: testStudent.firstName + ' ' + testStudent.lastName,
      studentEmail: testStudent.email,
      referralCode: 'TEST123'
    };

    const testPayment = new Payment(paymentData);
    await testPayment.save();
    console.log('✅ Created test payment:', testPayment.paymentId);
    console.log('   Amount:', testPayment.amount);
    console.log('   Status:', testPayment.status);
    console.log('   Confirmation Status:', testPayment.confirmationStatus);

    // Step 5: Check initial enrollment status
    const initialStudent = await Student.findById(testStudent._id);
    const isInitiallyEnrolled = initialStudent.enrolledCourses.some(
      course => course.courseId.toString() === testCourse._id.toString()
    );
    console.log('✅ Initial enrollment status:', isInitiallyEnrolled ? 'ENROLLED' : 'NOT ENROLLED');

    // Step 6: Simulate admin confirmation (this would normally be done via API)
    console.log('\n🔄 Simulating admin payment confirmation...');
    
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentId: testPayment.paymentId },
      {
        confirmationStatus: 'confirmed',
        status: 'completed',
        adminConfirmedBy: 'admin@test.com',
        adminConfirmedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ Payment confirmed:', updatedPayment.paymentId);
    console.log('   New Status:', updatedPayment.status);
    console.log('   Confirmation Status:', updatedPayment.confirmationStatus);

    // Step 7: Check if course enrollment was triggered
    // Note: The enrollment logic should be in the API endpoint, not here
    // This is just to verify the current state
    const finalStudent = await Student.findById(testStudent._id);
    const isFinallyEnrolled = finalStudent.enrolledCourses.some(
      course => course.courseId.toString() === testCourse._id.toString()
    );
    console.log('✅ Final enrollment status:', isFinallyEnrolled ? 'ENROLLED' : 'NOT ENROLLED');

    // Step 8: Test API endpoint directly
    console.log('\n🔄 Testing API endpoint directly...');
    const axios = require('axios');
    
    try {
      const apiResponse = await axios.put(`http://localhost:5000/api/payments/${testPayment.paymentId}/confirm`, {
        confirmationStatus: 'confirmed',
        adminEmail: 'admin@test.com'
      });
      
      console.log('✅ API Response Status:', apiResponse.status);
      console.log('✅ API Response Data:', apiResponse.data);
      
      // Check enrollment after API call
      const postAPIStudent = await Student.findById(testStudent._id);
      const isEnrolledAfterAPI = postAPIStudent.enrolledCourses.some(
        course => course.courseId.toString() === testCourse._id.toString()
      );
      console.log('✅ Enrollment after API call:', isEnrolledAfterAPI ? 'ENROLLED' : 'NOT ENROLLED');
      
    } catch (apiError) {
      console.error('❌ API Error:', apiError.response?.data || apiError.message);
    }

    console.log('\n🎉 Payment Flow Test Completed!');

  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testPaymentFlow();