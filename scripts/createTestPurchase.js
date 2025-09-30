const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const Student = require('../models/Student');

async function createTestPurchase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jasnav_projects');
    console.log('Connected to MongoDB');

    // Find the student
    const student = await Student.findOne({ email: 'jash@example.com' });
    if (!student) {
      console.log('Student not found');
      return;
    }
    console.log('Student found:', student.firstName, student.lastName, 'ID:', student.studentId);

    // Find a course to purchase
    const course = await Course.findOne({ courseId: 'FRONTEND-BEGINNER' });
    if (!course) {
      console.log('Course not found');
      return;
    }
    console.log('Course found:', course.title, 'Price:', course.price);

    // Check if purchase already exists
    const existingPurchase = await Purchase.findOne({
      studentId: student.studentId,
      courseId: course._id
    });

    if (existingPurchase) {
      console.log('Purchase already exists:', existingPurchase.status);
      if (existingPurchase.status !== 'completed') {
        existingPurchase.status = 'completed';
        await existingPurchase.save();
        console.log('Updated purchase status to completed');
      }
    } else {
      // Create a new purchase record
      const purchase = new Purchase({
        studentId: student.studentId,
        courseId: course._id,
        originalPrice: course.price,
        finalPrice: course.price,
        discount: 0,
        paymentId: `TEST_PAYMENT_${Date.now()}`,
        status: 'completed',
        purchaseDate: new Date()
      });

      await purchase.save();
      console.log('Test purchase created successfully');
      console.log('Purchase ID:', purchase._id);
      console.log('Student ID:', purchase.studentId);
      console.log('Course ID:', purchase.courseId);
      console.log('Status:', purchase.status);
    }

    // Verify the purchase
    const purchases = await Purchase.find({ 
      studentId: student.studentId,
      status: 'completed'
    }).populate('courseId');
    
    console.log('\n=== Verification ===');
    console.log('Total completed purchases:', purchases.length);
    if (purchases.length > 0) {
      console.log('Purchased course:', purchases[0].courseId.title);
    }

  } catch (error) {
    console.error('Error creating test purchase:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestPurchase();