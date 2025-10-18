const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    console.log(`🔗 Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected');

    const username = 'test_student_user';
    const password = 'assign123';

    // Clean any existing user/student for idempotency
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('🗑️  Deleting existing test user and linked student...');
      await Student.deleteMany({ user_id: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create user with student role
    const user = new User({ username, password, role: 'student' });
    await user.save();
    console.log(`✅ Created user: ${user.username} (${user._id})`);

    // Create student linked to user
    const student = new Student({
      user_id: user._id,
      studentId: `STU-${uuidv4().substring(0,8).toUpperCase()}`,
      firstName: 'Test',
      lastName: 'Student',
      email: `test.student.${Date.now()}@example.com`,
      phone: '1234567890',
      education: 'bachelors',
      experience: 'beginner',
      dateOfBirth: new Date('1995-01-01'),
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'United States'
      }
    });
    await student.save();
    console.log(`✅ Created student: ${student.firstName} ${student.lastName} (${student._id})`);

    console.log('\n🎫 Credentials for login:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

  } catch (err) {
    console.error('❌ Error creating test student:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

run();