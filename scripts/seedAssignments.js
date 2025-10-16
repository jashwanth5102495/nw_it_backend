require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const assignmentData = require('../data/assignmentSeedData.json');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedAssignments() {
  try {
    console.log('🌱 Starting assignment seeding...');
    
    // Debug: Check first assignment structure
    console.log('\n🔍 First assignment sample:');
    console.log(JSON.stringify(assignmentData[0], null, 2).substring(0, 500));
    
    // Clear existing assignments
    const deleteResult = await Assignment.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing assignments`);
    
    // Insert new assignments
    const insertedAssignments = await Assignment.insertMany(assignmentData);
    console.log(`✅ Successfully seeded ${insertedAssignments.length} assignments`);
    
    // Display summary
    console.log('\n📊 Assignment Summary:');
    insertedAssignments.forEach(assignment => {
      console.log(`  • ${assignment.title} (ID: ${assignment.assignmentId})`);
      console.log(`    - Topics: ${assignment.topics.length}`);
      console.log(`    - Questions: ${assignment.questions.length}`);
      console.log(`    - Passing: ${assignment.passingPercentage}%`);
    });
    
    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAssignments();
