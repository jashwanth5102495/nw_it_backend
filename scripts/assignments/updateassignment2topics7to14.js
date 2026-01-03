/*
Patch topics 7–14 for assignment 'frontend-intermediate-2' in the 'nw_it' database.
Merges topics by topicId: updates if exists, adds if missing. Keeps title/description.
Uses MONGODB_URI if provided; defaults to mongodb://localhost:27017/nw_it.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
const ASSIGNMENT_ID = process.env.ASSIGNMENT_ID || 'frontend-intermediate-2';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const newTopics = [
  {
    topicId: 'git-branching-strategies',
    title: 'Industry-Standard Branching Strategies (Git Flow, GitHub Flow)',
    content: `Git Flow introduces a structured model with branches like main, develop, feature, release, and hotfix. GitHub Flow is simpler—developers create short-lived feature branches and merge them into the main branch via pull requests.

The main use of these workflows is consistency. Teams follow the same process, ensuring predictable and readable version control behavior. Structured branching helps in release planning and bug management.

Its importance lies in reducing confusion and enhancing collaboration. Major use includes managing large teams and long-running projects. Advantages include clean pipelines, risk-free deployments, and efficient release cycles.

Branch Examples:

- git checkout -b feature/payment
- git checkout -b hotfix/crash-fix`
  },
  {
    topicId: 'github-remotes-auth',
    title: 'Working With GitHub: Remote Repositories & Authentication',
    content: `GitHub is a cloud platform where Git repositories are stored remotely. Developers push changes to GitHub so others can access or collaborate. Authentication is done using SSH keys or personal access tokens.

The main use is remote collaboration. Developers pull changes from teammates, push updates, and contribute through pull requests. GitHub also offers security tools, issue tracking, and automation.

Its importance lies in enabling global teamwork. Major uses include open-source contributions, code backups, and CI/CD integrations. Advantages include cloud storage, version history, and protection against local machine failure.

Commands:

- git remote add origin <url>
- git push -u origin main
- git pull origin main`
  },
  {
    topicId: 'git-sync-commands',
    title: 'Git Push, Pull, and Fetch Explained',
    content: `git push uploads local commits to GitHub.
git pull downloads new changes and merges them into your branch.
git fetch downloads changes but doesn’t merge them — allowing safe preview.

Their main use is synchronizing local and remote repositories. These commands ensure that all team members share updated code. Pulling frequently prevents merge conflicts.

Their importance lies in preventing outdated code and collisions. Major use includes collaborative development and deployment workflows. Advantages include real-time team sync, reduced errors, and smoother merges.

Examples:

- git push origin main
- git pull origin main
- git fetch origin`
  },
  {
    topicId: 'github-pr-code-review',
    title: 'Pull Requests (PRs) & Code Review Workflow',
    content: `A Pull Request is a way to propose changes from one branch to another, typically from a feature branch to the main branch. PRs allow conversations, reviews, comments, and approval before merging code.

The main use is maintaining code quality. Reviewers check the changes, suggest improvements, and ensure consistency. This reduces bugs and enforces standards.

Its importance comes from organized collaboration. Major use is in team environments where every change must be reviewed. Advantages include safer merges, documented discussions, and improved quality.`
  },
  {
    topicId: 'git-merge-conflicts',
    title: 'Understanding Merge Conflicts & How to Resolve Them',
    content: `Merge conflicts occur when multiple developers edit the same lines of code. Git cannot automatically decide which change is correct, so it marks the file and asks the developer to resolve it manually.

The main use of conflict resolution is to maintain code integrity. Developers open the conflicted file, choose the correct code, and commit the resolved version. Tools like VS Code merge tool simplify this process.

Its importance lies in ensuring correctness. Major uses include PR merging, rebase operations, and team development. Advantages include increased awareness of code updates and safer merges.

Commands:

- git merge feature/login
- # resolve conflicts
- git add .
- git commit`
  },
  {
    topicId: 'git-rebase-vs-merge',
    title: 'Rebasing vs Merging: Differences & Use Cases',
    content: `Merging creates a new commit combining two branches, while rebasing rewrites commit history by placing your commits on top of another branch. Rebasing creates a clean, linear history.

The main use of rebase is tidy commit logs. Merging is used for bigger team workflows where preserving commit history matters. Both play critical roles depending on project style.

Importance comes from workflow flexibility. Major use: merging in team branches, rebasing in personal branches. Advantages include cleaner logs with rebase and safer history with merge.

Commands:

- git merge main
- git rebase main`
  },
  {
    topicId: 'git-stash-clean-restore',
    title: 'Stashing, Cleaning & Restoring Work',
    content: `Git stash temporarily saves uncommitted work without committing it. Git clean removes untracked files. Git restore resets modified files to their last committed state.

The main use is managing unfinished work. Developers stash their work when switching branches or testing something quickly. Cleaning and restoring keep the working directory organized.

Importance: prevents accidental loss. Major use includes task switching and cleanup. Advantages include safety, flexibility, and a clean workspace.

Commands:

- git stash
- git stash pop
- git clean -f
- git restore <file>`
  },
  {
    topicId: 'github-issues-labels-boards',
    title: 'Issues, Labels & GitHub Project Boards',
    content: `Issues in GitHub track bugs, tasks, and enhancements. Labels categorize issues by severity, priority, or type. Project Boards visualize workflow using Kanban-style boards.

Their main use is project management. Teams organize work, assign tasks, and monitor progress. This keeps development structured.

Importance: transparency and coordination. Major uses include sprint planning, bug tracking, and feature requests. Advantages: clarity, traceability, and organized workflow.`
  }
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const doc = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!doc) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      process.exit(1);
    }
    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byId = new Map(existing.map(t => [t.topicId || t.id || t.title, t]));

    // Merge: update existing by topicId; add new if missing
    newTopics.forEach(nt => {
      const key = nt.topicId;
      if (byId.has(key)) {
        const cur = byId.get(key);
        cur.title = nt.title;
        cur.content = nt.content;
      } else {
        byId.set(key, { topicId: nt.topicId, title: nt.title, content: nt.content });
      }
    });

    // Preserve order: keep existing 1–6 first if present, then append 7–14 in defined order
    const ordered = [];
    const firstIds = (existing.map(t => t.topicId)).filter(Boolean);
    firstIds.forEach(id => { const v = byId.get(id); if (v) ordered.push(v); });
    newTopics.forEach(nt => { const v = byId.get(nt.topicId); if (v && !ordered.find(x => (x.topicId||x.id) === nt.topicId)) ordered.push(v); });

    const res = await Assignment.updateOne({ assignmentId: ASSIGNMENT_ID }, { $set: { topics: ordered } });
    console.log('Update result:', res);

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    const count = (after.topics || []).length;
    console.log(`✅ Topics updated. Count=${count}`);
    (after.topics || []).forEach((t, i) => {
      const len = (t.content || '').length;
      console.log(`  [${i+1}] ${t.title} | id=${t.topicId || 'n/a'} | contentLength=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating assignment 2 topics 7–14:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();