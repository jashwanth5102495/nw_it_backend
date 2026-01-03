require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'frontend-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const explanations = {
  'intro-frontend-testing': 'Testing reduces fear of change by catching regressions before shipping. Focus on user-visible behavior rather than implementation details to keep tests resilient.',
  'jest-framework': 'Jest provides test runner, assertions, mocks, coverage, and snapshots in one tool. Watch mode and parallel runs keep feedback fast; use snapshots thoughtfully.',
  'unit-tests-jest': 'Keep unit tests pure and deterministic. Avoid I/O and globals. Prefer table-driven tests and clear naming that states intent and expected behavior.',
  'rtl-components': 'Use accessible queries (getByRole) and user-event to drive behavior. Assert outcomes the user sees, not internal state or implementation details.',
  'dom-testing': 'Favor semantic queries and accessibility. Visibility and value assertions should mirror user expectations. Use test IDs sparingly.',
  'jest-mocking': 'Mock only what breaks isolation or causes nondeterminism. Fake timers make debounce/polling tests deterministic. Spies verify interactions cleanly.',
  'api-mocking-msw': 'MSW intercepts requests for realistic tests without hitting real servers. For unit-level isolation, mock fetch to control responses and error states.',
  'snapshot-testing': 'Best for presentational, low-volatility components. Avoid snapshotting dynamic/behavior-heavy pieces to reduce brittle failures.',
  'testing-hooks': 'Wrap hooks in thin test components to drive inputs and assert outputs. Advance timers and mock dependencies to make effects predictable.',
  'async-promises': 'Use findBy* for async DOM changes and waitFor for conditions. Drive timers deterministically and mock network to avoid flakiness.',
  'forms-input': 'Type realistically with user-event, include blur/tab to trigger validation. Assert ARIA/error text, verify submitted payloads and disabled states.',
  'coverage-reporting': 'Coverage is a guide, not a goal. Use thresholds to prevent regressions while focusing on meaningful behavior coverage.',
  'tdd-frontend': 'Write failing tests to define behavior, implement minimal code to pass, then refactor safely. TDD encourages modular design and predictable interfaces.',
  'ci-cd-testing': 'Automate tests on PRs and main. Cache dependencies, parallelize jobs, publish coverage and fail fast on regressions.',
  'best-practices': 'Name tests clearly, arrange-act-assert, avoid implementation details, prefer stable queries, and keep suites fast to encourage frequent runs.'
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
    console.log(`✅ Patched explanations for ${updated} topics on '${ASSIGNMENT_ID}'.`);

    const out = topics.map(t => ({ id: t.topicId || t.id, title: t.title, hasExplanation: !!t.explanation }));
    console.table(out);

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error patching explanations:', err);
    try{await mongoose.connection.close();}catch{}
    process.exit(1);
  }
}

run();