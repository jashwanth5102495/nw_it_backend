require('dotenv').config({ path: "../../.env" });
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertNetworkingBeginner() {
  try {
    console.log(process.env.MONGODB_URI);
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'NETWORKING-BEGINNER',
      title: 'Networking - Beginner',
      description: 'Foundation in networking: OSI/TCP-IP, basic protocols, Packet Tracer, Nmap, Wireshark.',
      category: 'DevOps', // adhere to backend enum
      level: 'Beginner',
      price: 1500,
      duration: '8 weeks',
      modules: [
        {
          title: 'Networking Fundamentals',
          duration: '2 weeks',
          topics: ['OSI Model', 'TCP/IP', 'IPv4/IPv6', 'DNS/DHCP']
        },
        {
          title: 'Packet Tracer Basics',
          duration: '2 weeks',
          topics: ['Router/Switch setup', 'LAN/WAN topology', 'IP addressing']
        },
        {
          title: 'Nmap & Wireshark',
          duration: '2 weeks',
          topics: ['Host discovery', 'Port scanning', 'Packet capture', 'Traffic filtering']
        }
      ],
      prerequisites: ['Basic computer knowledge'],
      learningOutcomes: [
        'Understand core networking fundamentals',
        'Configure small networks in Packet Tracer',
        'Analyze traffic using Wireshark and Nmap'
      ],
      instructor: {
        name: 'Network Foundations Team',
        bio: 'Network engineers focused on core concepts and practical labs.',
        experience: '5+ years in Networking & Training'
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
  upsertNetworkingBeginner();
}