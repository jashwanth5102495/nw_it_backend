const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const Student = require('../../models/Student');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Payment = require('../../models/Payment');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nw_it';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`Connected to MongoDB: ${uri}`);
}

async function findCourseByTitleOrId(identifier) {
  if (!identifier) return null;
  // Try exact courseId or ObjectId
  let course = null;
  if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
    course = await Course.findById(identifier);
    if (course) return course;
  }
  course = await Course.findOne({ courseId: identifier });
  if (course) return course;
  // Case-insensitive title
  course = await Course.findOne({ title: new RegExp(`^${identifier}$`, 'i') });
  if (course) return course;
  return null;
}

async function ensurePayment(student, course, opts = {}) {
  // Find latest payment
  const existing = await Payment.findOne({ studentId: student._id, courseId: course._id }).sort({ createdAt: -1 });
  if (existing) {
    console.log(`Payment already exists for ${course.title}: status=${existing.status}, confirmation=${existing.confirmationStatus}`);
    return existing;
  }
  const now = Date.now();
  const payment = new Payment({
    paymentId: `RESTORE_${course.courseId || course._id}_${now}`,
    studentId: student._id,
    courseId: course._id,
    courseName: course.title,
    amount: course.price,
    originalAmount: course.price,
    paymentMethod: 'manual_restore',
    transactionId: `RESTORE_TXN_${now}`,
    status: opts.status || 'completed',
    confirmationStatus: opts.confirmationStatus || 'confirmed',
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    studentEmail: student.email,
    referralCode: null,
    currency: 'INR'
  });
  await payment.save();
  console.log(`Created payment record for ${course.title} with id=${payment.paymentId}`);
  return payment;
}

async function restoreEnrollments(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Provide a valid email as argv[2], e.g., node scripts/restorePurchasesByEmail.js user@example.com');
  }

  await connectDB();

  // Find student
  const student = await Student.findOne({ email: email.toLowerCase() });
  if (!student) {
    console.log(`No Student found for email ${email}. Please log out and log in with Google to create your profile, then re-run.`);
    return;
  }
  console.log(`Student located: ${student.firstName} ${student.lastName} (${student.email})`);

  // Resolve courses
  const targets = [
    'Frontend Development - Beginner',
    'Frontend Development - Intermediate'
  ];
  const courses = [];
  for (const id of targets) {
    const course = await findCourseByTitleOrId(id);
    if (!course) {
      console.log(`Course not found: ${id}`);
    } else {
      console.log(`Course resolved: ${course.title} (${course._id})`);
      courses.push(course);
    }
  }
  if (courses.length === 0) {
    console.log('No target courses resolved. Ensure seeding ran and try again.');
    return;
  }

  // Enroll courses if missing
  let updated = false;
  for (const course of courses) {
    const already = student.enrolledCourses.some(ec => ec.courseId.toString() === course._id.toString());
    if (already) {
      console.log(`Already enrolled: ${course.title}`);
    } else {
      student.enrolledCourses.push({
        courseId: course._id,
        enrollmentDate: new Date(),
        progress: 0,
        status: 'active',
        confirmationStatus: 'confirmed'
      });
      console.log(`Enrolled in course: ${course.title}`);
      updated = true;
    }
    // Ensure there is a payment record
    await ensurePayment(student, course, { status: 'completed', confirmationStatus: 'confirmed' });
  }

  if (updated) {
    await student.save();
    console.log('Student enrollments updated and saved.');
  } else {
    console.log('No enrollment changes needed.');
  }

  // Print summary
  const fresh = await Student.findById(student._id).populate('enrolledCourses.courseId');
  console.log(`\nSummary for ${fresh.email}:`);
  for (const ec of fresh.enrolledCourses) {
    console.log(`- ${ec.courseId.title} | status=${ec.status} | progress=${ec.progress}% | enrolled=${ec.enrollmentDate.toISOString()}`);
  }

  await mongoose.disconnect();
}

const emailArg = process.argv[2];
restoreEnrollments(emailArg).catch(async (err) => {
  console.error('Restore failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});