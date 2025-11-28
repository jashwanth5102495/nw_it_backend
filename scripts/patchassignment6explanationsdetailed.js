require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'frontend-intermediate-6';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const explanations = {
  'intro-frontend-testing': `1. Introduction to Frontend Testing

Definition:
Frontend testing involves verifying that user interfaces, components, interactions, and browser logic work as expected. It ensures every piece behaves correctly before deployment. Unlike backend testing, frontend testing focuses on UI elements, event handling, and rendering changes.

Use:
Frontend tests help identify issues early such as broken buttons, incorrect rendering, failed API calls, or unexpected UI behavior. Developers use testing tools to simulate clicks, form submissions, and input changes without opening a browser manually.

Importance + Major Use + Advantages:
Testing ensures stable releases, reduces bugs, and improves developer confidence. It also lowers the cost of fixing issues because errors get caught earlier. The advantages include faster development, reduced manual testing, better code design, and higher-quality applications.`,

  'jest-framework': `2. Understanding Jest: The Testing Framework

Definition:
Jest is a JavaScript testing framework created by Facebook, widely used for testing React, Node.js, and Vanilla JS applications. It includes a built-in test runner, mocking system, and assertion library.

Use:
Frontend engineers use Jest to write unit tests, mock API calls, measure code coverage, and run test suites automatically. It integrates seamlessly with modern tooling like Babel, Webpack, TypeScript, and React.

Importance + Advantages:
Jest’s speed, zero configuration, and powerful mocking abilities make it the industry standard. Its snapshot feature and parallel test execution differentiate it from other frameworks.

Command to run tests:

npm test`,

  'unit-tests-jest': `3. Writing Unit Tests in JavaScript with Jest

Definition:
Unit tests check the smallest parts of an application — functions, logic blocks, or utilities — to ensure each behaves correctly in isolation.

Use:
Developers test pure functions like formatters, validators, or mathematical calculations. Jest provides test() and expect() functions for writing assertions.

Syntax Example:

function sum(a, b) { return a + b; }

test("adds numbers correctly", () => {
  expect(sum(2, 3)).toBe(5);
});

Importance + Advantages:
Unit tests catch logical errors early, make refactoring safer, and help maintain complex codebases with confidence.`,

  'rtl-components': `4. Testing React Components with React Testing Library (RTL)

Definition:
RTL is a lightweight React testing tool that focuses on testing components as real users use them—interacting with DOM elements, not internal implementation.

Use:
It renders components in a virtual DOM and queries them with user-focused methods like getByText, getByRole, etc.

Example Syntax:

import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome text", () => {
  render(<App />);
  expect(screen.getByText("Welcome")).toBeInTheDocument();
});

Importance + Advantages:
RTL encourages writing tests that are more stable and less likely to break when refactoring.`,

  'dom-testing': `5. DOM Testing: Queries, Assertions & Events

Definition:
DOM testing verifies how components interact with the Document Object Model—clicks, inputs, visibility, text content, etc.

Use:
Using RTL, developers simulate user actions:

import { fireEvent } from "@testing-library/react";

fireEvent.click(button);
fireEvent.change(input, { target: { value: "hello" } });

Importance:
Helps ensure UI behavior remains correct after changes.
Advantages: Accurate simulation of real user interactions.`,

  'jest-mocking': `6. Mocking Functions, Timers & Modules in Jest

Definition:
Mocking replaces real functions or modules with fake ones so tests run faster and safely.

Use:
Mock asynchronous functions, API requests, timeouts, intervals:

jest.useFakeTimers();
jest.mock("./api");

Importance + Advantages:
Mocks isolate tests, prevent external API calls, and make tests deterministic and reliable.`,

  'api-mocking-msw': `7. API Mocking Using MSW & Jest Fetch Mock

Definition:
API mocking creates fake API responses so that tests don’t depend on real servers.

MSW Example:

rest.get("/api/users", (req, res, ctx) => {
  return res(ctx.json([{ id: 1, name: "John" }]));
});

Importance:
Ensures frontend behavior remains stable even if backend is slow, down, or incomplete.`,

  'snapshot-testing': `8. Snapshot Testing for UI Consistency

Definition:
Snapshot testing saves a component’s rendered output and compares future renders to detect unexpected UI changes.

Syntax:

import renderer from "react-test-renderer";

test("matches snapshot", () => {
  const tree = renderer.create(<Button />).toJSON();
  expect(tree).toMatchSnapshot();
});

Advantages:
Catches accidental UI modifications instantly.`,

  'testing-hooks': `9. Testing React Hooks & Custom Hooks

Definition:
Testing hooks ensures logic inside useState, useEffect, and custom hooks works correctly.

Example using RTL hook testing library:

import { renderHook } from "@testing-library/react";

const { result } = renderHook(() => useCounter());
expect(result.current.count).toBe(0);

Importance:
Hooks contain core business logic — must be reliable.`,

  'async-promises': `10. Testing Asynchronous Code & Promises

Definition:
Async tests confirm correct behavior of functions that use promises, setTimeouts, or async/await.

Example:

test("fetches data", async () => {
  const data = await getData();
  expect(data).toBeDefined();
});

Importance:
Async logic is prone to hidden bugs — testing ensures correctness.`,

  'forms-input': `11. Testing Forms & User Input Handling

Definition:
Form testing includes input changes, validation, submission behavior, and error messages.

Example:

fireEvent.change(input, { target: { value: "test@test.com" } });
expect(input.value).toBe("test@test.com");

Importance:
Forms are core to all apps — failure causes user frustration.`
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
    console.log(`✅ Patched detailed explanations for ${updated} topics on '${ASSIGNMENT_ID}'.`);

    const out = topics.map(t => ({ id: t.topicId || t.id, title: t.title, hasExplanation: !!t.explanation }));
    console.table(out);

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error patching detailed explanations:', err);
    try{await mongoose.connection.close();}catch{}
    process.exit(1);
  }
}

run();