require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'frontend-intermediate-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Assignment 2 — Version Control & Industry-Standard Git Workflow (MCQs)
const questions = [
  {
    questionId: 1,
    prompt: 'Which command initializes a new Git repository in the current folder?',
    options: ['git start', 'git init', 'git create', 'git new'],
    correctAnswer: 1,
  },
  {
    questionId: 2,
    prompt: 'Which Git command is used to check the current status of tracked and untracked files?',
    options: ['git show', 'git log', 'git status', 'git branch'],
    correctAnswer: 2,
  },
  {
    questionId: 3,
    prompt: 'What is the main purpose of a Git branch?',
    options: ['To securely store login credentials', 'To create isolated development environments', 'To increase project build speed', 'To delete old commits'],
    correctAnswer: 1,
  },
  {
    questionId: 4,
    prompt: 'Which branching strategy is commonly used in large teams to manage production, staging, and feature development?',
    options: ['Random branching', 'Monolithic branching', 'Git Flow', 'Simple branching'],
    correctAnswer: 2,
  },
  {
    questionId: 5,
    prompt: 'What is a Pull Request (PR) mainly used for?',
    options: ['To delete remote branches', 'To merge code after review', 'To restart GitHub Actions', 'To clone repositories'],
    correctAnswer: 1,
  },
  {
    questionId: 6,
    prompt: 'Which command is used to fetch and merge changes from a remote repository?',
    options: ['git add', 'git pull', 'git push', 'git merge origin'],
    correctAnswer: 1,
  },
  {
    questionId: 7,
    prompt: 'Merge conflicts occur when:',
    options: ['GitHub is down', 'Two developers edit the same file and Git cannot auto-merge', 'A branch has too many commits', 'The repository has no README'],
    correctAnswer: 1,
  },
  {
    questionId: 8,
    prompt: 'Which command is used to stage all modified files?',
    options: ['git add .', 'git add *.*', 'git stage all', 'git commit -a'],
    correctAnswer: 0,
  },
  {
    questionId: 9,
    prompt: 'What does git clone do?',
    options: ['Creates a copy of a local repository', 'Creates a new Git branch', 'Makes a copy of a remote repository', 'Uploads code to GitHub'],
    correctAnswer: 2,
  },
  {
    questionId: 10,
    prompt: 'Which GitHub feature is used to track issues, bugs, and tasks?',
    options: ['GitHub Pages', 'GitHub Actions', 'GitHub Projects', 'GitHub Issues'],
    correctAnswer: 3,
  },
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update questions and passing threshold (require >5/10 to pass)
    assignment.questions = questions;
    assignment.totalQuestions = questions.length;
    assignment.passingPercentage = 60;

    await assignment.save();
    console.log('✅ Updated questions for', ASSIGNMENT_ID, 'Total:', questions.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Patch failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();