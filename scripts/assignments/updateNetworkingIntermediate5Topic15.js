require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-5';

const topic15 = {
  topicId: 'designing-secure-enterprise-vpn-architectures',
  title: 'Designing Secure Enterprise VPN Architectures',
  content:
    'Designing VPN architectures requires balancing security, performance, and manageability.\n\n' +
    'Linux provides flexible tools for building scalable and secure VPN solutions.\n\n' +
    'A well-designed VPN architecture protects enterprise assets while supporting remote connectivity needs.'
};

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!before) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const topics = Array.isArray(before.topics) ? before.topics : [];
    console.log('Before:', { title: before.title, topics: topics.length });

    // Check if topic 15 already exists by slug or numeric id 15
    const existingIndex = topics.findIndex(
      (t) => t?.topicId === topic15.topicId || Number(t?.topicId) === 15
    );

    if (existingIndex >= 0) {
      const res = await Assignment.updateOne(
        { assignmentId: ASSIGNMENT_ID },
        {
          $set: {
            [`topics.${existingIndex}.title`]: topic15.title,
            [`topics.${existingIndex}.content`]: topic15.content,
            [`topics.${existingIndex}.topicId`]: topic15.topicId
          },
          $currentDate: { updatedAt: true }
        }
      );
      console.log('Updated existing topic 15:', { modified: res.modifiedCount });
    } else {
      const res = await Assignment.updateOne(
        { assignmentId: ASSIGNMENT_ID },
        { $push: { topics: topic15 }, $currentDate: { updatedAt: true } }
      );
      console.log('Appended topic 15:', { modified: res.modifiedCount });
    }

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const afterTopics = Array.isArray(after.topics) ? after.topics : [];
    const last = afterTopics[afterTopics.length - 1] || {};
    console.log('After:', {
      title: after.title,
      topics: afterTopics.length,
      lastTopicTitle: last.title,
      lastTopicId: last.topicId
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();