require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
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
      'frontend-intermediate': [
        { 
          topicId: 'es-modules', 
          title: 'ES Modules', 
          content: 'Modern JavaScript uses ES Modules to structure code with explicit dependencies and live bindings. Prefer named exports for better tree‑shaking and clearer APIs; use default only when a module has a single primary value. Avoid circular imports and keep side effects out of module top‑level where possible.', 
          syntax: "// lib/math.js\nexport const add = (a, b) => a + b;\nexport function sum(list) { return list.reduce(add, 0); }\n\n// app.js\nimport { add, sum } from './lib/math.js';\nconsole.log(sum([1,2,3]));\n\n// dynamic loading\nconst { format } = await import('./lib/format.js');", 
          examples: [
            'Use named exports to enable tree‑shaking and API discoverability',
            'Use dynamic import() for route‑level code splitting',
            'Avoid circular dependencies; refactor shared utilities into separate modules'
          ]
        },
        { 
          topicId: 'async-await', 
          title: 'Async/Await', 
          content: 'Async/await is syntactic sugar over Promises that keeps async code readable. Errors propagate like synchronous code via try/catch. Prefer running independent tasks in parallel with Promise.all, and be mindful of the microtask queue when sequencing operations.', 
          syntax: "async function getUserAndPosts(id){\n  const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);\n  return { user, posts };\n}\n\nasync function save(){\n  try {\n    await saveDraft();\n    await publish(); // sequential because publish depends on saveDraft\n  } catch (e) {\n    logError(e);\n  }\n}", 
          examples: [
            'Parallelize independent requests with Promise.all for performance',
            'Use a single try/catch around logical sequences to centralize error handling',
            'Prefer timeouts and abort controllers to prevent hanging awaits'
          ]
        },
        { 
          topicId: 'js-patterns', 
          title: 'Patterns', 
          content: 'Use proven patterns to structure JS applications: Strategy for swappable behaviors, Observer for pub/sub and UI subscriptions, and Facade to expose a simple API over complex internals. Patterns help testability and decouple modules.', 
          syntax: "class Strategy { run(){} }\nclass ImplA extends Strategy { run(){ /* ... */ } }\nclass ImplB extends Strategy { run(){ /* ... */ } }\nfunction execute(s) { return s.run(); }\n\n// Observer\nclass Observable {\n  #subs = new Set();\n  subscribe(fn){ this.#subs.add(fn); return () => this.#subs.delete(fn); }\n  emit(v){ this.#subs.forEach(fn => fn(v)); }\n}", 
          examples: [
            'Swap payment gateways using Strategy implementations',
            'Use Observer for store change subscriptions or event buses',
            'Wrap complex SDKs with a Facade to keep app code clean'
          ]
        },
        { 
          topicId: 'es-modules-advanced', 
          title: 'ES Modules Advanced', 
          content: 'Go beyond basics with re‑exports, barrel files, and dynamic import hints. Prefer explicit named exports to avoid default/named mixing. Use import.meta and bundler preloading carefully to shape performance.', 
          syntax: "// barrel: lib/index.js\nexport * from './math.js';\nexport * from './format.js';\n\n// consumer\nimport { add, format } from './lib/index.js';\n\n// dynamic import with preloading hints (bundler dependent)\nconst mod = await import(/* webpackPrefetch: true */ './heavy.js');", 
          examples: [
            'Create barrel files for ergonomic imports without creating hidden dependencies',
            'Use explicit re‑exports to control public API surface',
            'Defer heavy modules with dynamic import to improve initial load'
          ]
        },
        { 
          topicId: 'async-await-deep', 
          title: 'Async/Await Deep Dive', 
          content: 'Understand promise states, error propagation, cancellation, and concurrency control. Combine Promise.allSettled for tolerant aggregation and use AbortController for cancellation. Sequence operations only when there is a true dependency.', 
          syntax: "const controller = new AbortController();\nconst signal = controller.signal;\n\nasync function load(){\n  const results = await Promise.allSettled([\n    fetchA({ signal }),\n    fetchB({ signal }),\n    fetchC({ signal })\n  ]);\n  controller.abort();\n  return results;\n}", 
          examples: [
            'Use AbortController to cancel in‑flight requests on unmount',
            'Use allSettled when partial results are acceptable',
            'Guard awaits with timeouts to avoid UI stalls'
          ]
        },
        { 
          topicId: 'js-patterns-advanced', 
          title: 'Advanced JS Patterns', 
          content: 'Apply Factory for controlled object creation, Singleton for shared resources (use sparingly), and Module pattern for encapsulation. Favor dependency injection to improve testability and reduce coupling.', 
          syntax: "function createRepo(api){\n  return { get(id){ return api.get(`/items/${id}`); } };\n}\n\n// Minimal singleton\nlet instance;\nexport function getStore(){ if(!instance) instance = createStore(); return instance; }", 
          examples: [
            'Factories hide construction complexity and decouple callers',
            'Limit singletons to stateless services to avoid hidden global state',
            'Encapsulate helpers inside modules and export a clear public API'
          ]
        },
        { 
          topicId: 'error-handling', 
          title: 'Error Handling Patterns', 
          content: 'Design error boundaries and graceful fallbacks. Map error codes to user‑friendly messages, add structured logs, and centralize reporting. In async flows, propagate errors to a single handler where practical.', 
          syntax: "try {\n  await criticalStep();\n} catch (e) {\n  notifyUser(getMessage(e));\n  logError({ code: e.code, message: e.message });\n}", 
          examples: [
            'Use an error boundary in React to isolate UI failures',
            'Return typed results (Ok/Err) for predictable control flow',
            'Log with context (user, action, payload size) for debuggability'
          ]
        },
        { 
          topicId: 'ts-types', 
          title: 'TypeScript Types', 
          content: 'Use unions for finite states, intersections for composition, and literal types for exact values. Prefer narrowing and exhaustive switches to ensure type safety at runtime boundaries.', 
          syntax: "type Status = 'idle' | 'loading' | 'error' | 'success';\n\nfunction render(status: Status){\n  switch(status){\n    case 'idle': return '…';\n    case 'loading': return 'Loading';\n    case 'error': return 'Error';\n    case 'success': return 'Done';\n  }\n}", 
          examples: [
            'Model API states with union types for clarity',
            'Compose small types with intersections instead of giant interfaces',
            'Use literal types to prevent accidental string typos'
          ]
        },
        { 
          topicId: 'ts-interfaces', 
          title: 'TypeScript Interfaces', 
          content: 'Interfaces describe contracts. Use optional and readonly members where appropriate, extend interfaces for specialization, and prefer interface for object shapes consumed by multiple implementations.', 
          syntax: "interface Repo { readonly url: string; get(id: string): Promise<any>; }\ninterface CachedRepo extends Repo { cacheTTL?: number; }\n\nconst repo: CachedRepo = { url: 'https://api', get: async id => ({ id }) };", 
          examples: [
            'Express capabilities with interface extension rather than flags',
            'Readonly signals intent and prevents accidental mutation',
            'Prefer interface for public contracts and type for unions/aliases'
          ]
        },
        { 
          topicId: 'ts-generics', 
          title: 'TypeScript Generics', 
          content: 'Generics preserve type information across functions and classes. Add constraints with extends, infer types in conditional helpers, and use utility types to transform shapes.', 
          syntax: "function wrap<T>(value: T){ return { value }; }\nfunction getProp<T extends object, K extends keyof T>(obj: T, key: K): T[K]{\n  return obj[key];\n}", 
          examples: [
            'Preserve payload types when wrapping values or promises',
            'Use keyof and indexed access to type‑safe property reads',
            'Constrain generic parameters to avoid overly broad types'
          ]
        },
        { 
          topicId: 'react-hooks', 
          title: 'React Hooks', 
          content: 'Use useState for local state, useEffect for side effects, useMemo and useCallback for memoization, and useRef for stable references. Keep dependencies accurate and avoid over‑memoization by measuring first.', 
          syntax: "const [query, setQuery] = useState('');\nconst results = useMemo(() => compute(items, query), [items, query]);\nuseEffect(() => {\n  const id = setInterval(refresh, 60000);\n  return () => clearInterval(id);\n}, []);", 
          examples: [
            'Memoize expensive list computations with useMemo',
            'Use useRef for mutable values that should not trigger re‑renders',
            'Cleanup effects on unmount to prevent leaks'
          ]
        },
        { 
          topicId: 'react-state', 
          title: 'React State & Props', 
          content: 'Favor lifting state to the nearest common ancestor. Keep state minimal and derive values when possible. Compose components via props rather than inheritance, and ensure updates are immutable.', 
          syntax: "function List({ items, filter }){\n  const visible = useMemo(() => items.filter(filter), [items, filter]);\n  return visible.map(renderItem);\n}", 
          examples: [
            'Derive filtered lists instead of storing both list and filtered list',
            'Lift shared state to parent components to avoid prop drilling',
            'Use functional setState when the next value depends on the previous'
          ]
        },
        { 
          topicId: 'react-context', 
          title: 'Context & Providers', 
          content: 'Context shares values without prop drilling. Split contexts to reduce re‑renders, memoize provider values, and keep context focused on stable data (e.g., theme, auth, i18n).', 
          syntax: "const ThemeContext = createContext('light');\nfunction ThemeProvider({ children }){\n  const [theme, setTheme] = useState('light');\n  const value = useMemo(() => ({ theme, setTheme }), [theme]);\n  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;\n}", 
          examples: [
            'Use multiple small contexts to isolate updates',
            'Memoize provider values to prevent child re‑renders',
            'Keep transient UI state out of global context'
          ]
        },
        { 
          topicId: 'react-query', 
          title: 'Data Fetching & Caching', 
          content: 'Libraries like React Query/SWR manage caching, retries, and background updates. Use keys that reflect parameters, handle error and loading states, and prefer optimistic updates for snappy UX.', 
          syntax: "const { data, error, isLoading } = useQuery(['posts', page], () => fetchPosts(page), { staleTime: 30000 });\n\nuseMutation(updatePost, {\n  onMutate(vars){ /* optimistic update */ },\n  onError(err){ /* rollback */ },\n  onSettled(){ queryClient.invalidateQueries(['posts']); }\n});", 
          examples: [
            'Choose meaningful query keys for cache correctness',
            'Prefetch data when hovering or before navigation',
            'Use optimistic updates to keep UI responsive during mutations'
          ]
        },
        { topicId: 'css-grid-advanced', title: 'CSS Grid Advanced', content: 'Areas, auto‑placement, minmax(), implicit vs explicit grids.', syntax: 'grid-template-columns: repeat(auto-fit, minmax(240px,1fr));', examples: ['Responsive dashboards'] },
        { topicId: 'css-animations-advanced', title: 'CSS Animations', content: 'Keyframes, transitions, performance, transform/opacity.', syntax: '@keyframes fade {from{opacity:0} to{opacity:1}}', examples: ['Prefer transform/opacity'] },
        { topicId: 'tooling-vite', title: 'Vite & Tooling', content: 'HMR, build config, env vars, aliases.', syntax: "resolve:{ alias:{ '@':'/src' } }", examples: ['Define VITE_* vars'] },
        { topicId: 'tooling-babel', title: 'Babel & Transpilation', content: 'Presets, plugins, polyfills, target environments.', syntax: "{ presets:['@babel/preset-env','@babel/preset-typescript'] }", examples: ['Minimal config'] },
        { topicId: 'linting-eslint', title: 'ESLint & Formatting', content: 'Lint rules, plugins, Prettier, code style consistency.', syntax: "extends:['plugin:@typescript-eslint/recommended']", examples: ['Run lint in CI'] },
        { topicId: 'testing-vitest-jest', title: 'Testing Basics', content: 'Unit/integration tests, Testing Library, best practices.', syntax: "it('adds',()=>{ expect(add(2,3)).toBe(5) })", examples: ['User-centric assertions'] }
      ],
      'frontend-intermediate-1': [
        { topicId: 'devtools-intro', title: 'Introduction to Chrome DevTools & Its Interface', content: `Chrome DevTools is a built-in set of web developer tools inside Google Chrome. It provides an environment to inspect, analyze, and debug web apps directly in the browser, exposing what the browser knows — HTML structure, CSS rules, JavaScript execution, network activity, and performance metrics. The interface is divided into panels such as Elements, Console, Network, Sources, Application, and Performance, each supporting a different debugging and optimization task.

DevTools helps frontend developers understand how the browser interprets their code. You can visually inspect changes, test different UI conditions, simulate screen sizes, and catch errors in real time. No external tools are needed; DevTools streamlines identifying problems and testing fixes instantly in the browser.

Its importance lies in reducing development time and improving code accuracy. By giving full visibility into the internals of a webpage, DevTools empowers developers to fix issues efficiently before shipping. The major use is during debugging sessions where real-time edits help pinpoint issues without modifying source files. Overall, DevTools offers faster debugging, immediate visual feedback, and powerful performance diagnostics — essential for frontend engineers.` },
        { topicId: 'devtools-dom', title: 'Inspecting and Manipulating the DOM in Real Time', content: `The DOM (Document Object Model) is a structured representation of a webpage that browsers render. Chrome DevTools lets you inspect this DOM visually and interact with individual elements. When an element is selected, its HTML and CSS appear instantly, revealing how the page is composed. Real-time inspection enables verification of styles, the box model, computed CSS, and element hierarchies.

Primary use cases include correcting UI issues such as alignment problems, incorrect styling, and container sizing errors. By editing the DOM or CSS directly in DevTools, developers can test different styling approaches without changing source files, speeding up the design-debugging workflow and experimentation. This is also effective for diagnosing issues caused by dynamic DOM updates from frameworks like React.

Its importance is the ability to identify layout issues that are difficult to detect in code alone. Major use is during UI debugging to pinpoint why elements render incorrectly. Advantages include real-time changes without permanence, visualization of CSS inheritance, and isolating problematic elements — making DOM inspection one of DevTools’ most powerful features.` },
        { topicId: 'devtools-js-debug', title: 'Debugging JavaScript Using Breakpoints & Watch Expressions', content: `Breakpoints are intentional stopping points placed in JavaScript to pause execution at critical moments. When the browser reaches a breakpoint, DevTools halts the script and allows inspection of values, variables, and control flow. Watch expressions track custom variables or expressions continuously, updating them as the program runs. Together, breakpoints and watch expressions provide precise control over debugging.

These tools identify logic errors, incorrect variable values, or unexpected function behavior. Instead of combing through console logs, developers step through code line by line using breakpoints. Watch expressions make it easy to observe variable changes over time and find the exact point where data becomes incorrect, dramatically increasing debugging accuracy.

Their importance is in revealing bugs that are otherwise hard to detect — particularly in event-driven functions, asynchronous operations, and complex state management. Advantages include eliminating guesswork, improving reliability, and understanding the full execution lifecycle. Breakpoints make debugging controlled, professional, and efficient.` },
        { topicId: 'devtools-network', title: 'Network Panel: Understanding Requests, Status Codes & Payloads', content: `The Network panel shows all network activity for a page — API calls, image loads, CSS/JS resources, and more. Each request includes its status code, headers, timing, and payload (data sent/received), making it a complete monitoring tool for how a page communicates with servers.

Primary use is debugging API requests: verify whether a request succeeded, failed, or was blocked; inspect payloads for correctness; and analyze load times, render-blocking resources, and caching behavior. This panel is central to optimizing network performance.

Its importance is in identifying backend or API-related issues, especially during integration testing with real endpoints. Advantages include full visibility into request lifecycles, easy reproduction of errors, and understanding latency issues. The Network panel is indispensable for frontend developers working with APIs.` },
        { topicId: 'devtools-performance', title: 'Performance Panel: Identifying Rendering Bottlenecks', content: `The Performance panel helps analyze how efficiently a webpage runs in terms of rendering, scripting, and painting. It shows a detailed breakdown of CPU usage, layout calculations, animations, and rendering phases. Developers can record a performance session to see exactly what processes slowed down the website and caused delays or jank.

The main use of this panel is to diagnose sluggish interfaces, laggy animations, and slow-loading components. By visualizing the browser's workload, developers can see which parts of their code trigger expensive operations. This guides them to optimize components, minimize re-renders, and improve overall page responsiveness.

Its importance lies in providing insights that cannot be detected by simple inspection. The major use is during performance optimization when developers aim to improve user experience, especially on low-end devices. Advantages include discovering hidden bottlenecks, improving animation smoothness, and achieving higher performance standards. This panel is essential for ensuring that a frontend app runs smoothly.` },
        { topicId: 'devtools-lighthouse', title: 'Lighthouse Audits: Performance, SEO, Accessibility Checks', content: `Lighthouse is an automated tool inside DevTools that generates detailed reports on website performance, accessibility, SEO, and best practices. It evaluates various metrics like page speed, render-blocking scripts, color contrast, and semantic HTML usage. By running a Lighthouse audit, developers get actionable suggestions to improve their site.

The main use of Lighthouse is improving website quality across multiple categories. It identifies problems that affect search engine ranking, accessibility compliance, and overall user experience. Lighthouse also helps compare performance scores before and after changes, ensuring measurable improvement.

Its importance lies in providing standardized metrics that follow Google’s recommendations. The major use is during optimization phases when developers want to improve loading speed and accessibility. Advantages include automatic suggestions, clear scoring, and the ability to test mobile and desktop performance. Lighthouse helps developers build high-quality, user-friendly websites.` },
        { topicId: 'devtools-application', title: 'Application Panel: localStorage, sessionStorage & Cookies Debugging', content: `The Application panel provides access to a website’s storage mechanisms including localStorage, sessionStorage, cookies, IndexedDB, and cache. It allows developers to view, modify, and delete stored data instantly. This is crucial for debugging apps that rely on persistent storage, authentication tokens, or caching.

Its main use is verifying if data stored by the application matches expectations. Developers can check whether authentication tokens are saved correctly, whether cache items appear as intended, and whether storage updates occur after user interactions. It also helps detect storage-related bugs that cause login issues or incorrect UI states.

The importance of the Application panel lies in its ability to reveal hidden data that affects app behavior. The major use is authentication debugging, where developers verify token storage and expiry. Advantages include full transparency into client-side storage and faster debugging of persistent data issues. This panel is especially important for React apps that rely on localStorage for state persistence.` },
        { topicId: 'react-devtools', title: 'Monitoring React Components Using React DevTools', content: `React DevTools is a browser extension that integrates directly into DevTools and allows developers to inspect React components. It shows component structure, props, state, and hooks in real time. This makes it easier to understand how React renders and updates the UI, especially in complex applications.

The main use is debugging component logic. Developers can check whether props are passed correctly, whether state updates as expected, and whether unnecessary re-renders occur. It also reveals the component hierarchy, making it easier to track where data flows from and how UI changes propagate.

Its importance lies in reducing debugging time for React apps. The major use is during debugging of component nesting issues, state management bugs, and props mismatch. Advantages include visualizing complex component trees, tracking performance, and checking hook values live. React DevTools is essential for all React developers.` },
        { topicId: 'source-maps', title: 'Source Maps: How They Work & Why They Matter', content: `Source maps are files that map compressed or minified production code back to the original source code. Since modern build tools compress code to improve performance, debugging the minified output becomes difficult. Source maps bridge this gap by allowing DevTools to display the original code during debugging sessions.

The main use of source maps is debugging production errors. When users encounter issues in the live application, developers can use source maps to trace the bug back to the original file. This makes debugging easier and much more accurate, even after bundling and minification.

The importance of source maps lies in their ability to preserve developer-friendly debugging while maintaining performance. The major use is during error tracking in production environments. Advantages include better error tracing, safer shipping of minified code, and simplified debugging workflows. Source maps ensure that production builds remain both efficient and debuggable.` },
        { topicId: 'cors-network', title: 'Handling CORS Errors & Network-Level Debugging', content: 'Origins, preflight, headers (CORS), server fixes, proxies, and devtools diagnosis.' },
        { topicId: 'memory-leaks', title: 'Identifying Memory Leaks & Using the Memory Profiler', content: 'Heap snapshots, allocation sampling, detached DOM nodes, and event listener leaks.' },
        { topicId: 'mobile-responsive', title: 'Mobile View Debugging & Responsive Design Tooling', content: 'Device emulation, touch simulation, media queries, layout bugs across breakpoints.' },
        { topicId: 'network-throttle', title: 'Simulating Network Speed, Offline Mode & Throttling', content: 'Network conditions, CPU throttling, offline testing, and resiliency checks.' },
        { topicId: 'stack-traces', title: 'Error Stack Tracing & Debugging Minified Production Code', content: 'Trace errors, de-obfuscate with source maps, capture logs, and reproduce issues.' },
        { topicId: 'debug-best-practices', title: 'Best Practices for Debugging & Writing Debug-Friendly Code', content: 'Guardrails, structured logging, feature flags, assertions, and deterministic repros.' }
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
      const pack = topicPacks[assignment.assignmentId] || topicPacks[assignment.courseId];
      const topics = Array.isArray(assignment.topics) ? assignment.topics : [];

      if (pack && pack.length) {
        const byId = new Map(pack.filter(p => p.topicId).map(p => [p.topicId, p]));
        const byTitle = new Map(pack.filter(p => p.title).map(p => [String(p.title).toLowerCase(), p]));

        // Merge enriched fields into existing topics where IDs or titles match
        const merged = topics.map(t => {
          const match = (t.topicId && byId.get(t.topicId)) || byTitle.get(String(t.title || '').toLowerCase());
          if (!match) return t;
          const currentLen = (t.content || '').length;
          const matchLen = (match.content || '').length;
          return {
            ...t,
            title: t.title || match.title,
            content: matchLen > currentLen ? match.content : (t.content || match.content),
            syntax: t.syntax || match.syntax,
            examples: t.examples || match.examples
          };
        });

        // Append extras from pack (without duplicates) until we reach MIN_TOPICS
        const haveKeys = new Set(merged.map(t => t.topicId || String(t.title).toLowerCase()));
        const extras = [];
        for (const p of pack) {
          const key = p.topicId || String(p.title).toLowerCase();
          if (!haveKeys.has(key) && extras.length < Math.max(0, MIN_TOPICS - merged.length)) {
            extras.push(p);
            haveKeys.add(key);
          }
        }

        const finalTopics = merged.concat(extras);
        return { ...assignment, topics: finalTopics };
      }

      // If no pack, keep topics as-is; only enforce minimum when possible
      if (topics.length >= MIN_TOPICS) return { ...assignment, topics };
      return { ...assignment, topics };
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
