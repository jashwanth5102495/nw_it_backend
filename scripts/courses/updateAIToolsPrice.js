const mongoose = require('mongoose');
const Course = require('../../models/Course');
const Student = require('../../models/Student');

// Connect to MongoDB - using the same database as the API
mongoose.connect('mongodb://localhost:27017/jasnav_projects', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateAIToolsPrice = async () => {
  try {
    console.log('Updating AI Tools Mastery course price to ₹12,000...');

    // Update the course price
    const courseUpdate = await Course.findOneAndUpdate(
      { courseId: 'AI-TOOLS-MASTERY' },
      { 
        price: 12000,
        originalPrice: 12000,
        discount: 0 // Ensure no discounts
      },
      { new: true }
    );

    if (courseUpdate) {
      console.log('✅ Course updated successfully:');
      console.log(`   Title: ${courseUpdate.title}`);
      console.log(`   New Price: ₹${courseUpdate.price}`);
      console.log(`   Original Price: ₹${courseUpdate.originalPrice}`);
      console.log(`   Discount: ${courseUpdate.discount}%`);
    } else {
      console.log('❌ Course not found!');
      return;
    }

    // Update Jash Rao's payment history
    console.log('\nUpdating Jash Rao\'s payment history...');
    
    const jashStudent = await Student.findOne({ 
      email: 'jash5012495@gmail.com'
    });

    if (jashStudent) {
      // Find and update the AI Tools Mastery payment
      const paymentIndex = jashStudent.paymentHistory.findIndex(payment => 
        payment.courseId && payment.courseId.toString() === courseUpdate._id.toString()
      );

      if (paymentIndex !== -1) {
        jashStudent.paymentHistory[paymentIndex].amount = 12000;
        await jashStudent.save();
        
        console.log('✅ Payment history updated successfully:');
        console.log(`   New Payment Amount: ₹${jashStudent.paymentHistory[paymentIndex].amount}`);
        console.log(`   Payment Status: ${jashStudent.paymentHistory[paymentIndex].status}`);
      } else {
        console.log('❌ AI Tools Mastery payment not found in Jash Rao\'s history');
      }
    } else {
      console.log('❌ Jash Rao not found!');
    }

    console.log('\n=== Summary ===');
    console.log('✅ AI Tools Mastery course price updated to ₹12,000');
    console.log('✅ No discounts applied (0%)');
    console.log('✅ Jash Rao\'s payment history updated to ₹12,000');

  } catch (error) {
    console.error('Error updating course price:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateAIToolsPrice();