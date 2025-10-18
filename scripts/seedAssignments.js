require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const assignmentData = require('../data/assignmentSeedData.json');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedAssignments() {
  try {
    console.log('🌱 Starting assignment seeding...');

    // Build topical expansion packs to ensure ≥15 topics per assignment
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
      ],
      'devops-beginner-1': [
        { topicId: 'devops-git', title: 'Version Control (Git)', content: 'Commits, branches, merges, pull requests, and code reviews.' },
        { topicId: 'devops-branching', title: 'Branching Strategies', content: 'GitFlow, trunk‑based, feature branches, release/hotfix.' },
        { topicId: 'devops-docker', title: 'Docker Fundamentals', content: 'Images, containers, volumes, networks, multi‑stage builds.' },
        { topicId: 'devops-k8s', title: 'Kubernetes Basics', content: 'Pods, deployments, services, ingress, config maps, secrets.' },
        { topicId: 'devops-iac', title: 'Infrastructure as Code', content: 'Terraform basics, state, modules, provisioning workflows.' },
        { topicId: 'devops-ci', title: 'CI/CD Pipelines', content: 'Build, test, deploy stages, artifacts, runners, caching.' },
        { topicId: 'devops-monitoring', title: 'Monitoring & Observability', content: 'Metrics, logs, traces; Prometheus, Grafana, ELK basics.' },
        { topicId: 'devops-security', title: 'DevSecOps', content: 'Secrets management, SAST/DAST, SBOM, supply‑chain security.' },
        { topicId: 'devops-cloud', title: 'Cloud Fundamentals', content: 'AWS/Azure/GCP services, IAM, regions/zones, cost control.' },
        { topicId: 'devops-deploy', title: 'Deployment Strategies', content: 'Blue/green, canary, rolling, feature flags.' },
        { topicId: 'devops-postmortem', title: 'Incident Response', content: 'Runbooks, on‑call, blameless postmortems, MTTR reduction.' }
      ],
      'ai-tools-1': [
        { topicId: 'ai-compliance', title: 'Compliance & Licensing', content: 'Copyright safety, usage rights, model licensing, and corporate policies.' },
        { topicId: 'ai-style-systems', title: 'Style Reference Systems', content: 'Guides, palettes, typography, and consistent brand visual language.' },
        { topicId: 'ai-upscaling', title: 'Upscaling & Post‑Processing', content: 'Super‑resolution tools, color correction, denoising, enhancements.' },
        { topicId: 'ai-negative-prompt', title: 'Negative Prompting', content: 'Exclude artifacts and control output using negative constraints.' },
        { topicId: 'ai-batch', title: 'Batch Generation Pipelines', content: 'Automate large runs; templates, iteration, review, and QA.' },
        { topicId: 'ai-asset-mgmt', title: 'Asset Management', content: 'Versioning, metadata, storage, and distribution workflows.' },
        { topicId: 'ai-quality', title: 'Quality Assurance', content: 'Checklists, review gates, acceptance criteria for deliverables.' },
        { topicId: 'ai-collab', title: 'Team Collaboration', content: 'Roles, approvals, feedback cycles, documentation of prompts.' },
        { topicId: 'ai-cost', title: 'Cost Optimization', content: 'Model choice, batching, caching, and budget monitoring.' },
        { topicId: 'ai-security', title: 'Security & Governance', content: 'Access controls, audit trails, data privacy and retention.' },
        { topicId: 'ai-localization', title: 'Localization', content: 'Multi‑language assets, region‑specific adaptations, cultural checks.' }
      ],
      'ai-tools-2': [
        { topicId: 'video-scripting', title: 'Scriptwriting', content: 'Structure, hooks, CTA, and pacing for professional videos.' },
        { topicId: 'video-storyboard', title: 'Storyboarding', content: 'Scene planning, shot lists, transitions, and timing.' },
        { topicId: 'video-lighting', title: 'Lighting & Composition', content: 'Three‑point lighting, framing, rule of thirds.' },
        { topicId: 'video-audio', title: 'Audio & Voice', content: 'Voiceover, music beds, noise reduction, mixing levels.' },
        { topicId: 'video-editing', title: 'Editing Pipelines', content: 'Cuts, B‑roll, motion graphics, captions, templates.' },
        { topicId: 'video-avatars', title: 'AI Avatars', content: 'Lip‑sync, gestures, languages, and realism considerations.' },
        { topicId: 'video-subtitles', title: 'Subtitles & Accessibility', content: 'Captions, transcripts, translations, WCAG compliance.' },
        { topicId: 'video-automation', title: 'Batch Rendering & Automation', content: 'Queues, presets, render farms, and QA gates.' },
        { topicId: 'video-platforms', title: 'Distribution Platforms', content: 'YouTube, LinkedIn, LMS, and analytics integration.' },
        { topicId: 'video-metrics', title: 'Performance Metrics', content: 'CTR, retention, conversions, A/B testing.' },
        { topicId: 'video-governance', title: 'Compliance & Rights', content: 'Licensing, consent, branding policies.' }
      ],
      'ai-tools-3': [
        { topicId: 'anim-principles', title: 'Animation Principles', content: 'Timing, easing, arcs, overlap, anticipation for natural motion.' },
        { topicId: 'anim-image2video', title: 'Image‑to‑Video Workflows', content: 'Keyframe mapping, morphing, camera moves.' },
        { topicId: 'anim-stabilization', title: 'Stabilization', content: 'Avoid jitter; optical flow, frame interpolation.' },
        { topicId: 'anim-style', title: 'Style Consistency', content: 'Maintain brand identity across animated sequences.' },
        { topicId: 'anim-rotoscope', title: 'Rotoscoping & Masks', content: 'Foreground/background separation and compositing.' },
        { topicId: 'anim-audio', title: 'Audio Sync', content: 'Align narration and SFX with visual beats.' },
        { topicId: 'anim-export', title: 'Export & Formats', content: 'Codecs, bitrates, containers for distribution.' },
        { topicId: 'anim-qa', title: 'Animation QA', content: 'Artifact checks, motion smoothness, color consistency.' },
        { topicId: 'anim-pipeline', title: 'Pipeline Automation', content: 'Templates, batch jobs, re‑usable effects stacks.' },
        { topicId: 'anim-performance', title: 'Performance & Cost', content: 'Efficient rendering and resource usage.' },
        { topicId: 'anim-delivery', title: 'Delivery Workflow', content: 'Client review, revisions, versioning, final export.' }
      ],
      'ai-tools-4': [
        { topicId: 'json-basics', title: 'JSON Basics', content: 'Structure, types, arrays, objects, and nested data.' },
        { topicId: 'json-schema', title: 'JSON Schema', content: 'Validation, required fields, formats, enums, references.' },
        { topicId: 'json-fewshot', title: 'Few‑Shot Prompting', content: 'Example‑driven outputs for stable structure.' },
        { topicId: 'json-validation', title: 'Validation & QA', content: 'Programmatic checks and error handling patterns.' },
        { topicId: 'json-transform', title: 'Transformations', content: 'Map/normalize/aggregate AI outputs into systems.' },
        { topicId: 'json-apis', title: 'APIs & Webhooks', content: 'Receiving, storing, and forwarding structured data.' },
        { topicId: 'json-security', title: 'Security & PII', content: 'Data minimization, encryption, access control.' },
        { topicId: 'json-localization', title: 'Localization', content: 'Multi‑language structured outputs and rules.' },
        { topicId: 'json-metrics', title: 'Quality Metrics', content: 'Accuracy, completeness, timeliness, deduplication.' },
        { topicId: 'json-governance', title: 'Governance', content: 'Audit trails, retention, compliance policies.' },
        { topicId: 'json-ops', title: 'Ops & Tooling', content: 'Linters, schemas, test fixtures, monitoring.' }
      ],
      'ai-tools-5': [
        { topicId: 'automation-triggers', title: 'Triggers', content: 'Webhook, schedule, email, and app events start workflows.' },
        { topicId: 'automation-actions', title: 'Actions', content: 'APIs, DB writes, notifications, and document generation.' },
        { topicId: 'automation-conditions', title: 'Logic & Branching', content: 'Routers, if/else paths, retries, and fallbacks.' },
        { topicId: 'automation-data', title: 'Data Transformation', content: 'Mapping, expressions, cleaning and enrichment.' },
        { topicId: 'automation-error', title: 'Error Handling', content: 'Try/catch nodes, alerts, compensating actions.' },
        { topicId: 'automation-observe', title: 'Observability', content: 'Logs, metrics, traces for diagnosing workflows.' },
        { topicId: 'automation-security', title: 'Security', content: 'Secrets, scopes, least privilege, audit trails.' },
        { topicId: 'automation-scale', title: 'Scaling', content: 'Concurrency, queues, rate limits, backpressure.' },
        { topicId: 'automation-cost', title: 'Cost Control', content: 'Batching, caching, data minimization.' },
        { topicId: 'automation-integrations', title: 'Integrations', content: 'n8n, Zapier, Make.com nodes and custom APIs.' },
        { topicId: 'automation-governance', title: 'Governance', content: 'Approvals, SLAs, compliance, versioning.' }
      ],
      'ai-tools-6': [
        { topicId: 'claude-api', title: 'Claude API', content: 'Authentication, endpoints, streaming, and tool use patterns.' },
        { topicId: 'claude-workflows', title: 'Workflow Design', content: 'Structured inputs/outputs, retry logic, idempotency.' },
        { topicId: 'claude-context', title: 'Context Management', content: 'System prompts, roles, memory, constraints.' },
        { topicId: 'claude-evals', title: 'Evaluation & Testing', content: 'Test cases, benchmarks, regression suites.' },
        { topicId: 'claude-datasets', title: 'Dataset Prep', content: 'Curation, labeling, PII handling, data quality.' },
        { topicId: 'claude-guardrails', title: 'Guardrails', content: 'Policies, filters, safety controls, and audits.' },
        { topicId: 'claude-plugins', title: 'Integrations', content: 'Embeddings, RAG, document tools, connectors.' },
        { topicId: 'claude-deploy', title: 'Deployment', content: 'Environments, configs, scaling, cost monitoring.' },
        { topicId: 'claude-observability', title: 'Observability', content: 'Logging, metrics, traces; drift detection.' },
        { topicId: 'claude-compliance', title: 'Compliance', content: 'Legal, security reviews, and access controls.' },
        { topicId: 'claude-roadmap', title: 'Enterprise Patterns', content: 'Templates, playbooks, and best practices.' }
      ]
    };

    const ensureMinTopics = (assignment) => {
      const MIN_TOPICS = 15;
      const pack = topicPacks[assignment.assignmentId];
      if (!assignment.topics) assignment.topics = [];
      if (assignment.topics.length >= MIN_TOPICS) return assignment;
      const needed = MIN_TOPICS - assignment.topics.length;
      const extras = pack ? pack.slice(0, needed) : [];
      return { ...assignment, topics: [...assignment.topics, ...extras] };
    };
    
    // Debug: Check first assignment structure
    console.log('\n🔍 First assignment sample:');
    console.log(JSON.stringify(assignmentData[0], null, 2).substring(0, 500));
    
    // Clear existing assignments
    const deleteResult = await Assignment.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing assignments`);
    
    // Insert new assignments with topic expansion
    const prepared = assignmentData.map(ensureMinTopics);
    const insertedAssignments = await Assignment.insertMany(prepared);
    console.log(`✅ Successfully seeded ${insertedAssignments.length} assignments`);
    
    // Display summary
    console.log('\n📊 Assignment Summary:');
    insertedAssignments.forEach(assignment => {
      console.log(`  • ${assignment.title} (ID: ${assignment.assignmentId})`);
      console.log(`    - Topics: ${assignment.topics.length}`);
      console.log(`    - Questions: ${assignment.questions.length}`);
      console.log(`    - Passing: ${assignment.passingPercentage}%`);
    });
    
    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAssignments();
