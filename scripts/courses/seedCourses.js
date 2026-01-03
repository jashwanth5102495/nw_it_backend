const mongoose = require('mongoose');
const Course = require('../../models/Course');
require('dotenv').config();

// Updated courses data with new pricing structure
const coursesData = [
  {
    courseId: 'AI-TOOLS-MASTERY',
    title: 'A.I Tools Mastery',
    description: 'Master the latest AI tools and technologies to boost productivity and automate workflows. Learn ChatGPT, Midjourney, and other cutting-edge AI platforms.',
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
      'Build AI-integrated business solutions'
    ],
    instructor: {
      name: 'Dr. Priya Sharma',
      bio: 'AI researcher and consultant with expertise in practical AI applications for business.',
      experience: '8+ years in AI Research, Former Google AI Team Member'
    }
  },
  {
    courseId: 'FRONTEND-BEGINNER',
    title: 'Frontend Development - Beginner',
    description: 'Learn the fundamentals of frontend development with HTML, CSS, and JavaScript. Perfect for beginners who want to start their web development journey.',
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
    prerequisites: ['Basic computer skills', 'Text editor familiarity'],
    learningOutcomes: [
      'Build responsive websites with HTML and CSS',
      'Create interactive web pages with JavaScript',
      'Understand modern web development practices',
      'Deploy websites to the internet'
    ],
    instructor: {
      name: 'Sarah Johnson',
      bio: 'Senior Frontend Developer with 8+ years of experience in building modern web applications.',
      experience: '8+ years in Frontend Development, worked at Google and Microsoft'
    }
  },
  {
    courseId: 'FRONTEND-INTERMEDIATE',
    title: 'Frontend Development - Intermediate',
    category: 'Frontend Development',
    level: 'Intermediate',
    description: 'Learn Django fundamentals, databases (MySQL & MongoDB), API integration, environment configuration, and web security best practices. Build backend-powered web applications while strengthening frontend integration skills.',
    price: 1950,
    duration: '10 weeks',
    modules: [
      {
        title: 'Module 1: Django Fundamentals & MVC',
        duration: '3 weeks',
        topics: ['Project setup', 'Apps & URL routing', 'Views & templates', 'Models & ORM']
      },
      {
        title: 'Module 2: Relational & Document Databases',
        duration: '3 weeks',
        topics: ['MySQL schema design', 'MongoDB collections', 'Data modeling patterns', 'CRUD operations']
      },
      {
        title: 'Module 3: API Integration & Environment Config',
        duration: '2 weeks',
        topics: ['REST APIs & requests', 'Authentication tokens', 'Environment variables (.env)', 'Config management']
      },
      {
        title: 'Module 4: Web Security Best Practices',
        duration: '2 weeks',
        topics: ['Input validation', 'Authentication & sessions', 'CSRF protection', 'Secure deployment']
      }
    ],
    prerequisites: ['Frontend beginner knowledge or equivalent', 'Basic JavaScript', 'Basic database concepts'],
    learningOutcomes: [
      'Use Django MVC architecture to build web apps',
      'Design relational and document databases effectively',
      'Integrate REST APIs with secure authentication',
      'Manage environment configuration for deployments',
      'Apply core web security practices in your projects'
    ],
    instructor: {
      name: 'Rohan Sharma',
      bio: 'Full Stack Developer specializing in Django and modern web development with focus on security.',
      experience: '6+ years in Full Stack Development, Backend Specialist'
    }
  },
  {
    courseId: 'FRONTEND-ADVANCED',
    title: 'Frontend Development - Advanced',
    description: 'Master advanced frontend concepts including performance optimization, advanced state management, and modern development workflows.',
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
    prerequisites: ['React experience', 'Completed Frontend Intermediate or equivalent'],
    learningOutcomes: [
      'Architect scalable frontend applications',
      'Optimize application performance',
      'Implement advanced React patterns',
      'Lead frontend development teams'
    ],
    instructor: {
      name: 'Michael Chen',
      bio: 'Senior Frontend Architect with expertise in large-scale application development.',
      experience: '10+ years in Frontend Development, Lead Engineer at Netflix'
    }
  },
  {
    courseId: 'DEVOPS-BEGINNER',
    title: 'DevOps - Beginner',
    description: 'Introduction to DevOps practices, version control, basic automation, and deployment fundamentals.',
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
    prerequisites: ['Basic programming knowledge', 'Familiarity with command line'],
    learningOutcomes: [
      'Understand DevOps principles and practices',
      'Set up basic CI/CD pipelines',
      'Deploy applications to cloud platforms',
      'Implement basic monitoring and logging'
    ],
    instructor: {
      name: 'David Kumar',
      bio: 'DevOps engineer with experience in automation and cloud infrastructure.',
      experience: '7+ years in DevOps, Senior Engineer at Amazon'
    }
  },
  {
    courseId: 'DEVOPS-ADVANCED',
    title: 'DevOps - Advanced',
    description: 'Master advanced DevOps practices with Kubernetes, infrastructure as code, and enterprise-level automation.',
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
        title: 'Enterprise DevOps',
        duration: '3 weeks',
        topics: ['Security Integration', 'Compliance', 'Multi-Cloud Strategies', 'Team Scaling']
      }
    ],
    prerequisites: ['DevOps fundamentals', 'Docker experience', 'Cloud platform knowledge'],
    learningOutcomes: [
      'Design enterprise-level DevOps architectures',
      'Implement advanced container orchestration',
      'Automate infrastructure provisioning',
      'Lead DevOps transformation initiatives'
    ],
    instructor: {
      name: 'Alex Thompson',
      bio: 'Principal DevOps Engineer with expertise in large-scale system architecture.',
      experience: '12+ years in DevOps, Principal Engineer at Google'
    }
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    await mongoose.connect(mongoURI);

    console.log('✅ Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses (including DATASCIENCE-INTERMEDIATE)');

    // Insert new courses
    const insertedCourses = await Course.insertMany(coursesData);
    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Display inserted courses
    insertedCourses.forEach(course => {
      console.log(`   - ${course.courseId}: ${course.title}`);
    });

    console.log('\n🎉 Course seeding completed successfully!');
    console.log('📚 Available courses:');
    console.log('   1. Frontend Development - Beginner');
    console.log('   2. Frontend Development - Intermediate');
    console.log('   3. Frontend Development - Advanced');
    console.log('   4. DevOps - Beginner');
    console.log('   5. DevOps - Advanced');
    console.log('   6. Mobile App Development - Advanced');
    console.log('   7. Browser Extensions Development');

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedCourses();
}

module.exports = { seedCourses, coursesData };