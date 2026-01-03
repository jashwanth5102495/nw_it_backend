const mongoose = require('mongoose');
const User = require('../../models/User');
require('dotenv').config();

// Use the same connection string as the server
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected to: ${mongoURI}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Create test user
const createTestUser = async () => {
  try {
    console.log('🔄 Creating test user "testuser"...');
    
    // Delete any existing testuser
    const deleteResult = await User.deleteMany({ username: 'testuser' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing testuser(s)`);
    
    // Create new test user
    const newUser = new User({
      username: 'testuser',
      password: 'test123', // Will be hashed by pre-save middleware
      role: 'user'
    });

    await newUser.save();
    
    console.log('✅ User "testuser" created successfully!');
    
    // Verify the user was created correctly
    const verifyUser = await User.findOne({ username: 'testuser' });
    if (verifyUser) {
      console.log('\n✅ Verification successful:');
      console.log(`   ID: ${verifyUser._id}`);
      console.log(`   Username: ${verifyUser.username}`);
      console.log(`   Role: ${verifyUser.role}`);
      
      // Test password comparison
      const isPasswordValid = await verifyUser.comparePassword('test123');
      console.log(`   Password test: ${isPasswordValid ? 'VALID ✅' : 'INVALID ❌'}`);
      
      if (isPasswordValid) {
        console.log('\n🎉 Test user is ready for login!');
        console.log('   ┌─────────────────────────────────────┐');
        console.log('   │  Username: testuser                │');
        console.log('   │  Password: test123                 │');
        console.log('   └─────────────────────────────────────┘');
      }
    }
    
    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({});
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.role}) - ID: ${user._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestUser();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

// Run the script
main().catch(console.error);