// Update Assignment 2 (frontend-intermediate-2) questions to Git-focused MCQs
// Uses MONGODB_URI from .env or defaults to mongodb://localhost:27017/nw_it

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.set('strictQuery', false);

const Assignment = require('../../models/Assignment');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';

const QUESTIONS = [
  { questionId: 1, prompt: 'Which command initializes a new Git repository in the current folder?', options: ['git start', 'git init', 'git create', 'git new'], correctAnswer: 1 },
  { questionId: 2, prompt: 'Which Git command is used to check the current status of tracked and untracked files?', options: ['git show', 'git log', 'git status', 'git branch'], correctAnswer: 2 },
  { questionId: 3, prompt: 'What is the main purpose of a Git branch?', options: ['To securely store login credentials','To create isolated development environments','To increase project build speed','To delete old commits'], correctAnswer: 1 },
  { questionId: 4, prompt: 'Which branching strategy is commonly used in large teams to manage production, staging, and feature development?', options: ['Random branching','Monolithic branching','Git Flow','Simple branching'], correctAnswer: 2 },
  { questionId: 5, prompt: 'What is a Pull Request (PR) mainly used for?', options: ['To delete remote branches','To merge code after review','To restart GitHub Actions','To clone repositories'], correctAnswer: 1 },
  { questionId: 6, prompt: 'Which command is used to fetch and merge changes from a remote repository?', options: ['git add','git pull','git push','git merge origin'], correctAnswer: 1 },
  { questionId: 7, prompt: 'Merge conflicts occur when:', options: ['GitHub is down','Two developers edit the same file and Git cannot auto-merge','A branch has too many commits','The repository has no README'], correctAnswer: 1 },
  { questionId: 8, prompt: 'Which command is used to stage all modified files?', options: ['git add .','git add *.*','git stage all','git commit -a'], correctAnswer: 0 },
  { questionId: 9, prompt: 'What does git clone do?', options: ['Creates a copy of a local repository','Creates a new Git branch','Makes a copy of a remote repository','Uploads code to GitHub'], correctAnswer: 2 },
  { questionId: 10, prompt: 'Which GitHub feature is used to track issues, bugs, and tasks?', options: ['GitHub Pages','GitHub Actions','GitHub Projects','GitHub Issues'], correctAnswer: 3 }
];

async function run() {
  console.log('[Update] Connecting to MongoDB:', uri);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    const assignmentId = 'frontend-intermediate-2';

    const before = await Assignment.findOne({ assignmentId }).lean();
    if (!before) {
      console.error(`[Update] Assignment not found: ${assignmentId}`);
      process.exitCode = 1;
      return;
    }
    console.log('[Before] Title:', before.title);
    console.log('[Before] Total Questions:', before.questions?.length || 0);
    console.log('[Before] First Question:', before.questions?.[0]?.prompt || before.questions?.[0]?.question);

    const update = await Assignment.updateOne(
      { assignmentId },
      { 
        $set: { 
          questions: QUESTIONS,
          passingPercentage: 60,
          updatedAt: new Date()
        }
      }
    );

    console.log('[Update] Matched:', update.matchedCount, 'Modified:', update.modifiedCount);

    const after = await Assignment.findOne({ assignmentId }).lean();
    console.log('[After] Total Questions:', after.questions?.length || 0);
    console.log('[After] First Question:', after.questions?.[0]?.prompt || after.questions?.[0]?.question);
    console.log('[After] Passing %:', after.passingPercentage);
    console.log('[Success] Assignment 2 questions updated to Git MCQs.');
  } catch (err) {
    console.error('[Error] Failed to update Assignment 2:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[Update] Disconnected.');
  }
}

run();