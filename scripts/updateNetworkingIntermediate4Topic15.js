require('dotenv').config();
const database = require('../config/database');
const Assignment = require('../models/Assignment');

async function run() {
  const assignmentId = 'networking-intermediate-4';
  const topic15 = {
    topicId: 15,
    title: 'Designing an Enterprise Routing & Segmentation Architecture',
    content:
      'Designing enterprise routing involves balancing performance, security, scalability, and cost.\n\n' +
      'Linux offers enterprise-level routing capabilities when properly planned and configured.\n\n' +
      'A well-designed architecture simplifies management, enhances security, and supports future growth.'
  };

  try {
    await database.connect();
    console.log('Connected to MongoDB');

    const before = await Assignment.findOne({ assignmentId });
    if (!before) {
      console.error('Assignment not found:', assignmentId);
      process.exit(1);
    }
    console.log(`Before: topics=${before.topics?.length || 0}`);

    const existingIndex = (before.topics || []).findIndex(t => Number(t.topicId) === 15);
    if (existingIndex >= 0) {
      const setUpdate = {
        $set: {
          [`topics.${existingIndex}.title`]: topic15.title,
          [`topics.${existingIndex}.content`]: topic15.content
        }
      };
      const res = await Assignment.updateOne({ assignmentId }, setUpdate);
      console.log('Updated existing topic 15:', res.modifiedCount);
    } else {
      const res = await Assignment.updateOne({ assignmentId }, { $push: { topics: topic15 } });
      console.log('Appended topic 15:', res.modifiedCount);
    }

    const after = await Assignment.findOne({ assignmentId });
    console.log(`After: topics=${after.topics?.length || 0}`);

    const t15 = (after.topics || []).find(t => Number(t.topicId) === 15);
    if (t15) {
      console.log('Topic 15 present:');
      console.log('- title:', t15.title);
      console.log('- content preview:', String(t15.content).slice(0, 120).replace(/\n/g, ' '), '...');
    } else {
      console.warn('Topic 15 not found after update.');
    }
  } catch (err) {
    console.error('Error updating topic 15:', err);
  } finally {
    await database.close();
    console.log('Disconnected from MongoDB');
  }
}

run();