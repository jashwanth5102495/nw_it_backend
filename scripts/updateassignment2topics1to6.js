/*
Patch topics 1–6 and metadata for assignment 'frontend-intermediate-2' in the 'nw_it' database.
Sets title to "Assignment 2 — Version Control & Industry-Standard Git Workflow" and updates description.
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-2';

// Minimal schema to allow flexible document shape
const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    {
      topicId: String,
      title: String,
      content: String,
    },
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Provided content mapped to 6 topics
const newTopics = [
  {
    topicId: 'vcs-intro',
    title: 'Introduction to Version Control Systems (VCS)',
    content: `A Version Control System (VCS) is a tool that records changes made to files over time so developers can recall specific versions later. It allows multiple people to collaborate on the same project without overwriting each other’s work. Git is the most popular VCS because it is distributed, fast, and enables powerful workflows for software development.

The main use of a VCS is to track the evolution of a project over time. Developers can view previous file versions, compare differences, revert broken updates, and create experimental features without affecting the main code. This drastically improves stability and transparency in software development.

Version control is important because it enables teamwork at scale. The major use is collaboration: multiple developers contribute simultaneously by using branches, merging changes, and resolving conflicts. The advantage is reliability — even if a mistake happens, VCS provides complete history and protection against data loss.

Example Commands:

- git init
- git status
- git log`
  },
  {
    topicId: 'git-internals',
    title: 'Understanding Git and How It Works Internally',
    content: `Git is a distributed version control system, meaning every developer has a full copy of the repository, not just a working snapshot. It stores data in the form of snapshots rather than differences, making it highly efficient. Internally, Git uses hashing (SHA-1) to secure and identify each commit uniquely.

Its main use is to track and manage changes efficiently. Git’s internal structure—objects like blobs, trees, and commits—helps maintain integrity and reliability of project history. Developers can experiment, switch branches, and revert changes without losing previous work.

The importance of Git lies in its speed, security, and branching model. Its major use is in large-scale development where many changes happen frequently. Advantages include extremely fast operations, lightweight branching, and the ability to work offline.

Common Commands:

- git clone <url>
- git add .
- git commit -m "Message"`
  },
  {
    topicId: 'git-install-config',
    title: 'Installing Git and Configuring Global Settings',
    content: `Git installation is the first step to version control. Once installed, developers configure their identity using global settings like username and email. These details are attached to every Git commit, making it easier to track authorship in collaborative environments.

The main use of Git configuration is to establish consistency across commits. Without proper configuration, Git repositories may show unknown or anonymous users, causing confusion during project tracking. It also helps set preferences for editors, merge tools, and default behaviors.

Its importance lies in maintaining clear commit history and team accountability. The major use is standardizing commit metadata. Advantages include clean commit logs and ensuring project contributors are identifiable.

Commands:

- git config --global user.name "Your Name"
- git config --global user.email "your@email.com"
- git config --global core.editor "code --wait"`
  },
  {
    topicId: 'git-staging',
    title: 'Initializing Repositories & Understanding the Staging Area',
    content: `A Git repository is initialized using the git init command, which creates hidden metadata to track changes. Git uses a staging area (also called the index) where modified files are placed before being committed. This allows granular control over which changes are included in each commit.

The main use of the staging area is to prepare commits. Developers can selectively stage files, organize changes, and maintain clean commit histories. This separates the act of modifying code from saving code history.

Its importance lies in maintaining commit accuracy. The major use is creating structured commit messages and grouping related changes. Advantages include better project organization, reduced errors, and accurate version snapshots.

Example Commands:

- git init
- git add <file>
- git add .
- git commit -m "Initial commit"`
  },
  {
    topicId: 'git-commits',
    title: 'Understanding Commits: History, Metadata & Best Practices',
    content: `A commit is a snapshot of project files at a specific time. It contains metadata such as author, timestamp, parent commits, and a message describing the change. Commit messages are vital for tracking progress and understanding decisions made in development.

The main use of commits is to document project evolution. Good commit practices — small, focused, and meaningful messages — make debugging and collaboration easier. Developers rely on commit history to understand when and why changes were introduced.

Its importance comes from improving long-term maintainability. Its major use is rollback abilities—developers can revert to any commit when necessary. Advantages include clear traceability, rapid debugging, and reliable project history.

Commands:

- git commit -m "Fix: updated login validation"
- git show <commit-id>
- git log --oneline`
  },
  {
    topicId: 'git-branches',
    title: 'Working With Git Branches',
    content: `Branches allow developers to work on new features, experiments, or fixes without affecting the main project. Git’s branching system is lightweight, meaning developers can create, switch, and delete branches easily. This ensures isolation of development work.

The main use of branches is parallel development. For example, developers create feature branches, bug-fix branches, or hotfix branches. Each branch contains isolated changes until it’s ready to merge.

Its importance lies in enabling teamwork and safe experimentation. Major uses include feature development, sprint workflows, and release management. Advantages include zero risk to main code, easier testing, and organized workflows.

Commands:

- git branch
- git branch feature/login
- git checkout feature/login
- git switch main`
  },
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const match = { assignmentId: ASSIGNMENT_ID };
    const update = {
      $set: {
        title: 'Assignment 2 — Version Control & Industry-Standard Git Workflow',
        description: 'Focus: Git, GitHub, branching strategies, PR workflow, merge conflicts, issue tracking.',
        topics: newTopics,
      }
    };

    const res = await Assignment.updateOne(match, update, { upsert: false });
    console.log('Update result:', res);

    const after = await Assignment.findOne(match).lean();
    if (!after) {
      console.log('❌ Assignment not found after update:', ASSIGNMENT_ID);
    } else {
      console.log(`✅ Updated assignment: ${after.title}`);
      console.log('Topics count:', (after.topics || []).length);
      (after.topics || []).forEach((t, i) => {
        const len = (t.content || '').length;
        console.log(`  [${i+1}] ${t.title} | contentLength=${len}`);
      });
    }

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 2:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();