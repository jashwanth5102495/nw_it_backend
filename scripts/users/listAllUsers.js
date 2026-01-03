const mongoose = require('mongoose');
const User = require('../../models/User');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav-it-solutions', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// List all users
const listAllUsers = async () => {
  try {
    console.log('📋 Listing all users in database...');
    console.log('='.repeat(50));
    
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s):`);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Username: "${user.username}"`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      console.log('');
    });
    
    // Test search for 'rohan'
    console.log('🔍 Testing search for "rohan"...');
    const rohanUser = await User.findOne({ username: 'rohan' });
    console.log(`   Direct search result: ${rohanUser ? 'FOUND' : 'NOT FOUND'}`);
    
    // Test search with toLowerCase
    const rohanUserLower = await User.findOne({ username: 'rohan'.toLowerCase().trim() });
    console.log(`   Lowercase search result: ${rohanUserLower ? 'FOUND' : 'NOT FOUND'}`);
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await listAllUsers();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
};

// Run the script
main().catch(console.error);