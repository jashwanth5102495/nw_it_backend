const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nw_it_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const removeMockStudents = async () => {
  try {
    console.log('Starting to remove mock students...');

    // List of mock student emails to remove
    const mockEmails = [
      'newuser.1758433316285@example.com',
      'newuser.1758433292095@example.com',
      'jane.doe.1758432507704@example.com',
      'jane.doe@example.com',
      'test@example.com'
    ];

    // Find and remove mock students
    for (const email of mockEmails) {
      console.log(`Looking for student with email: ${email}`);
      
      // Find the student
      const student = await Student.findOne({ email: email });
      
      if (student) {
        console.log(`Found student: ${student.firstName} ${student.lastName} (${student.email})`);
        
        // Find and remove associated user account
        const user = await User.findById(student.user_id);
        if (user) {
          await User.findByIdAndDelete(student.user_id);
          console.log(`Removed user account: ${user.username}`);
        }
        
        // Remove the student
        await Student.findByIdAndDelete(student._id);
        console.log(`Removed student: ${student.firstName} ${student.lastName}`);
      } else {
        console.log(`No student found with email: ${email}`);
      }
    }

    // Also remove any students with "New User" as firstName
    const newUserStudents = await Student.find({ firstName: 'New User' });
    console.log(`Found ${newUserStudents.length} students with firstName 'New User'`);
    
    for (const student of newUserStudents) {
      console.log(`Removing New User student: ${student.email}`);
      
      // Remove associated user account
      const user = await User.findById(student.user_id);
      if (user) {
        await User.findByIdAndDelete(student.user_id);
        console.log(`Removed user account: ${user.username}`);
      }
      
      // Remove the student
      await Student.findByIdAndDelete(student._id);
      console.log(`Removed student: ${student.firstName} ${student.lastName} (${student.email})`);
    }

    // Also remove any students with "Jane Doe" as name
    const janeDoeStudents = await Student.find({ 
      firstName: 'Jane', 
      lastName: 'Doe' 
    });
    console.log(`Found ${janeDoeStudents.length} students named 'Jane Doe'`);
    
    for (const student of janeDoeStudents) {
      console.log(`Removing Jane Doe student: ${student.email}`);
      
      // Remove associated user account
      const user = await User.findById(student.user_id);
      if (user) {
        await User.findByIdAndDelete(student.user_id);
        console.log(`Removed user account: ${user.username}`);
      }
      
      // Remove the student
      await Student.findByIdAndDelete(student._id);
      console.log(`Removed student: ${student.firstName} ${student.lastName} (${student.email})`);
    }

    // Also remove any students with "Test Student" as name
    const testStudents = await Student.find({ 
      firstName: 'Test', 
      lastName: 'Student' 
    });
    console.log(`Found ${testStudents.length} students named 'Test Student'`);
    
    for (const student of testStudents) {
      console.log(`Removing Test Student: ${student.email}`);
      
      // Remove associated user account
      const user = await User.findById(student.user_id);
      if (user) {
        await User.findByIdAndDelete(student.user_id);
        console.log(`Removed user account: ${user.username}`);
      }
      
      // Remove the student
      await Student.findByIdAndDelete(student._id);
      console.log(`Removed student: ${student.firstName} ${student.lastName} (${student.email})`);
    }

    console.log('Mock student removal completed!');
    
    // Show remaining students
    const remainingStudents = await Student.find({}).select('firstName lastName email');
    console.log('\nRemaining students:');
    remainingStudents.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
    });

  } catch (error) {
    console.error('Error removing mock students:', error);
  } finally {
    mongoose.connection.close();
  }
};

removeMockStudents();