const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../../models/User');
const Student = require('../../models/Student');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nwit', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createUserForStudent = async () => {
  try {
    await connectDB();
    
    // Find a student without a user account
    const students = await Student.find({});
    console.log(`Found ${students.length} students`);
    
    if (students.length > 0) {
      const student = students[0]; // Use the first student
      console.log(`Creating user account for: ${student.firstName} ${student.lastName}`);
      
      // Create a user account
      const user = new User({
        username: 'testuser123',
        password: 'password123',
        role: 'student'
      });
      
      await user.save();
      console.log('✅ User account created');
      
      // Update the student to reference this user
      student.user_id = user._id;
      await student.save();
      console.log('✅ Student updated with user reference');
      
      console.log('Test credentials:');
      console.log(`Username: testuser123`);
      console.log(`Password: password123`);
      console.log(`Student: ${student.firstName} ${student.lastName}`);
      
    } else {
      console.log('No students found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUserForStudent();
