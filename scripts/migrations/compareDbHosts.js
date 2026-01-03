require('dotenv').config();
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('AssignmentCompare', assignmentSchema, 'assignments');

const ASSIGNMENT_ID = 'networking-intermediate-1';

async function check(uri, label){
  try {
    await mongoose.connect(uri);
    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if(!doc){
      console.log(`[${label}] not found`);
    } else {
      const qCount = Array.isArray(doc.questions) ? doc.questions.length : 0;
      console.log(`[${label}] _id=${doc._id} questions=${qCount} title='${doc.title}' updatedAt=${doc.updatedAt}`);
    }
  } catch(e){
    console.error(`[${label}] error:`, e.message);
  } finally {
    try{ await mongoose.connection.close(); }catch{}
  }
}

(async()=>{
  const uriLocalhost = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
  const uri127 = 'mongodb://127.0.0.1:27017/jasnav_projects';
  await check(uriLocalhost, 'localhost');
  await check(uri127, '127.0.0.1');
})();