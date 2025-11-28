require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-6';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, syntax: String, examples: [String] }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const topics = [
  {
    topicId: 'intro-frontend-testing',
    title: 'Introduction to Frontend Testing',
    content: 'Frontend testing validates UI components, interactions, and browser logic. It simulates user behavior (clicks, inputs, navigation) to catch regressions early and ensure stable releases.',
    syntax: 'test("button works",()=>{/* render, click, assert */})',
    examples: ['Regression checks for UI', 'Simulate user flows without a real browser']
  },
  {
    topicId: 'jest-framework',
    title: 'Understanding Jest: The Testing Framework',
    content: 'Jest is a fast, batteries-included JS testing framework with runner, assertions, mocks, coverage, and snapshots. It integrates with React, TypeScript, Babel, and modern tooling.',
    syntax: 'npm test\nexpect(value).toBe(123)\njest.mock("./module")',
    examples: ['Zero-config setup', 'Parallel test execution']
  },
  {
    topicId: 'unit-tests-jest',
    title: 'Writing Unit Tests in JavaScript with Jest',
    content: 'Unit tests check small pieces in isolation (functions, utils). They improve refactoring confidence and catch logic bugs early.',
    syntax: 'function sum(a,b){return a+b;}\ntest("adds",()=>{expect(sum(2,3)).toBe(5);})',
    examples: ['Formatters and validators', 'Price calculators']
  },
  {
    topicId: 'rtl-components',
    title: 'Testing React Components with React Testing Library',
    content: 'RTL focuses on testing behavior from a user perspective—query DOM by role/text, fire events, and assert visible outcomes. Avoid implementation details.',
    syntax: 'render(<App/>)\nexpect(screen.getByText("Welcome")).toBeInTheDocument()',
    examples: ['Accessible queries (getByRole)', 'Event testing via user-event']
  },
  {
    topicId: 'dom-testing',
    title: 'DOM Testing: Queries, Assertions & Events',
    content: 'Use semantic queries (role, label, text). Assertions validate presence, values, visibility. Events simulate user input and clicks to confirm UI responses.',
    syntax: 'screen.getByRole("button")\nuserEvent.click(btn)',
    examples: ['Assert error messages', 'Check conditional rendering']
  },
  {
    topicId: 'jest-mocking',
    title: 'Mocking Functions, Timers & Modules in Jest',
    content: 'Replace real implementations with controllable fakes. jest.fn, jest.spyOn, fake timers, and module mocks isolate units and control time-dependent behavior.',
    syntax: 'jest.useFakeTimers()\njest.mock("./api")',
    examples: ['Debounce/timer tests', 'Analytics and network mocks']
  },
  {
    topicId: 'api-mocking-msw',
    title: 'API Mocking Using MSW & fetch-mock',
    content: 'Mock Service Worker intercepts network calls at the browser layer for realistic tests. fetch-mock or jest-fetch-mock fakes fetch for unit-level isolation.',
    syntax: 'setupServer(rest.get("/api",(req,res,ctx)=>res(ctx.json({ok:true}))))',
    examples: ['Offline-friendly tests', 'Deterministic API responses']
  },
  {
    topicId: 'snapshot-testing',
    title: 'Snapshot Testing for UI Consistency',
    content: 'Snapshot tests capture rendered output and compare against baselines. They detect unintended UI changes. Use sparingly and update consciously.',
    syntax: 'const {container}=render(<Card/>); expect(container).toMatchSnapshot();',
    examples: ['Card layouts', 'Static content components']
  },
  {
    topicId: 'testing-hooks',
    title: 'Testing React Hooks & Custom Hooks',
    content: 'Test hooks by consuming them in test components or with utilities. Validate state transitions, effects, and cleanup behavior under different inputs.',
    syntax: 'function Comp(){const v=useMyHook(); return <span>{v}</span>;}',
    examples: ['useDebounce correctness', 'Auth/session hooks']
  },
  {
    topicId: 'async-promises',
    title: 'Testing Asynchronous Code & Promises',
    content: 'Use async/await and findBy* queries. Advance timers and flush promises to ensure assertions run after async work completes.',
    syntax: 'await screen.findByText("Loaded")\njest.runAllTimers()',
    examples: ['Loading states', 'Retry/backoff logic']
  },
  {
    topicId: 'forms-input',
    title: 'Testing Forms & User Input Handling',
    content: 'Simulate typing, selection, and submission. Assert validation messages, disabled states, and submitted payloads. Cover edge cases and accessibility.',
    syntax: 'userEvent.type(input,"hello")\nuserEvent.click(submit)',
    examples: ['Email validation', 'Conditional form steps']
  },
  {
    topicId: 'coverage-reporting',
    title: 'Code Coverage & Test Reporting',
    content: 'Measure coverage (statements, branches, lines, functions) to guide missing tests. Integrate reporters (JUnit, HTML) for CI visibility.',
    syntax: 'jest --coverage\ncoverageThreshold in jest config',
    examples: ['Gate low coverage in CI', 'HTML coverage summaries']
  },
  {
    topicId: 'tdd-frontend',
    title: 'Test-Driven Development (TDD) in Frontend Engineering',
    content: 'Write tests first, then implement minimal code to pass. Refactor safely. Encourages better design, decoupling, and confidence in changes.',
    syntax: 'Red → Green → Refactor; start with failing test',
    examples: ['Component behavior-first', 'API contracts via specs']
  },
  {
    topicId: 'ci-cd-testing',
    title: 'CI/CD Integration for Automated Testing',
    content: 'Run tests on pull requests and main via CI. Cache dependencies, upload coverage, and parallelize jobs to keep pipelines fast.',
    syntax: 'GitHub Actions: npm ci && npm test',
    examples: ['Fail fast on regressions', 'Protected branches with checks']
  },
  {
    topicId: 'best-practices',
    title: 'Best Practices for Maintainable & Reliable Tests',
    content: 'Favor user-centric tests, avoid brittle snapshots, mock responsibly, keep tests deterministic, and document intent. Strive for fast, focused suites.',
    syntax: 'Prefer getByRole over getByTestId; isolate flaky async',
    examples: ['Stable queries', 'Clear test names and scopes']
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true});

    const title='Assignment 6 — Testing Frontend Applications';
    const description='15 concise topics covering Jest, RTL, mocks, snapshots, async, forms, coverage, TDD, CI, and best practices.';

    const result=await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set:{ title, description, topics, updatedAt:new Date() } },
      { upsert:true, new:true }
    );

    const count=(result.topics||[]).length;
    console.log(`✅ Upserted assignment '${ASSIGNMENT_ID}'. Topics=${count}`);
    (result.topics||[]).forEach((t,i)=>{
      const len=(t.content||'').length; console.log(`  [${i+1}] ${t.title} | id=${t.topicId} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error upserting Assignment 6 topics:',err);
    try{await mongoose.connection.close();}catch{}
    process.exit(1);
  }
}

run();