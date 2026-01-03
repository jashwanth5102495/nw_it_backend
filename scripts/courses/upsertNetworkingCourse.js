require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertNetworkingIntermediate() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'NETWORKING-INTERMEDIATE',
      title: 'Networking - Intermediate',
      description: 'Strengthen core networking skills across TCP/IP, routing, protocols, and troubleshooting with hands-on practice.',
      category: 'DevOps', // conforms to existing enum
      level: 'Intermediate',
      price: 1800,
      duration: '10 weeks',
      modules: [
        {
          title: 'TCP/IP & Routing Basics',
          duration: '3 weeks',
          topics: ['IPv4/IPv6 addressing', 'Subnetting & CIDR', 'Routing fundamentals', 'Static vs dynamic routing']
        },
        {
          title: 'Protocols & Troubleshooting',
          duration: '3 weeks',
          topics: ['TCP vs UDP', 'HTTP/HTTPS, FTP, SMTP', 'DNS & DHCP', 'Packet analysis & debugging']
        },
        {
          title: 'Network Topologies & Tools',
          duration: '2 weeks',
          topics: ['LAN/WAN/MAN/PAN concepts', 'Common topologies', 'CLI & utilities', 'Packet Tracer labs']
        },
        {
          title: 'Security & Best Practices',
          duration: '2 weeks',
          topics: ['Firewall basics', 'TLS/SSL overview', 'Secure configs', 'Operational playbooks']
        }
      ],
      prerequisites: ['Basic computer networks', 'Familiarity with terminals/CLI'],
      learningOutcomes: [
        'Design and troubleshoot intermediate network setups',
        'Configure IP addressing and routing effectively',
        'Understand and work with core protocols',
        'Use tooling to analyze and resolve network issues'
      ],
      instructor: {
        name: 'Anita Verma',
        bio: 'Network engineer with enterprise operations experience and a focus on practical troubleshooting.',
        experience: '7+ years in Networking & Operations'
      },
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
  upsertNetworkingIntermediate();
}