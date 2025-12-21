const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../models/Course');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Course data from frontend
const courses = [
  {
    courseId: 'ai-tools-mastery',
    title: 'A.I Tools Mastery',
    description: 'Master the latest AI tools and technologies to boost productivity and automate workflows',
    category: 'Data Science',
    level: 'Intermediate',
    price: 12000,
    duration: '12 weeks',
    modules: [
      {
        title: 'AI Fundamentals',
        duration: '3 weeks',
        topics: ['Introduction to AI', 'Machine Learning Basics', 'AI Ethics', 'AI Applications']
      },
      {
        title: 'ChatGPT & Language Models',
        duration: '3 weeks',
        topics: ['Prompt Engineering', 'Advanced ChatGPT Techniques', 'API Integration', 'Custom GPT Creation']
      },
      {
        title: 'AI Image & Video Tools',
        duration: '3 weeks',
        topics: ['Midjourney Mastery', 'DALL-E', 'Stable Diffusion', 'AI Video Generation']
      },
      {
        title: 'AI Automation & Workflows',
        duration: '3 weeks',
        topics: ['AI-Powered Automation', 'Workflow Integration', 'Business Applications', 'Future of AI']
      }
    ],
    prerequisites: ['Basic computer skills', 'Interest in AI technology'],
    learningOutcomes: [
      'Master popular AI tools and platforms',
      'Create efficient AI-powered workflows',
      'Understand AI ethics and best practices',
      'Build AI-integrated business solutions',
      'Automate repetitive tasks with AI',
      'Generate content using AI tools'
    ],
    instructor: {
      name: 'NW IT Expert',
      bio: 'Experienced AI specialist with expertise in modern AI tools and automation',
      experience: '5+ years in AI and automation'
    }
  },
  {
    courseId: 'frontend-beginner',
    title: 'Frontend Development - Beginner',
    description: 'Master the fundamentals of web development with HTML, CSS, JavaScript, and MongoDB basics',
    category: 'Frontend Development',
    level: 'Beginner',
    price: 1200,
    duration: '8 weeks',
    modules: [
      {
        title: 'HTML Fundamentals',
        duration: '2 weeks',
        topics: ['HTML Structure', 'Semantic HTML', 'Forms and Input', 'HTML5 Features']
      },
      {
        title: 'CSS Styling',
        duration: '3 weeks',
        topics: ['CSS Selectors', 'Box Model', 'Flexbox', 'Grid Layout', 'Responsive Design']
      },
      {
        title: 'JavaScript Basics',
        duration: '3 weeks',
        topics: ['Variables and Data Types', 'Functions', 'DOM Manipulation', 'Event Handling']
      }
    ],
    prerequisites: ['Basic computer skills', 'No prior coding experience required'],
    learningOutcomes: [
      'Build responsive websites from scratch',
      'Master HTML5 semantic elements',
      'Style websites with CSS3',
      'Program with JavaScript fundamentals',
      'Create interactive web elements',
      'Deploy websites to the internet'
    ],
    instructor: {
      name: 'NW IT Frontend Team',
      bio: 'Expert frontend developers with years of teaching experience',
      experience: '7+ years in frontend development and education'
    }
  },
  {
    courseId: 'frontend-intermediate',
    title: 'Frontend Development - Intermediate',
    description: 'Learn Django fundamentals, databases (MySQL & MongoDB), API integration, environment configuration, and web security best practices. Build backend-powered web applications while strengthening frontend integration skills',
    category: 'Frontend Development',
    level: 'Intermediate',
    price: 1950,
    duration: '10 weeks',
    modules: [
      {
        title: 'Django Fundamentals & MVC',
        duration: '3 weeks',
        topics: ['Project setup', 'Apps & URL routing', 'Views & templates', 'Models & ORM']
      },
      {
        title: 'Relational & Document Databases',
        duration: '3 weeks',
        topics: ['MySQL schema design', 'MongoDB collections', 'Data modeling patterns', 'CRUD operations']
      },
      {
        title: 'API Integration & Environment Config',
        duration: '2 weeks',
        topics: ['REST APIs & requests', 'Authentication tokens', 'Environment variables (.env)', 'Config management']
      },
      {
        title: 'Web Security Best Practices',
        duration: '2 weeks',
        topics: ['Input validation', 'Authentication & sessions', 'CSRF protection', 'Secure deployment']
      }
    ],
    prerequisites: ['Frontend beginner knowledge or equivalent', 'Basic JavaScript', 'Basic database concepts'],
    learningOutcomes: [
      'Build web applications using Django MVC',
      'Design relational and document databases effectively',
      'Integrate REST APIs with secure authentication',
      'Manage environment configuration for deployments',
      'Apply core web security practices in projects'
    ],
    instructor: {
      name: 'Priya Sharma',
      bio: 'Full-stack developer specializing in Django and modern web security',
      experience: '7+ years in backend and frontend integration'
    }
  },
  {
    courseId: 'frontend-advanced',
    title: 'Frontend Development - Advanced',
    description: 'Master advanced frontend concepts including performance optimization and state management',
    category: 'Frontend Development',
    level: 'Advanced',
    price: 2500,
    duration: '12 weeks',
    modules: [
      {
        title: 'Advanced React Patterns',
        duration: '3 weeks',
        topics: ['Context API', 'Custom Hooks', 'Higher-Order Components', 'Render Props']
      },
      {
        title: 'State Management',
        duration: '3 weeks',
        topics: ['Redux Toolkit', 'Zustand', 'React Query', 'Global State Patterns']
      },
      {
        title: 'Performance Optimization',
        duration: '3 weeks',
        topics: ['Code Splitting', 'Lazy Loading', 'Memoization', 'Bundle Analysis']
      },
      {
        title: 'Advanced Tooling',
        duration: '3 weeks',
        topics: ['Webpack Configuration', 'TypeScript', 'Testing Strategies', 'CI/CD']
      }
    ],
    prerequisites: ['Intermediate React knowledge', 'JavaScript ES6+', 'Basic TypeScript'],
    learningOutcomes: [
      'Implement advanced React patterns and architectures',
      'Optimize application performance and bundle size',
      'Master complex state management solutions',
      'Build scalable and maintainable applications',
      'Implement comprehensive testing strategies',
      'Deploy production-ready applications'
    ],
    instructor: {
      name: 'NW IT Senior Team',
      bio: 'Senior developers specializing in modern React development',
      experience: '10+ years in advanced frontend technologies'
    }
  },
  {
    courseId: 'devops-beginner',
    title: 'DevOps - Beginner',
    description: 'Learn the fundamentals of DevOps with Docker, CI/CD, and cloud deployment basics',
    category: 'DevOps',
    level: 'Beginner',
    price: 1000,
    duration: '8 weeks',
    modules: [
      {
        title: 'DevOps Fundamentals',
        duration: '2 weeks',
        topics: ['DevOps Culture', 'Version Control with Git', 'Linux Basics', 'Command Line']
      },
      {
        title: 'Basic Automation',
        duration: '2 weeks',
        topics: ['Shell Scripting', 'Basic CI/CD', 'Automated Testing', 'Build Tools']
      },
      {
        title: 'Deployment Basics',
        duration: '2 weeks',
        topics: ['Server Management', 'Basic Docker', 'Environment Configuration']
      },
      {
        title: 'Monitoring & Logging',
        duration: '2 weeks',
        topics: ['Basic Monitoring', 'Log Management', 'Performance Metrics']
      }
    ],
    prerequisites: ['Basic computer skills', 'Understanding of software development'],
    learningOutcomes: [
      'Understand DevOps culture and practices',
      'Master version control with Git',
      'Learn Linux command line basics',
      'Implement basic CI/CD pipelines',
      'Deploy applications to cloud platforms',
      'Monitor and troubleshoot applications'
    ],
    instructor: {
      name: 'NW IT DevOps Team',
      bio: 'DevOps specialists with extensive cloud and automation experience',
      experience: '8+ years in DevOps and cloud technologies'
    }
  },
  {
    courseId: 'devops-advanced',
    title: 'DevOps - Advanced',
    description: 'Master advanced DevOps practices with Kubernetes and infrastructure as code',
    category: 'DevOps',
    level: 'Advanced',
    price: 1400,
    duration: '14 weeks',
    modules: [
      {
        title: 'Container Orchestration',
        duration: '4 weeks',
        topics: ['Kubernetes Architecture', 'Pod Management', 'Services & Ingress', 'Scaling Strategies']
      },
      {
        title: 'Infrastructure as Code',
        duration: '3 weeks',
        topics: ['Terraform', 'Ansible', 'CloudFormation', 'Infrastructure Automation']
      },
      {
        title: 'Advanced CI/CD',
        duration: '4 weeks',
        topics: ['Jenkins Advanced', 'GitLab CI', 'Blue-Green Deployment', 'Canary Releases']
      },
      {
        title: 'Monitoring & Security',
        duration: '3 weeks',
        topics: ['Prometheus & Grafana', 'ELK Stack', 'Security Best Practices', 'Compliance Automation']
      }
    ],
    prerequisites: ['DevOps Beginner knowledge', 'Linux experience', 'Basic networking'],
    learningOutcomes: [
      'Master Kubernetes container orchestration',
      'Implement infrastructure as code with Terraform',
      'Build advanced CI/CD pipelines',
      'Set up comprehensive monitoring and alerting',
      'Implement security best practices',
      'Manage enterprise-scale deployments'
    ],
    instructor: {
      name: 'NW IT Senior DevOps',
      bio: 'Senior DevOps engineers with enterprise-level experience',
      experience: '12+ years in advanced DevOps practices'
    }
  }
];

// Seed function
const seedCourses = async () => {
  try {
    await connectDB();
    
    console.log('Starting course seeding...');
    
    // Clear existing courses with these IDs
    const courseIds = courses.map(c => c.courseId);
    await Course.deleteMany({ courseId: { $in: courseIds } });
    console.log('Cleared existing courses');
    
    // Insert new courses
    const insertedCourses = await Course.insertMany(courses);
    console.log(`Successfully seeded ${insertedCourses.length} courses:`);
    
    insertedCourses.forEach(course => {
      console.log(`- ${course.courseId}: ${course.title}`);
    });
    
    console.log('Course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seeding
seedCourses();
