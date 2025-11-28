/*
Patch topics 9–15 for assignment 'frontend-intermediate-4' (UI/UX Fundamentals).
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/jasnav_projects.
Merges by id/title, preserves existing order, and updates content if topics exist.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-4';

// Flexible schema
const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    {
      id: String,
      topicId: String,
      title: String,
      content: String,
    },
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const newTopics = [
  {
    id: 'typography-fundamentals',
    title: 'Typography Fundamentals for Digital Interfaces',
    content: [
      'Typography defines how text appears — font families, sizes, spacing, line height, and weight. In UI/UX, typography influences readability, professionalism, and user comfort.',
      '',
      'Frontend developers use typography to create scannable layouts, accessible contrast, and consistent reading patterns. Modern interfaces use systems like modular scales and fluid typography to support responsiveness.',
      '',
      'Typography is important because poorly formatted text drives users away immediately. Small fonts, tight spacing, or too many fonts make interfaces feel chaotic and unprofessional.',
      '',
      'Major uses include blogs, dashboards, mobile apps, storefronts, onboarding screens, and forms. Advantages include improved readability, better accessibility, aesthetic consistency, and higher user trust.'
    ].join('\n'),
  },
  {
    id: 'mobile-first-responsive-ux',
    title: 'Designing for Mobile-first & Responsive UX',
    content: [
      'Mobile-first design means starting with the smallest screen and scaling upward. This approach ensures that essential features and core functionality are preserved, even on limited space.',
      '',
      'Frontend developers use breakpoints, CSS Grid, Flexbox, media queries, and fluid units like rem, vw, and vh to make layouts adaptable. This avoids distortion, cropping, and misalignment.',
      '',
      'Mobile-first is important because more than 60% of global users browse on mobile. A poor mobile experience destroys retention and search rankings.',
      '',
      'Major uses include e-commerce apps, social media interfaces, dashboards, and landing pages. Advantages include faster load times, cleaner UI, stronger SEO, and better usability for all device types.'
    ].join('\n'),
  },
  {
    id: 'micro-interactions-feedback',
    title: 'Micro-interactions & UX Feedback Patterns',
    content: [
      'Micro-interactions are small animations or responses that acknowledge user actions — button hover effects, loading indicators, success messages, and input validation.',
      '',
      'Frontend developers use them to guide users, reduce uncertainty, and create a more interactive experience. They turn a dull interface into a lively one.',
      '',
      'They are important because users need clear feedback. Without micro-interactions, users feel unsure whether the app is responding, loading, or failing.',
      '',
      'Major uses include form validation, progress indicators, notifications, and interactive components. Advantages include improved user satisfaction, clarity, and emotional engagement.'
    ].join('\n'),
  },
  {
    id: 'wireframes-prototypes',
    title: 'Using Wireframes and Prototypes Effectively',
    content: [
      'Wireframes are simple sketches of your layout, while prototypes simulate interaction. Together, they act as the planning stage for UI/UX.',
      '',
      'Frontend developers use wireframes to avoid building blindly. Prototypes allow testing user flows before writing code. This saves development effort and reduces misunderstandings.',
      '',
      'They are important because teams often rush into coding without validating the flow. Wireframes and prototypes make the vision clear and testable.',
      '',
      'Major uses include apps, websites, dashboard layouts, and onboarding flows. Advantages include reduced rework, faster approval cycles, and better collaboration with designers.'
    ].join('\n'),
  },
  {
    id: 'ux-writing-microcopy',
    title: 'UX Writing and Microcopy',
    content: [
      'UX writing is the art of creating concise, helpful, user-centered text — button labels, form instructions, empty states, onboarding messages, and tooltips.',
      '',
      'Frontend developers use microcopy to guide users, prevent errors, and humanize the interface. A clear label can reduce confusion more effectively than a fancy design.',
      '',
      'It is important because users rely on text for clarity. Poor writing leads to abandonment, mistakes, and frustration.',
      '',
      'Major uses include forms, dashboards, CTAs, alerts, and error messages. Advantages include improved usability, reduced support tickets, and better conversions.'
    ].join('\n'),
  },
  {
    id: 'reducing-cognitive-load',
    title: 'Reducing Cognitive Load in UI',
    content: [
      'Cognitive load refers to the mental effort required to understand and use an interface. Good UI/UX reduces unnecessary complexity and focuses on clarity.',
      '',
      'Developers use progressive disclosure, simple layouts, familiar patterns, and minimal distractions to lower cognitive load. This keeps the user\'s mind relaxed and focused.',
      '',
      'It is important because overloaded interfaces overwhelm users and cause drop-offs. Users prefer fast, simple, predictable interactions.',
      '',
      'Major uses include dashboards, onboarding screens, menus, and navigation systems. Advantages include faster comprehension, fewer errors, and improved overall experience.'
    ].join('\n'),
  },
  {
    id: 'ux-research-basics',
    title: 'UX Research Basics: Surveys, User Testing, Heatmaps',
    content: [
      'UX research collects data about user behavior, expectations, frustrations, and usage patterns. Methods include surveys, interviews, usability testing, heatmaps, and session recordings.',
      '',
      'Frontend developers use research to identify which UI elements users struggle with, which sections they ignore, and where drop-offs occur. This allows data-driven improvements.',
      '',
      'Research is important because UI/UX decisions must be based on actual user behavior, not assumptions. It leads to significantly better final products.',
      '',
      'Major use cases include improving conversion rates, reducing bounce rates, enhancing onboarding, and refining navigation. Advantages include more accurate decision-making, higher user satisfaction, and reduced redesign costs.'
    ].join('\n'),
  },
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byKey = new Map(existing.map(t => [t.id || t.topicId || t.title, { ...t }]));

    // Upsert new topics 9–15
    newTopics.forEach(nt => {
      const key = nt.id;
      if (byKey.has(key)) {
        const cur = byKey.get(key);
        cur.title = nt.title;
        cur.content = nt.content;
        byKey.set(key, cur);
      } else {
        byKey.set(key, { id: nt.id, title: nt.title, content: nt.content });
      }
    });

    // Preserve order: keep existing in current order, then ensure 9–15 appear in defined order
    const ordered = [];
    existing.forEach(t => {
      const k = t.id || t.topicId || t.title;
      const v = byKey.get(k);
      if (v && !ordered.find(x => (x.id || x.topicId || x.title) === k)) ordered.push(v);
    });
    newTopics.forEach(nt => {
      const v = byKey.get(nt.id);
      if (v && !ordered.find(x => (x.id || x.topicId || x.title) === nt.id)) ordered.push(v);
    });

    const res = await Assignment.updateOne({ assignmentId: ASSIGNMENT_ID }, { $set: { topics: ordered, updatedAt: new Date() } });
    console.log('Update result:', res);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const count = (after.topics || []).length;
    console.log(`✅ Topics updated. Count=${count}`);
    (after.topics || []).forEach((t, i) => {
      const idLabel = t.id || t.topicId || 'n/a';
      const len = (t.content || '').length;
      console.log(`  [${i+1}] ${t.title} | id=${idLabel} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 4 topics 9–15:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();