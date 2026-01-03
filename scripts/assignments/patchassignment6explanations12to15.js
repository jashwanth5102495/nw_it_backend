require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'frontend-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const explanations = {
  'coverage-reporting': `12. Code Coverage & Test Reporting\n\nDefinition:\nCode coverage measures how much of your code is tested using metrics like line, function, and branch coverage.\n\nCommand:\n\nnpm test -- --coverage\n\nImportance:\nHelps identify untested areas and improve software reliability.`,

  'tdd-frontend': `13. Test-Driven Development (TDD) in Frontend\n\nDefinition:\nTDD is a methodology where developers write tests BEFORE writing code:\nRed → Green → Refactor cycle.\n\nImportance:\nResults in cleaner code, fewer bugs, and better architecture.\n\nAdvantages:\nEncourages modular, testable systems.`,

  'ci-cd-testing': `14. CI/CD Integration for Automated Testing\n\nDefinition:\nCI/CD (Continuous Integration / Continuous Deployment) runs tests automatically on every push or pull request.\n\nExample: GitHub Actions Workflow\n\n- name: Run Tests\n  run: npm test\n\nImportance:\nEnsures code quality across teams and environments.`,

  'best-practices': `15. Best Practices for Writing Maintainable Tests\n\nDefinition:\nBest practices include writing independent tests, avoiding over-mocking, using meaningful test names, and organizing test files properly.\n\nExample Test Structure:\n\n/src\n  /components\n    Button.js\n    Button.test.js\n\nAdvantages:\nHigher readability, easier debugging, and scalable test suites.`
};

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if(!doc){
      console.error('Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    let updated = 0;
    const topics = doc.topics || [];
    for(const t of topics){
      const key = t.topicId || t.id || t.title;
      if(explanations[key]){
        t.explanation = explanations[key];
        updated++;
      }
    }

    await Assignment.updateOne({ assignmentId: ASSIGNMENT_ID }, { $set: { topics, updatedAt: new Date() }});
    console.log(`✅ Patched explanations for topics 12–15 on '${ASSIGNMENT_ID}'. Updated: ${updated}`);

    const out = topics.map(t => ({ idx: t.index, id: t.topicId || t.id, title: t.title, hasExplanation: !!t.explanation }));
    console.table(out);

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error patching explanations 12–15:', err);
    try{await mongoose.connection.close();}catch{}
    process.exit(1);
  }
}

run();