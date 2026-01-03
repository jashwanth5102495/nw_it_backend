const mongoose = require('mongoose');
const Course = require('../../models/Course');
const Student = require('../../models/Student');

// Connect to MongoDB - using the same database as the API
mongoose.connect('mongodb://localhost:27017/jasnav_projects', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkAIToolsCourse = async () => {
  try {
    console.log('Checking AI Tools Mastery course data...');

    // Find the AI Tools Mastery course
    const aiToolsCourse = await Course.findOne({ 
      $or: [
        { courseId: 'AI-TOOLS-MASTERY' },
        { title: /AI Tools Mastery/i }
      ]
    });

    if (aiToolsCourse) {
      console.log('\n=== AI Tools Mastery Course ===');
      console.log(`Title: ${aiToolsCourse.title}`);
      console.log(`Course ID: ${aiToolsCourse.courseId}`);
      console.log(`Price: ₹${aiToolsCourse.price}`);
      console.log(`Original Price: ₹${aiToolsCourse.originalPrice || 'Not set'}`);
      console.log(`Discount: ${aiToolsCourse.discount || 0}%`);
      console.log(`Description: ${aiToolsCourse.description}`);
      console.log(`Duration: ${aiToolsCourse.duration}`);
      console.log(`Level: ${aiToolsCourse.level}`);
      console.log(`Status: ${aiToolsCourse.status}`);
    } else {
      console.log('AI Tools Mastery course not found!');
    }

    // Check Jash Rao's payment history for this course
    console.log('\n=== Jash Rao Payment History ===');
    const jashStudent = await Student.findOne({ 
      email: 'jash5012495@gmail.com'
    }).populate('paymentHistory.courseId');

    if (jashStudent) {
      const aiToolsPayment = jashStudent.paymentHistory.find(payment => 
        payment.courseId && (
          payment.courseId.courseId === 'AI-TOOLS-MASTERY' ||
          payment.courseId.title.includes('AI Tools Mastery')
        )
      );

      if (aiToolsPayment) {
        console.log(`Payment Amount: ₹${aiToolsPayment.amount}`);
        console.log(`Payment Status: ${aiToolsPayment.status}`);
        console.log(`Payment Date: ${aiToolsPayment.paymentDate}`);
      } else {
        console.log('No AI Tools Mastery payment found for Jash Rao');
      }
    }

  } catch (error) {
    console.error('Error checking course data:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkAIToolsCourse();