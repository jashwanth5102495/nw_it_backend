const fs = require('fs');
const path = require('path');
const Assignment = require('../models/Assignment');

// Minimal topic expansion packs to ensure >=15 topics for key beginner assignments
const topicPacks = {
  'frontend-beginner-2': [
    { topicId: 'html-tables', title: 'HTML Tables', content: 'Create tabular data using <table>, <tr>, <th>, and <td>. Covers headers, captions, colspan/rowspan, and accessibility.' },
    { topicId: 'html-lists', title: 'HTML Lists', content: 'Ordered <ol>, unordered <ul>, and description <dl> lists. Nested lists and styling basics.' },
    { topicId: 'html-meta', title: 'HTML Meta & Head', content: 'Use <meta>, <title>, <link>, and <script> in <head> for SEO, viewport, favicons, and resource loading.' },
    { topicId: 'html-media', title: 'Audio & Video', content: 'Embed media with <audio> and <video>, controls, sources, formats, and captions.' },
    { topicId: 'html-iframe', title: 'Iframes & Embeds', content: 'Embed external content securely; sandbox, allow attributes, and responsive iframes.' },
    { topicId: 'html-entities', title: 'HTML Entities', content: 'Represent reserved characters (&lt;, &amp;) and symbols using named and numeric entities.' },
    { topicId: 'html-forms-advanced', title: 'Forms: Advanced', content: 'Attributes (autocomplete, novalidate), validation patterns, required fields, and accessibility.' },
    { topicId: 'html-accessibility', title: 'Accessibility Basics', content: 'Semantic roles, labels, alt text, headings hierarchy, and keyboard navigation.' },
    { topicId: 'html-canvas', title: 'Canvas Basics', content: 'Draw shapes and text using the <canvas> API for dynamic graphics.' },
    { topicId: 'html-svg', title: 'Inline SVG', content: 'Use scalable vector graphics inline; paths, shapes, viewBox, and icons.' },
    { topicId: 'html-storage', title: 'Web Storage APIs', content: 'Overview of localStorage, sessionStorage for client-side persistence.' }
  ],
  'frontend-beginner-5': [
    { topicId: 'css-selectors-advanced', title: 'Advanced Selectors', content: 'Attribute selectors, combinators, :not(), :is(), :where(), and specificity implications.' },
    { topicId: 'css-specificity', title: 'Specificity & Inheritance', content: 'Specificity calculation, cascade layers, and managing conflicts.' },
    { topicId: 'css-positioning', title: 'Positioning', content: 'static, relative, absolute, fixed, sticky; stacking contexts and z-index.' },
    { topicId: 'css-display', title: 'Display & Visibility', content: 'display types, visibility, opacity, overflow, and layout implications.' },
    { topicId: 'css-flexbox', title: 'Flexbox', content: 'One‑dimensional layout: container and item properties, alignment, wrapping.' },
    { topicId: 'css-grid', title: 'CSS Grid', content: 'Two‑dimensional layout: tracks, areas, fr units, auto-placement, responsiveness.' },
    { topicId: 'css-media-queries', title: 'Responsive Design', content: 'Media queries, mobile‑first approach, breakpoints, responsive units.' },
    { topicId: 'css-transforms', title: 'Transforms', content: 'translate, scale, rotate, skew, transform-origin, 3D basics.' },
    { topicId: 'css-transitions', title: 'Transitions', content: 'Timing functions, delays, multiple properties, performance tips.' },
    { topicId: 'css-animations', title: 'Animations', content: '@keyframes, animation properties, chaining and state management.' },
    { topicId: 'css-variables', title: 'CSS Variables', content: 'Custom properties, var(), theming, and scope.' },
    { topicId: 'css-filters', title: 'Filters & Backdrop', content: 'filter(), backdrop-filter for blurs, contrast; compatibility notes.' },
    { topicId: 'css-typography', title: 'Typography', content: 'font stacks, line-height, letter-spacing, text-shadow, variable fonts.' }
  ],
  'frontend-beginner-6': [
    { topicId: 'js-variables', title: 'Variables & Data Types', content: 'var/let/const, primitives vs objects, typeof, and immutability basics.' },
    { topicId: 'js-operators', title: 'Operators', content: 'Arithmetic, comparison, logical, assignment, and short‑circuiting.' },
    { topicId: 'js-control-flow', title: 'Control Flow', content: 'if/else, switch, loops; break/continue; try/catch.' },
    { topicId: 'js-functions-basics', title: 'Functions Basics', content: 'Declarations vs expressions, parameters, returns, scope.' },
    { topicId: 'js-arrays', title: 'Arrays', content: 'Creation, indexing, push/pop/shift/unshift, length, iteration.' },
    { topicId: 'js-array-methods', title: 'Array Methods', content: 'map, filter, reduce, find, some/every, sort with comparator.' },
    { topicId: 'js-objects', title: 'Objects', content: 'Literals, properties, methods, dot vs bracket access, Object.keys.' },
    { topicId: 'js-strings', title: 'Strings', content: 'Common methods: slice, substring, replace, includes, template literals.' },
    { topicId: 'js-dom', title: 'DOM Basics', content: 'Selecting elements, changing content/styles, creating/removing nodes.' },
    { topicId: 'js-events-basics', title: 'Events Basics', content: 'addEventListener, event object, default prevention, delegation.' },
    { topicId: 'js-json', title: 'JSON & Storage', content: 'JSON.parse/stringify, localStorage/sessionStorage usage patterns.' }
  ],
  'frontend-beginner-7': [
    { topicId: 'js-es6', title: 'ES6 Essentials', content: 'let/const, arrow functions, template literals, default/rest parameters.' },
    { topicId: 'js-destructuring', title: 'Destructuring & Spread', content: 'Array/object destructuring, spread/rest, immutability patterns.' },
    { topicId: 'js-classes', title: 'Classes', content: 'Class syntax, constructors, methods, inheritance, super.' },
    { topicId: 'js-modules', title: 'Modules', content: 'import/export, default vs named, bundling basics.' },
    { topicId: 'js-promises', title: 'Promises', content: 'States, then/catch chaining, error propagation.' },
    { topicId: 'js-async-await', title: 'Async/Await', content: 'Writing async code, try/catch, sequential vs parallel.' },
    { topicId: 'js-fetch', title: 'Fetch API', content: 'GET/POST requests, headers, JSON, aborting requests.' },
    { topicId: 'js-error-handling', title: 'Error Handling', content: 'throw, try/catch, custom errors, graceful degradation.' },
    { topicId: 'js-closures', title: 'Closures', content: 'Lexical scope, factory functions, encapsulation patterns.' },
    { topicId: 'js-this', title: 'this & Binding', content: 'call/apply/bind, arrow function this, contexts.' },
    { topicId: 'js-event-loop', title: 'Event Loop', content: 'Call stack, microtasks, macrotasks, timing subtleties.' }
  ]
};

