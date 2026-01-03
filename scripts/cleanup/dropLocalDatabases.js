const mongoose = require('mongoose');

async function dropDatabase(dbName) {
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Connected to ${dbName}`);
    await mongoose.connection.db.dropDatabase();
    console.log(`🗑️  Dropped database: ${dbName}`);
  } catch (err) {
    console.error(`❌ Failed to drop ${dbName}:`, err.message);
  } finally {
    try { await mongoose.connection.close(); } catch {}
  }
}

async function main() {
  const dbs = [
    'jasnav_projects',
    'jasnav_it_solutions',
    'jasnav-it-solutions',
    'nw_it_db',
    'nwit',
    'vstudents',
    'nw_it_company'
  ];

  console.log('🧹 Starting local database cleanup...');
  for (const db of dbs) {
    await dropDatabase(db);
  }
  console.log('✨ Cleanup complete.');
  process.exit(0);
}

main();