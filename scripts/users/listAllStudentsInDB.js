const mongoose = require('mongoose');
const Student = require('../../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nw_it_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const listAllStudentsInDB = async () => {
  try {
    console.log('Listing all students directly from database...');

    // Get all students without any filters
    const allStudents = await Student.find({});
    
    console.log(`Total students in database: ${allStudents.length}`);
    
    allStudents.forEach((student, index) => {
      console.log(`\n--- Student ${index + 1} ---`);
      console.log(`Name: "${student.firstName}" "${student.lastName}"`);
      console.log(`Email: ${student.email}`);
      console.log(`Student ID: ${student.studentId}`);
      console.log(`isActive: ${student.isActive}`);
      console.log(`Enrolled Courses: ${student.enrolledCourses?.length || 0}`);
      console.log(`Payment History: ${student.paymentHistory?.length || 0}`);
      console.log(`Created At: ${student.createdAt}`);
    });

    // Now check with the API filter
    console.log('\n=== Students with isActive: true ===');
    const activeStudents = await Student.find({ isActive: true });
    console.log(`Active students: ${activeStudents.length}`);
    
    activeStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
    });

  } catch (error) {
    console.error('Error listing students:', error);
  } finally {
    mongoose.connection.close();
  }
};

listAllStudentsInDB();