require('dotenv').config({ path: "../../.env" });
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertCybersecurityIntermediate() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'cybersecurity-intermediate',
      title: 'Cyber Security - Intermediate',
      description: 'Network security, web app security, IAM, and incident response.',
      category: 'DevOps',
      level: 'Intermediate',
      price: 2400,
      duration: '10 weeks',
      modules: [
        { title: 'Network Security', duration: '3 weeks', topics: ['Firewalls', 'IDS/IPS', 'VPNs'] },
        { title: 'Web App Security', duration: '3 weeks', topics: ['OWASP Top 10', 'Input Validation', 'Auth'] },
        { title: 'IAM & IR', duration: '4 weeks', topics: ['RBAC/ABAC', 'SIEM basics', 'Incident Response'] }
      ],
      prerequisites: ['Security beginner or equivalent'],
      learningOutcomes: ['Harden networks/apps', 'Manage access', 'Respond to incidents'],
      instructor: { name: 'Arjun Patel', bio: 'Security Engineer.', experience: '7+ years' },
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
  upsertCybersecurityIntermediate();
}
