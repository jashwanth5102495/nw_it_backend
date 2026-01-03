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

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('=== USER ACCOUNTS ===');
    const users = await User.find({ role: 'student' });
    console.log(`Found ${users.length} student users:`);
    
    for (const user of users) {
      console.log(`- Username: ${user.username}, ID: ${user._id}`);
      
      // Find corresponding student
      const student = await Student.findOne({ user_id: user._id });
      if (student) {
        console.log(`  -> Student: ${student.firstName} ${student.lastName} (${student.email})`);
      } else {
        console.log(`  -> No student profile found`);
      }
    }
    
    console.log('\n=== STUDENTS WITHOUT USER ACCOUNTS ===');
    const studentsWithoutUsers = await Student.find({});
    for (const student of studentsWithoutUsers) {
      const user = await User.findById(student.user_id);
      if (!user) {
        console.log(`- ${student.firstName} ${student.lastName} (${student.email}) - NO USER ACCOUNT`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
