const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Course = require('../models/Course');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

async function listCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => {
      console.log(`- ID: ${c._id}, courseId: "${c.courseId}", Title: "${c.title}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

listCourses();
