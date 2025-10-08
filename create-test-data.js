const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Payment = require('./models/Payment');

async function createTestData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jasnav_it');
    console.log('Connected to MongoDB');

    // Check if user already exists, if not create one
    let user = await User.findOne({ username: 'johndoe' });
    if (!user) {
      user = new User({
        username: 'johndoe',
        password: 'password123',
        role: 'student'
      });
      await user.save();
      console.log('User created:', user._id);
    } else {
      console.log('User already exists:', user._id);
    }

    // Create a test course
    const course = new Course({
      title: 'Full Stack Web Development',
      courseId: 'FSWD001',
      description: 'Complete full stack development course covering frontend, backend, and database technologies',
      category: 'Full Stack Development',
      price: 15000,
      duration: '6 months',
      level: 'Beginner',
      modules: [{
        title: 'Introduction to Web Development',
        duration: '2 weeks',
        topics: ['HTML', 'CSS', 'JavaScript']
      }],
      learningOutcomes: ['Build full stack web applications', 'Master modern web technologies'],
      instructor: {
        name: 'John Smith',
        bio: 'Experienced full stack developer',
        experience: '5+ years in web development'
      }
    });
    await course.save();
    console.log('Course created:', course._id);

    // Create a test student
    const student = new Student({
      user_id: user._id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      studentId: 'STU001',
      education: 'bachelors',
      dateOfBirth: new Date('1995-01-01'),
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      enrolledCourses: [{
        courseId: course._id,
        enrollmentDate: new Date(),
        progress: 25,
        status: 'active'
      }],
      paymentHistory: []
    });
    await student.save();
    console.log('Student created:', student._id);

    // Create a test payment
    const payment = new Payment({
      paymentId: 'PAY001',
      studentId: student._id,
      courseId: course._id,
      courseName: course.title,
      amount: 15000,
      originalAmount: 15000,
      status: 'completed',
      confirmationStatus: 'waiting_for_confirmation',
      transactionId: 'TXN001',
      paymentMethod: 'manual_qr',
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email
    });
    await payment.save();
    console.log('Payment created:', payment._id);

    console.log('Test data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();