function ensureMinTopics(assignment) {
  const MIN_TOPICS = 15;
  const pack = topicPacks[assignment.assignmentId] || [];
  const topics = Array.isArray(assignment.topics) ? assignment.topics : [];
  if (topics.length >= MIN_TOPICS) return assignment;
  const needed = MIN_TOPICS - topics.length;
  const extras = pack.slice(0, needed);
  return { ...assignment, topics: [...topics, ...extras] };
}

async function seedIfEmpty() {
  try {
    const count = await Assignment.countDocuments();

    const jsonPath = path.join(__dirname, '..', 'data', 'assignmentSeedData.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    // If empty, seed all
    if (count === 0) {
      const preparedAll = data.map(ensureMinTopics);
      const inserted = await Assignment.insertMany(preparedAll);
      console.log(`✅ Auto-seeded ${inserted.length} assignments (collection was empty)`);
      inserted.slice(0, 5).forEach(a => {
        console.log(`  • ${a.title} (ID: ${a.assignmentId}) | Topics: ${a.topics.length}`);
      });
      return;
    }

    // If not empty, upsert any missing assignments by ID
    const existing = await Assignment.find({}, 'assignmentId').lean();
    const existingIds = new Set(existing.map(a => a.assignmentId));
    const missing = data.filter(a => !existingIds.has(a.assignmentId));

    if (missing.length === 0) {
      console.log(`📚 Assignments already present (${count}). No missing IDs to seed.`);
      return;
    }

    const preparedMissing = missing.map(ensureMinTopics);
    const insertedMissing = await Assignment.insertMany(preparedMissing);
    console.log(`✅ Seeded ${insertedMissing.length} missing assignments`);
    insertedMissing.forEach(a => {
      console.log(`  • Added ${a.assignmentId} | ${a.title}`);
    });
  } catch (err) {
    console.error('❌ Auto-seed failed:', err.message);
  }
}

module.exports = { seedIfEmpty };