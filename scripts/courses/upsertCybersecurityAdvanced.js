require('dotenv').config({ path: "../../.env" });
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertCybersecurityAdvanced() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'cybersecurity-advanced',
      title: 'Cyber Security - Advanced',
      description: 'Pen testing, forensics, advanced defense strategies.',
      category: 'DevOps',
      level: 'Advanced',
      price: 3200,
      duration: '12 weeks',
      modules: [
        { title: 'Penetration Testing', duration: '4 weeks', topics: ['Recon', 'Exploitation', 'Reporting'] },
        { title: 'Digital Forensics', duration: '4 weeks', topics: ['Acquisition', 'Analysis', 'Chain of Custody'] },
        { title: 'Advanced Defense', duration: '4 weeks', topics: ['Zero Trust', 'Threat Hunting', 'Purple Teaming'] }
      ],
      prerequisites: ['Security intermediate knowledge'],
      learningOutcomes: ['Conduct pen tests', 'Perform forensics', 'Design defenses'],
      instructor: { name: 'Kiran Rao', bio: 'Cyber Defense Lead.', experience: '10+ years' },
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
  upsertCybersecurityAdvanced();
}
