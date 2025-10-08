const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jasnav_projects', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanTestData() {
  try {
    console.log('🧹 Starting cleanup of test payment data...');

    // Remove test payments (those with test transaction IDs or test student emails)
    const testPaymentResult = await Payment.deleteMany({
      $or: [
        { transactionId: { $regex: /^TEST_/i } },
        { studentEmail: { $regex: /@example\.com$/i } },
        { studentName: { $regex: /test/i } },
        { paymentId: { $regex: /JASH/i } }
      ]
    });
    console.log(`✅ Removed ${testPaymentResult.deletedCount} test payments`);

    // Remove test students
    const testStudentResult = await Student.deleteMany({
      $or: [
        { email: { $regex: /@example\.com$/i } },
        { firstName: { $regex: /test/i } },
        { lastName: { $regex: /test/i } }
      ]
    });
    console.log(`✅ Removed ${testStudentResult.deletedCount} test students`);

    // Remove test users
    const testUserResult = await User.deleteMany({
      $or: [
        { email: { $regex: /@example\.com$/i } },
        { username: { $regex: /test/i } }
      ]
    });
    console.log(`✅ Removed ${testUserResult.deletedCount} test users`);

    // Show remaining data counts
    const remainingPayments = await Payment.countDocuments();
    const remainingStudents = await Student.countDocuments();
    const remainingUsers = await User.countDocuments();

    console.log('\n📊 Remaining data:');
    console.log(`   Payments: ${remainingPayments}`);
    console.log(`   Students: ${remainingStudents}`);
    console.log(`   Users: ${remainingUsers}`);

    console.log('\n✅ Test data cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanTestData();