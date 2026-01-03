/*
Upsert 15 topics for 'frontend-intermediate-5' — State Management Beyond Basics.
Defaults to mongodb://localhost:27017/jasnav_projects to match running backend.
Adds title/description and full topic content with optional syntax/examples.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-5';

// Flexible schema to allow topics with syntax/examples
const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    {
      topicId: String,
      title: String,
      content: String,
      syntax: String,
      examples: [String]
    },
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const topics = [
  {
    topicId: 'global-vs-local-state',
    title: 'Understanding Global vs Local State in Modern Applications',
    content: [
      'Local state refers to data owned by a single component—for example input values, toggle visibility, and UI flags. Global state refers to data shared across multiple components, such as authenticated user, app theme, or a shopping cart. Distinguishing the two improves design clarity and performance.',
      '',
      'Use local state when data only affects one component. Use global state when multiple parts of the app must read or update the same data at the same time. This avoids prop drilling and reduces tight coupling between distant components.',
      '',
      'Importance: choosing the right scope prevents unnecessary renders, reduces cognitive load, and keeps code maintainable. Storing everything globally is wasteful; keeping everything local is unscalable. A balanced approach enables both speed and clarity.',
      '',
      'Major Use & Advantages: dashboards, authenticated layouts, and e‑commerce carts rely on global state, while micro UI logic stays local. Separating them increases maintainability and prevents over‑rendering.'
    ].join('\n'),
    syntax: [
      '// Local state',
      'const [count, setCount] = useState(0);',
      '',
      '// Global concept via context or Redux (covered below)'
    ].join('\n'),
    examples: ['Counter in a single component', 'Auth user shared across layout']
  },
  {
    topicId: 'context-api-deep-dive',
    title: 'Context API Deep Dive — Providers, Consumers & Performance',
    content: [
      'React Context provides a way to pass data through the component tree without prop drilling. A Provider wraps part of the app and exposes a value; Consumers (or useContext) read that value anywhere beneath the Provider.',
      '',
      'Use Context for data like theme, locale, auth session, or feature flags that traverse multiple levels. It simplifies access patterns when props would otherwise be forwarded across many components.',
      '',
      'Importance: Context eliminates brittle chains of props. However, naive usage can trigger re‑renders across all consumers when the value changes. Memoization and splitting providers help manage performance.',
      '',
      'Major Use & Advantages: simple global state for data that changes infrequently. Advantages include less boilerplate, strong type safety with TS, and built‑in React semantics without third‑party libraries.'
    ].join('\n'),
    syntax: [
      'const UserContext = createContext(null);',
      '',
      '<UserContext.Provider value={user}>',
      '  <App />',
      '</UserContext.Provider>',
      '',
      'const user = useContext(UserContext);'
    ].join('\n'),
    examples: ['Theme provider', 'Authenticated user context']
  },
  {
    topicId: 'use-reducer',
    title: 'useReducer Hook for Predictable State Transitions',
    content: [
      'useReducer manages state through pure reducer functions and dispatched actions. It mirrors Redux principles inside a component, enabling structured updates and traceable transitions.',
      '',
      'Use it for complex state logic: multiple related fields, nested updates, or intertwined operations like forms and wizards. It centralizes mutations to one place and makes flows explicit.',
      '',
      'Importance: predictable state updates ease debugging and testing. Reducers encourage immutability and transparent behavior, reducing accidental side effects.',
      '',
      'Major Use & Advantages: forms, dashboards, multi‑step flows. Advantages include scale‑friendly patterns, fewer bugs, and easier collaboration.'
    ].join('\n'),
    syntax: [
      'function reducer(state, action) {',
      '  switch (action.type) {',
      "    case 'increment': return { count: state.count + 1 };",
      '    default: return state;',
      '  }',
      '}',
      'const [state, dispatch] = useReducer(reducer, { count: 0 });'
    ].join('\n'),
    examples: ['Wizard with state machine', 'Form validation reducer']
  },
  {
    topicId: 'custom-hooks',
    title: 'Creating Custom Hooks for Shared Logic',
    content: [
      'Custom hooks encapsulate reusable logic across components. They compose core hooks like useState, useEffect, useReducer, and useContext to implement features once and reuse everywhere.',
      '',
      'Use custom hooks for data fetching, form handling, authentication flows, timers, and caching. They separate business logic from UI, increasing testability and readability.',
      '',
      'Importance: prevents repetition and inconsistent patterns. Custom hooks standardize behavior across screens and teams.',
      '',
      'Major Use & Advantages: pagination, infinite scroll, validation, polling. Advantages include DRY code, clean separation, and straightforward unit testing.'
    ].join('\n'),
    syntax: [
      'function useFetch(url) {',
      '  const [data, setData] = useState(null);',
      '  useEffect(() => {',
      '    let cancelled = false;',
      '    fetch(url).then(r => r.json()).then(d => { if (!cancelled) setData(d); });',
      '    return () => { cancelled = true; };',
      '  }, [url]);',
      '  return data;',
      '}'
    ].join('\n'),
    examples: ['useDebounce', 'useLocalStorage', 'usePagination']
  },
  {
    topicId: 'storage-sync',
    title: 'State Synchronization with localStorage & sessionStorage',
    content: [
      'Synchronizing state to browser storage persists data across reloads. localStorage persists indefinitely; sessionStorage persists per tab/session.',
      '',
      'Use for cart items, theme preference, auth tokens (with caution), recent searches, or form progress. Keep security in mind for sensitive data.',
      '',
      'Importance: improves UX and reliability, reduces repeated API calls, and supports offline or flaky‑network scenarios.',
      '',
      'Major Use & Advantages: persistence, faster perceived performance, resilience to refresh. Consider serialization, versioning, and invalidation strategies.'
    ].join('\n'),
    syntax: [
      'useEffect(() => {',
      '  localStorage.setItem("theme", theme);',
      '}, [theme]);',
      '',
      'const saved = localStorage.getItem("theme");'
    ].join('\n'),
    examples: ['Persisted cart', 'Remember language preference']
  },
  {
    topicId: 'memoization-optimizations',
    title: 'Optimizing Re-renders with memo, useMemo & useCallback',
    content: [
      'React re‑renders when props/state change. memo prevents unnecessary re‑renders for pure components. useMemo caches expensive calculations. useCallback memoizes function references to maintain stable dependencies.',
      '',
      'Use these tools to avoid performance cliffs in lists, charts, or components that receive frequently changing but equivalent props.',
      '',
      'Importance: keeps UI responsive and reduces CPU usage. Beware of premature optimization—measure first with React DevTools Profiler.',
      '',
      'Major Use & Advantages: list virtualization, heavy computations, stable callback identities for dependency arrays.'
    ].join('\n'),
    syntax: [
      'const List = React.memo(({ items }) => { /* pure render */ });',
      'const value = useMemo(() => compute(data), [data]);',
      'const onClick = useCallback(() => doThing(id), [id]);'
    ].join('\n'),
    examples: ['Memoized product grid', 'Cached chart transforms']
  },
  {
    topicId: 'complex-forms',
    title: 'Managing Complex Forms with Controlled & Uncontrolled Inputs',
    content: [
      'Controlled inputs bind value to React state, offering full control and validation. Uncontrolled inputs rely on the DOM for state, accessed via refs for low‑overhead usage.',
      '',
      'Use controlled forms for validation, immediate feedback, and deterministic updates. Use uncontrolled for simple inputs or performance‑sensitive cases.',
      '',
      'Importance: correct choice improves both user experience and maintainability. Hybrid strategies combine both for optimal performance.',
      '',
      'Major Use & Advantages: complex validation, debounced inputs, file uploads, and large forms. Advantages include predictable behavior and better tooling.'
    ].join('\n'),
    syntax: [
      '// Controlled',
      'const [name, setName] = useState("");',
      '<input value={name} onChange={e => setName(e.target.value)} />',
      '',
      '// Uncontrolled',
      'const ref = useRef();',
      '<input ref={ref} defaultValue="guest" />'
    ].join('\n'),
    examples: ['Signup form with validation', 'Feedback textarea with autosave']
  },
  {
    topicId: 'api-caching',
    title: 'API Response Caching & Client-side Persistence',
    content: [
      'Client caching stores responses to avoid repeated fetches. Strategies include in‑memory caches, IndexedDB/localStorage, and time‑based invalidation (TTL).',
      '',
      'Use caching for lists, frequently accessed metadata, and idempotent endpoints. Stale‑while‑revalidate patterns improve UX by serving cached data, then updating in the background.',
      '',
      'Importance: reduces load, improves speed, and mitigates rate limits. Design cache keys carefully and invalidate on mutations.',
      '',
      'Major Use & Advantages: dashboards, product catalogs, and autocomplete results benefit from responsive UIs and fewer network calls.'
    ].join('\n'),
    syntax: [
      'const cache = new Map();',
      'async function getUser(id) {',
      '  if (cache.has(id)) return cache.get(id);',
      '  const data = await fetch(`/api/users/${id}`).then(r => r.json());',
      '  cache.set(id, data);',
      '  return data;',
      '}'
    ].join('\n'),
    examples: ['Stale‑while‑revalidate pattern', 'IndexedDB storage for large payloads']
  },
  {
    topicId: 'redux-intro',
    title: 'Introduction to Redux — Core Principles',
    content: [
      'Redux is a predictable state container based on a single store, immutable updates, and pure reducers. Actions describe changes; reducers compute the next state from the previous state + action.',
      '',
      'Use Redux for complex, cross‑cutting state where many components need consistent access and updates. It shines with strict unidirectional data flow and time‑travel debugging.',
      '',
      'Importance: encourages discipline and transparency. The devtools ecosystem helps catch regressions and visualize changes.',
      '',
      'Major Use & Advantages: large apps with shared state and intricate business logic. Advantages include traceable updates, strong tooling, and ecosystem support.'
    ].join('\n'),
    syntax: [
      'const initial = { count: 0 };',
      'function reducer(state = initial, action) {',
      "  switch(action.type){ case 'inc': return { count: state.count + 1 }; default: return state }",
      '}',
      'const store = createStore(reducer);'
    ].join('\n'),
    examples: ['Global auth/session', 'Cart state in e‑commerce']
  },
  {
    topicId: 'redux-toolkit',
    title: 'Redux Toolkit (RTK) — Slices, Store & Thunks',
    content: [
      'Redux Toolkit reduces boilerplate with configureStore, createSlice, and createAsyncThunk. It encourages immutable logic via Immer and standard patterns for async flows.',
      '',
      'Use RTK to simplify slice creation, unify middleware, and streamline async operations. Thunks handle side effects like API calls while keeping reducers pure.',
      '',
      'Importance: lowers the learning curve and standardizes best practices. Teams move faster with fewer custom utilities.',
      '',
      'Major Use & Advantages: scalable modules, testable reducers, and clean async handling. Advantages include less code, safer updates, and strong TypeScript support.'
    ].join('\n'),
    syntax: [
      'const counterSlice = createSlice({',
      "  name: 'counter',",
      '  initialState: { value: 0 },',
      '  reducers: { increment: (s) => { s.value += 1; } }',
      '});',
      'const store = configureStore({ reducer: { counter: counterSlice.reducer } });'
    ].join('\n'),
    examples: ['createAsyncThunk for fetches', 'Slice‑based modular state']
  },
  {
    topicId: 'rtk-query',
    title: 'Async State Management Using RTK Query',
    content: [
      'RTK Query is a data fetching and caching solution built on Redux Toolkit. It abstracts request lifecycles, handles caching, deduplication, invalidation, and background updates out of the box.',
      '',
      'Use RTK Query when your app is Redux‑based and you want a batteries‑included approach to API state. Define endpoints, auto‑generated hooks, and tag‑based invalidation for consistency.',
      '',
      'Importance: removes custom fetch logic and edge‑case handling. It standardizes patterns and improves performance with intelligent caching.',
      '',
      'Major Use & Advantages: complex dashboards and multi‑page apps. Advantages include reduced boilerplate, scalable cache, and predictable behavior.'
    ].join('\n'),
    syntax: [
      'const api = createApi({',
      "  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),",
      '  endpoints: (b) => ({ getUser: b.query({ query: (id) => `/users/${id}` }) })',
      '});',
      'const { useGetUserQuery } = api;'
    ].join('\n'),
    examples: ['Tag invalidation on mutations', 'Auto‑refetch on focus/network reconnect']
  },
  {
    topicId: 'zustand',
    title: 'Zustand — Lightweight State Management',
    content: [
      'Zustand provides a minimal, hook‑driven store with a tiny API and excellent performance. It avoids boilerplate and keeps state close to components via simple selectors.',
      '',
      'Use Zustand for lightweight global state, where Redux is overkill and Context has performance pitfalls. It shines in modular apps and micro‑frontends.',
      '',
      'Importance: fast adoption and low cognitive overhead. Selective subscriptions reduce re‑renders to the minimum.',
      '',
      'Major Use & Advantages: small to medium apps, performance‑sensitive features, and custom control panels. Advantages include simplicity, speed, and great DX.'
    ].join('\n'),
    syntax: [
      'const useStore = create(set => ({ value: 0, inc: () => set(s => ({ value: s.value + 1 })) }));',
      'const v = useStore(s => s.value);'
    ].join('\n'),
    examples: ['Feature toggles store', 'Audio/video player state']
  },
  {
    topicId: 'jotai-recoil',
    title: 'Jotai & Recoil — Atomic State Patterns',
    content: [
      'Jotai and Recoil embrace atomic units of state. Atoms represent small, independent pieces that components subscribe to. Derived atoms/selectors compute new values based on atom dependencies.',
      '',
      'Use atom‑based libraries to compose state from small building blocks, enabling fine‑grained subscriptions and modular design.',
      '',
      'Importance: improved scalability and testability. Atoms reduce blast radius of updates and aid incremental refactors.',
      '',
      'Major Use & Advantages: design systems, complex dashboards, and feature isolation. Advantages include fine‑grained performance and powerful derived state.'
    ].join('\n'),
    syntax: [
      '// Jotai',
      'const countAtom = atom(0);',
      'const doubleAtom = atom(get => get(countAtom) * 2);',
      '// Recoil',
      'const countState = atom({ key: "count", default: 0 });'
    ].join('\n'),
    examples: ['Atom‑driven filters', 'Selector‑derived metrics']
  },
  {
    topicId: 'state-architecture-best-practices',
    title: 'Best Practices for Scalable State Architecture',
    content: [
      'Define state ownership and boundaries early. Keep domain logic in reducers/selectors or custom hooks, not inside view components. Normalize data and avoid deep nesting.',
      '',
      'Use consistent naming, co‑locate slice logic, and document async flows. Prefer declarative updates and idempotent actions.',
      '',
      'Importance: a disciplined architecture scales teams and features. It prevents incidental complexity and dreaded refactors.',
      '',
      'Major Use & Advantages: large apps with evolving features. Advantages include easier onboarding, fewer regressions, and predictable behavior.'
    ].join('\n'),
    syntax: [
      '// Selector example',
      'const selectVisible = (s) => s.items.filter(i => !i.hidden);'
    ].join('\n'),
    examples: ['Normalized entities', 'Clear slice boundaries']
  },
  {
    topicId: 'debugging-state',
    title: 'Debugging State Using Redux DevTools & Custom Loggers',
    content: [
      'Redux DevTools provide time‑travel debugging, action inspection, and state diffing. Custom loggers capture transitions and anomalies for non‑Redux setups.',
      '',
      'Use DevTools to visualize actions, replay bugs, and confirm reducer logic. Use custom middleware/loggers in vanilla React, Zustand, or atom‑based libraries for observability.',
      '',
      'Importance: faster root‑cause analysis and higher confidence in changes. Instrumentation shortens feedback loops.',
      '',
      'Major Use & Advantages: critical production incidents and complex flows. Advantages include clear traces, reproducible states, and team‑friendly collaboration.'
    ].join('\n'),
    syntax: [
      'const logger = store => next => action => {',
      '  console.log("dispatch", action);',
      '  const result = next(action);',
      '  console.log("next state", store.getState());',
      '  return result;',
      '};'
    ].join('\n'),
    examples: ['DevTools time‑travel', 'Middleware event logs']
  }
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Upsert assignment
    const title = 'Assignment 5 — State Management Beyond Basics';
    const description = '15 in‑depth topics with definitions, use, importance, advantages, and syntax/examples.';

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      {
        $set: {
          title,
          description,
          topics,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const count = (result.topics || []).length;
    console.log(`✅ Upserted assignment '${ASSIGNMENT_ID}'. Topics=${count}`);
    (result.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error upserting Assignment 5 topics:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();