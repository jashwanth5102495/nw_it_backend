const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

// Map requested courses to valid schema categories and levels
const courses = [
  // Existing ones to ensure presence
  {
    courseId: 'FRONTEND-ADVANCED',
    title: 'Frontend Development - Advanced',
    description: 'Master advanced frontend architecture, performance and tooling.',
    category: 'Frontend Development',
    level: 'Advanced',
    price: 2500,
    duration: '12 weeks',
    modules: [
      { title: 'Advanced React Patterns', duration: '3 weeks', topics: ['Context', 'Hooks', 'HOC', 'Render Props'] },
      { title: 'State Management', duration: '3 weeks', topics: ['Redux Toolkit', 'Zustand', 'React Query'] },
      { title: 'Performance', duration: '3 weeks', topics: ['Code Splitting', 'Memoization', 'Bundle Analysis'] },
      { title: 'Tooling', duration: '3 weeks', topics: ['Webpack', 'TypeScript', 'Testing', 'CI/CD'] }
    ],
    prerequisites: ['Frontend intermediate knowledge'],
    learningOutcomes: ['Architect scalable UIs', 'Optimize performance', 'Lead frontend projects'],
    instructor: { name: 'Michael Chen', bio: 'Senior Frontend Architect.', experience: '10+ years' }
  },
  {
    courseId: 'DEVOPS-BEGINNER',
    title: 'DevOps - Beginner',
    description: 'Intro to DevOps, Git, automation, deployment basics.',
    category: 'DevOps',
    level: 'Beginner',
    price: 1000,
    duration: '8 weeks',
    modules: [
      { title: 'DevOps Fundamentals', duration: '2 weeks', topics: ['Culture', 'Git', 'Linux', 'CLI'] },
      { title: 'Automation Basics', duration: '2 weeks', topics: ['Shell', 'CI/CD', 'Testing'] },
      { title: 'Deployment Basics', duration: '2 weeks', topics: ['Servers', 'Docker basics', 'Config'] },
      { title: 'Monitoring', duration: '2 weeks', topics: ['Metrics', 'Logs'] }
    ],
    prerequisites: ['Basic programming'],
    learningOutcomes: ['Understand DevOps', 'Basic CI/CD', 'Deploy apps'],
    instructor: { name: 'David Kumar', bio: 'DevOps Engineer.', experience: '7+ years' }
  },
  {
    courseId: 'DEVOPS-ADVANCED',
    title: 'DevOps - Advanced',
    description: 'Kubernetes, IaC, advanced CI/CD, enterprise DevOps.',
    category: 'DevOps',
    level: 'Advanced',
    price: 1400,
    duration: '14 weeks',
    modules: [
      { title: 'Kubernetes', duration: '4 weeks', topics: ['Architecture', 'Pods', 'Services', 'Scaling'] },
      { title: 'Infrastructure as Code', duration: '3 weeks', topics: ['Terraform', 'Ansible', 'CloudFormation'] },
      { title: 'Advanced CI/CD', duration: '4 weeks', topics: ['Jenkins', 'GitLab CI', 'Blue-Green', 'Canary'] },
      { title: 'Enterprise DevOps', duration: '3 weeks', topics: ['Security', 'Compliance', 'Multi-Cloud'] }
    ],
    prerequisites: ['DevOps fundamentals', 'Docker'],
    learningOutcomes: ['Design enterprise DevOps', 'Automate infra', 'Lead transformations'],
    instructor: { name: 'Alex Thompson', bio: 'Principal DevOps Engineer.', experience: '12+ years' }
  },

  // Networking (map to DevOps category to satisfy schema enum)
  {
    courseId: 'networking-beginner',
    title: 'Networking - Beginner',
    description: 'Basics of computer networks, OSI model, IP addressing, routing.',
    category: 'DevOps',
    level: 'Beginner',
    price: 1500,
    duration: '8 weeks',
    modules: [
      { title: 'Networking Fundamentals', duration: '3 weeks', topics: ['OSI Model', 'TCP/IP', 'LAN/WAN', 'Devices'] },
      { title: 'IP & Routing Basics', duration: '3 weeks', topics: ['IPv4/IPv6', 'Subnets', 'Static Routing'] },
      { title: 'Practical Labs', duration: '2 weeks', topics: ['Packet Tracer', 'Ping/Traceroute', 'Basic Troubleshooting'] }
    ],
    prerequisites: ['Basic computer skills'],
    learningOutcomes: ['Understand core networking', 'Configure basic networks', 'Troubleshoot connectivity'],
    instructor: { name: 'Anita Rao', bio: 'Network Engineer.', experience: '6+ years' }
  },
  {
    courseId: 'networking-intermediate',
    title: 'Networking - Intermediate',
    description: 'Routing protocols, VLANs, NAT, ACLs, wireless and WAN concepts.',
    category: 'DevOps',
    level: 'Intermediate',
    price: 2500,
    duration: '10 weeks',
    modules: [
      { title: 'Routing Protocols', duration: '3 weeks', topics: ['RIP', 'OSPF', 'EIGRP', 'Routing Metrics'] },
      { title: 'Switching & VLANs', duration: '3 weeks', topics: ['VLANs', 'Trunks', 'STP'] },
      { title: 'Security & NAT', duration: '2 weeks', topics: ['ACLs', 'NAT/PAT'] },
      { title: 'Wireless & WAN', duration: '2 weeks', topics: ['Wi-Fi', 'WAN Links'] }
    ],
    prerequisites: ['Networking beginner or equivalent'],
    learningOutcomes: ['Implement routing', 'Design VLANs', 'Secure network segments'],
    instructor: { name: 'Ravi Gupta', bio: 'Senior Network Specialist.', experience: '9+ years' }
  },
  {
    courseId: 'networking-advanced',
    title: 'Networking - Advanced (CCNA Certification Track)',
    description: 'Advanced routing, switching, security, and CCNA exam preparation.',
    category: 'DevOps',
    level: 'Advanced',
    price: 3500,
    duration: '12 weeks',
    modules: [
      { title: 'Advanced Routing & Switching', duration: '4 weeks', topics: ['BGP basics', 'OSPF areas', 'Advanced STP'] },
      { title: 'Network Security', duration: '4 weeks', topics: ['AAA', 'VPN Basics', 'IPS/IDS concepts'] },
      { title: 'CCNA Prep', duration: '4 weeks', topics: ['Exam Domains', 'Labs', 'Mock Tests'] }
    ],
    prerequisites: ['Networking intermediate knowledge'],
    learningOutcomes: ['Design advanced networks', 'Harden network security', 'Prepare for CCNA'],
    instructor: { name: 'Sonal Mehta', bio: 'CCNA/CCNP Certified Instructor.', experience: '10+ years' }
  },

  // Generative AI LLMs (map to Data Science category)
  {
    courseId: 'genai-llm-beginner',
    title: "Generative AI (Understanding and Building LLM's) - Beginner Level",
    description: 'Foundations of generative AI and LLMs; prompt engineering basics.',
    category: 'Data Science',
    level: 'Beginner',
    price: 1800,
    duration: '8 weeks',
    modules: [
      { title: 'GenAI Fundamentals', duration: '3 weeks', topics: ['Generative Models', 'Sampling', 'Ethics'] },
      { title: 'LLM Basics', duration: '3 weeks', topics: ['Transformers', 'Tokenization', 'Inference'] },
      { title: 'Prompting', duration: '2 weeks', topics: ['Prompt Engineering Basics', 'Use Cases'] }
    ],
    prerequisites: ['Basic Python recommended'],
    learningOutcomes: ['Explain GenAI concepts', 'Use LLMs effectively', 'Design simple prompts'],
    instructor: { name: 'Dr. Priya Sharma', bio: 'AI researcher & consultant.', experience: '8+ years' }
  },
  {
    courseId: 'genai-llm-intermediate',
    title: "Generative AI (Understanding and Building LLM's) - Intermediate Level",
    description: 'Fine-tuning, embeddings, RAG pipelines, and practical LLM apps.',
    category: 'Data Science',
    level: 'Intermediate',
    price: 2400,
    duration: '10 weeks',
    modules: [
      { title: 'Fine-Tuning', duration: '3 weeks', topics: ['Datasets', 'Adapters', 'Eval'] },
      { title: 'Embeddings & Vector DBs', duration: '3 weeks', topics: ['Embedding APIs', 'FAISS', 'Similarity'] },
      { title: 'RAG Systems', duration: '2 weeks', topics: ['Indexing', 'Chunking', 'Retrieval'] },
      { title: 'LLM Apps', duration: '2 weeks', topics: ['APIs', 'Agents', 'Deployment'] }
    ],
    prerequisites: ['GenAI beginner or equivalent'],
    learningOutcomes: ['Fine-tune small LLMs', 'Build RAG apps', 'Ship LLM features'],
    instructor: { name: 'Rohan Verma', bio: 'Applied ML Engineer.', experience: '6+ years' }
  },
  {
    courseId: 'genai-llm-advanced',
    title: "Generative AI (Understanding and Building LLM's) - Advanced Level",
    description: 'Scaling LLMs, evaluation, safety, and production ops.',
    category: 'Data Science',
    level: 'Advanced',
    price: 3200,
    duration: '12 weeks',
    modules: [
      { title: 'Scaling & Optimization', duration: '4 weeks', topics: ['Quantization', 'Distillation', 'Serving'] },
      { title: 'Evaluation & Safety', duration: '4 weeks', topics: ['Benchmarks', 'Guardrails', 'Red Teaming'] },
      { title: 'Production Ops', duration: '4 weeks', topics: ['Monitoring', 'Drift', 'Cost Control'] }
    ],
    prerequisites: ['GenAI intermediate knowledge'],
    learningOutcomes: ['Optimize LLM systems', 'Ensure safety/eval', 'Operate in production'],
    instructor: { name: 'Ananya Iyer', bio: 'Principal ML Architect.', experience: '9+ years' }
  },

  // Cyber Security (map to DevOps category)
  {
    courseId: 'cybersecurity-beginner',
    title: 'Cyber Security - Beginner',
    description: 'Security fundamentals, threat models, basic tools and best practices.',
    category: 'DevOps',
    level: 'Beginner',
    price: 1600,
    duration: '8 weeks',
    modules: [
      { title: 'Security Basics', duration: '3 weeks', topics: ['CIA Triad', 'Threats', 'Controls'] },
      { title: 'Tools & Practices', duration: '3 weeks', topics: ['Nmap basics', 'Wireshark basics', 'Passwords'] },
      { title: 'Secure By Default', duration: '2 weeks', topics: ['Hardening', 'Updates', 'Backups'] }
    ],
    prerequisites: ['Basic IT knowledge'],
    learningOutcomes: ['Understand core security', 'Use basic tools', 'Apply best practices'],
    instructor: { name: 'Neha Singh', bio: 'Security Analyst.', experience: '5+ years' }
  },
  {
    courseId: 'cybersecurity-intermediate',
    title: 'Cyber Security - Intermediate',
    description: 'Network security, web app security, IAM, and incident response.',
    category: 'DevOps',
    level: 'Intermediate',
    price: 2400,
    duration: '10 weeks',
    modules: [
      { title: 'Network Security', duration: '3 weeks', topics: ['Firewalls', 'IDS/IPS', 'VPNs'] },
      { title: 'Web App Security', duration: '3 weeks', topics: ['OWASP Top 10', 'Input Validation', 'Auth'] },
      { title: 'IAM & IR', duration: '4 weeks', topics: ['RBAC/ABAC', 'SIEM basics', 'Incident Response'] }
    ],
    prerequisites: ['Security beginner or equivalent'],
    learningOutcomes: ['Harden networks/apps', 'Manage access', 'Respond to incidents'],
    instructor: { name: 'Arjun Patel', bio: 'Security Engineer.', experience: '7+ years' }
  },
  {
    courseId: 'cybersecurity-advanced',
    title: 'Cyber Security - Advanced',
    description: 'Pen testing, forensics, advanced defense strategies.',
    category: 'DevOps',
    level: 'Advanced',
    price: 3200,
    duration: '12 weeks',
    modules: [
      { title: 'Penetration Testing', duration: '4 weeks', topics: ['Recon', 'Exploitation', 'Reporting'] },
      { title: 'Digital Forensics', duration: '4 weeks', topics: ['Acquisition', 'Analysis', 'Chain of Custody'] },
      { title: 'Advanced Defense', duration: '4 weeks', topics: ['Zero Trust', 'Threat Hunting', 'Purple Teaming'] }
    ],
    prerequisites: ['Security intermediate knowledge'],
    learningOutcomes: ['Conduct pen tests', 'Perform forensics', 'Design defenses'],
    instructor: { name: 'Kiran Rao', bio: 'Cyber Defense Lead.', experience: '10+ years' }
  },

  // Data Science (map to Data Science category)
  {
    courseId: 'datascience-beginner',
    title: 'Data Science - Beginner',
    description: 'Python, data wrangling, visualization, intro ML.',
    category: 'Data Science',
    level: 'Beginner',
    price: 1700,
    duration: '8 weeks',
    modules: [
      { title: 'Python & Data', duration: '3 weeks', topics: ['NumPy', 'Pandas', 'Clean & Prep'] },
      { title: 'Visualization', duration: '3 weeks', topics: ['Matplotlib', 'Seaborn', 'Storytelling'] },
      { title: 'Intro ML', duration: '2 weeks', topics: ['Regression', 'Classification'] }
    ],
    prerequisites: ['Basic programming'],
    learningOutcomes: ['Work with data', 'Visualize insights', 'Build simple models'],
    instructor: { name: 'Meera Nair', bio: 'Data Scientist.', experience: '6+ years' }
  },
  {
    courseId: 'datascience-intermediate',
    title: 'Data Science - Intermediate',
    description: 'Feature engineering, model selection, ML pipelines.',
    category: 'Data Science',
    level: 'Intermediate',
    price: 2400,
    duration: '10 weeks',
    modules: [
      { title: 'Feature Engineering', duration: '3 weeks', topics: ['Encoding', 'Scaling', 'Selection'] },
      { title: 'Models & Eval', duration: '3 weeks', topics: ['Tree-based', 'Regularization', 'Metrics'] },
      { title: 'Pipelines', duration: '4 weeks', topics: ['Sklearn Pipelines', 'Serving Basics'] }
    ],
    prerequisites: ['DS beginner or equivalent'],
    learningOutcomes: ['Engineer features', 'Select models', 'Build pipelines'],
    instructor: { name: 'Rahul Das', bio: 'Senior Data Scientist.', experience: '8+ years' }
  },
  {
    courseId: 'datascience-advanced',
    title: 'Data Science - Advanced',
    description: 'Deep learning, MLOps, advanced analytics.',
    category: 'Data Science',
    level: 'Advanced',
    price: 3200,
    duration: '12 weeks',
    modules: [
      { title: 'Deep Learning', duration: '4 weeks', topics: ['CNNs', 'RNNs', 'Transformers'] },
      { title: 'MLOps', duration: '4 weeks', topics: ['Experiment Tracking', 'Deployment', 'Monitoring'] },
      { title: 'Advanced Analytics', duration: '4 weeks', topics: ['Time Series', 'Causal', 'Optimization'] }
    ],
    prerequisites: ['DS intermediate knowledge'],
    learningOutcomes: ['Train deep models', 'Productionize ML', 'Analyze complex data'],
    instructor: { name: 'Isha Kapoor', bio: 'ML Architect.', experience: '9+ years' }
  }
];

async function upsertCourses() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
  console.log('Connecting to', mongoURI);
  await mongoose.connect(mongoURI);
  console.log('✅ Connected');
  try {
    for (const data of courses) {
      const res = await Course.updateOne(
        { courseId: data.courseId },
        { $set: { ...data, isActive: true, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log(`Upserted: ${data.courseId} → ${data.title}`);
    }
    console.log('🎉 All requested courses upserted.');
  } catch (err) {
    console.error('❌ Upsert error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

if (require.main === module) {
  upsertCourses();
}