
const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../../models/Course');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blunet_db';

const seedDataScienceCourse = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const courseData = {
      courseId: 'data-science-beginner',
      title: 'Data Science - Beginner',
      description: 'Start your journey into Data Science. Learn Python, Data Manipulation, Visualization, and Basic Statistics.',
      category: 'Data Science',
      level: 'Beginner',
      price: 1200,
      duration: '8 weeks',
      instructor: {
        name: 'Dr. Sarah Johnson',
        bio: 'Data Scientist with 10+ years of experience in AI and Machine Learning.',
        experience: '10+ years in Data Science & AI',
        rating: 4.8
      },
      technologies: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter'],
      prerequisites: ['Basic Math', 'No prior coding experience required'],
      learningOutcomes: [
        'Understand the Data Science lifecycle',
        'Master Python programming for Data Science',
        'Perform data manipulation using Pandas and NumPy',
        'Visualize data with Matplotlib and Seaborn',
        'Understand basic statistical concepts'
      ],
      modules: [
        {
          title: 'Introduction to Data Science & Python',
          duration: '2 weeks',
          topics: [
            'What is Data Science?',
            'Python Basics (Variables, Loops, Functions)',
            'Python Data Structures (Lists, Dictionaries)',
            'Setting up Jupyter Notebooks'
          ]
        },
        {
          title: 'Data Manipulation with Pandas & NumPy',
          duration: '3 weeks',
          topics: [
            'NumPy Arrays & Operations',
            'Pandas DataFrames & Series',
            'Data Cleaning & Preprocessing',
            'Handling Missing Data'
          ]
        },
        {
          title: 'Data Visualization',
          duration: '2 weeks',
          topics: [
            'Introduction to Matplotlib',
            'Customizing Plots',
            'Seaborn for Statistical Plots',
            'Interactive Visualizations'
          ]
        },
        {
          title: 'Statistics & Probability Basics',
          duration: '1 week',
          topics: [
            'Descriptive Statistics',
            'Probability Distributions',
            'Hypothesis Testing Basics',
            'Correlation vs Causation'
          ]
        }
      ],
      projects: 2,
      rating: 4.8,
      students: 0,
      maxStudents: 5000,
      features: [
        'Hands-on Python Labs',
        'Real-world Datasets',
        '2 Capstone Projects',
        'Certificate of Completion'
      ]
    };

    const existingCourse = await Course.findOne({ courseId: courseData.courseId });
    if (existingCourse) {
      console.log('Course already exists. Updating...');
      await Course.findOneAndUpdate({ courseId: courseData.courseId }, courseData);
    } else {
      console.log('Creating new course...');
      await Course.create(courseData);
    }

    console.log('Data Science - Beginner course seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding course:', error);
    process.exit(1);
  }
};

seedDataScienceCourse();
