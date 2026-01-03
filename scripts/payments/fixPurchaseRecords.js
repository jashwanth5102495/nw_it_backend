const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Purchase = require('../../models/Purchase');
const Student = require('../../models/Student');

async function fixPurchaseRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vstudents');
    console.log('Connected to MongoDB');

    // Find all Purchase records where studentId looks like an email
    const emailPurchases = await Purchase.find({
      studentId: { $regex: /@/ }
    });

    console.log(`Found ${emailPurchases.length} Purchase records with email as studentId`);

    if (emailPurchases.length === 0) {
      console.log('No Purchase records need fixing');
      return;
    }

    let fixedCount = 0;
    let notFoundCount = 0;

    for (const purchase of emailPurchases) {
      console.log(`\nProcessing purchase ${purchase._id} with email: ${purchase.studentId}`);
      
      // Find the student by email
      const student = await Student.findOne({ email: purchase.studentId });
      
      if (student) {
        // Update the purchase record with the correct studentId
        purchase.studentId = student.studentId;
        await purchase.save();
        console.log(`✓ Fixed: Updated to studentId ${student.studentId}`);
        fixedCount++;
      } else {
        console.log(`✗ Student not found for email: ${purchase.studentId}`);
        notFoundCount++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total records processed: ${emailPurchases.length}`);
    console.log(`Successfully fixed: ${fixedCount}`);
    console.log(`Student not found: ${notFoundCount}`);

  } catch (error) {
    console.error('Error fixing purchase records:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixPurchaseRecords();