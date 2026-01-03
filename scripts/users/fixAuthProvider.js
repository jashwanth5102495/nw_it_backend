/**
 * Quick Fix: Ensure all existing users have authProvider and googleId set
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/User');
const Student = require('../../models/Student');

const run = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/jasnav_it');
    console.log('✓ Connected to MongoDB\n');
    
    // Update Users
    console.log('Updating User records...');
    const userResult = await User.updateMany(
      { authProvider: { $exists: false } },
      { $set: { authProvider: 'local', googleId: null } }
    );
    console.log(`✓ Updated ${userResult.modifiedCount} users`);
    
    // Update Students
    console.log('\nUpdating Student records...');
    const studentResult = await Student.updateMany(
      { authProvider: { $exists: false } },
      { $set: { authProvider: 'local', googleId: null, setupRequired: false } }
    );
    console.log(`✓ Updated ${studentResult.modifiedCount} students`);
    
    // Verify
    console.log('\n--- Verification ---');
    const usersWithAuth = await User.countDocuments({ authProvider: { $exists: true } });
    const totalUsers = await User.countDocuments({});
    console.log(`Users with authProvider: ${usersWithAuth}/${totalUsers}`);
    
    const studentsWithAuth = await Student.countDocuments({ authProvider: { $exists: true } });
    const totalStudents = await Student.countDocuments({});
    console.log(`Students with authProvider: ${studentsWithAuth}/${totalStudents}`);
    
    console.log('\n✓ Migration complete!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
