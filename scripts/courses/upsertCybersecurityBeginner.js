require('dotenv').config({ path: "../../.env" });
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertCybersecurityBeginner() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'cybersecurity-beginner',
      title: 'Cyber Security - Beginner',
      description: 'Security fundamentals, threat models, basic tools and best practices.',
      category: 'DevOps', // adhere to backend enum
      level: 'Beginner',
      price: 1600,
      duration: '8 weeks',
      modules: [
        { title: 'Security Basics', duration: '3 weeks', topics: ['CIA Triad', 'Threats', 'Controls'] },
        { title: 'Tools & Practices', duration: '3 weeks', topics: ['Nmap basics', 'Wireshark basics', 'Passwords'] },
        { title: 'Secure By Default', duration: '2 weeks', topics: ['Hardening', 'Updates', 'Backups'] }
      ],
      prerequisites: ['Basic IT knowledge'],
      learningOutcomes: ['Understand core security', 'Use basic tools', 'Apply best practices'],
      instructor: { name: 'Neha Singh', bio: 'Security Analyst.', experience: '5+ years' },
      isActive: true
    };

    const updated = await Course.findOneAndUpdate(
      { courseId: courseDoc.courseId },
      { $set: courseDoc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Upserted course: ${updated.courseId} → ${updated.title}`);
    console.log(`Category: ${updated.category}, Level: ${updated.level}, Price: ${updated.price}`);
  } catch (err) {
    console.error('❌ Error upserting course:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  upsertCybersecurityBeginner();
}
