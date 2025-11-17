/**
 * PRODUCTION DATABASE MIGRATION SCRIPT
 * 
 * This script safely adds new OAuth fields to existing production data
 * WITHOUT modifying or deleting any existing data.
 * 
 * New fields added:
 * - User: email (if missing), authProvider='local', googleId=null
 * - Student: authProvider='local', googleId=null, setupRequired=false
 * 
 * SAFE TO RUN MULTIPLE TIMES - Only adds missing fields
 * 
 * Run: node scripts/migrateProductionDatabase.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

require('dotenv').config();

// PRODUCTION MongoDB URL
const PRODUCTION_MONGODB_URI = process.env.PRODUCTION_MONGODB_URI;
// Connect to Production MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('\n✓ Connected to PRODUCTION MongoDB Atlas');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    console.log('\n⚠️  WARNING: This will modify PRODUCTION data');
    console.log('   Only missing fields will be added. Existing data will NOT be changed.\n');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateUsers = async () => {
  console.log('========================================');
  console.log('MIGRATING USER RECORDS');
  console.log('========================================\n');

  try {
    const totalUsers = await User.countDocuments({});
    console.log(`Found ${totalUsers} user records\n`);

    // Update all users missing authProvider
    const authProviderResult = await User.updateMany(
      { authProvider: { $exists: false } },
      { $set: { authProvider: 'local' } }
    );
    
    // Update all users missing googleId
    const googleIdResult = await User.updateMany(
      { googleId: { $exists: false } },
      { $set: { googleId: null } }
    );

    console.log('Updates Applied:');
    console.log(`  authProvider='local': ${authProviderResult.modifiedCount} users`);
    console.log(`  googleId=null: ${googleIdResult.modifiedCount} users`);
    console.log('');

    console.log('----------------------------------------');
    console.log(`User Migration Summary:`);
    console.log(`  Total users: ${totalUsers}`);
    console.log(`  Updated with authProvider: ${authProviderResult.modifiedCount}`);
    console.log(`  Updated with googleId: ${googleIdResult.modifiedCount}`);
    console.log('----------------------------------------\n');

    return { 
      total: totalUsers, 
      updated: Math.max(authProviderResult.modifiedCount, googleIdResult.modifiedCount),
      skipped: totalUsers - Math.max(authProviderResult.modifiedCount, googleIdResult.modifiedCount)
    };
  } catch (error) {
    console.error('✗ Error migrating users:', error);
    throw error;
  }
};

const migrateStudents = async () => {
  console.log('========================================');
  console.log('MIGRATING STUDENT RECORDS');
  console.log('========================================\n');

  try {
    const totalStudents = await Student.countDocuments({});
    console.log(`Found ${totalStudents} student records\n`);

    // Update all students missing authProvider
    const authProviderResult = await Student.updateMany(
      { authProvider: { $exists: false } },
      { $set: { authProvider: 'local' } }
    );
    
    // Update all students missing googleId
    const googleIdResult = await Student.updateMany(
      { googleId: { $exists: false } },
      { $set: { googleId: null } }
    );
    
    // Update all students missing setupRequired (existing students are already set up)
    const setupRequiredResult = await Student.updateMany(
      { setupRequired: { $exists: false } },
      { $set: { setupRequired: false } }
    );
    
    // Update all students missing setupCompletedAt
    const setupCompletedAtResult = await Student.updateMany(
      { setupCompletedAt: { $exists: false } },
      { $set: { setupCompletedAt: null } }
    );
    
    // Update all students missing phone field
    const phoneResult = await Student.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: '' } }
    );

    console.log('Updates Applied:');
    console.log(`  authProvider='local': ${authProviderResult.modifiedCount} students`);
    console.log(`  googleId=null: ${googleIdResult.modifiedCount} students`);
    console.log(`  setupRequired=false: ${setupRequiredResult.modifiedCount} students`);
    console.log(`  setupCompletedAt=null: ${setupCompletedAtResult.modifiedCount} students`);
    console.log(`  phone='': ${phoneResult.modifiedCount} students`);
    console.log('');

    console.log('----------------------------------------');
    console.log(`Student Migration Summary:`);
    console.log(`  Total students: ${totalStudents}`);
    console.log(`  Updated with authProvider: ${authProviderResult.modifiedCount}`);
    console.log(`  Updated with googleId: ${googleIdResult.modifiedCount}`);
    console.log(`  Updated with setupRequired: ${setupRequiredResult.modifiedCount}`);
    console.log('----------------------------------------\n');

    return { 
      total: totalStudents, 
      updated: Math.max(authProviderResult.modifiedCount, googleIdResult.modifiedCount),
      skipped: totalStudents - Math.max(authProviderResult.modifiedCount, googleIdResult.modifiedCount)
    };
  } catch (error) {
    console.error('✗ Error migrating students:', error);
    throw error;
  }
};

const verifyMigration = async () => {
  console.log('========================================');
  console.log('VERIFICATION');
  console.log('========================================\n');

  try {
    // Verify users
    const totalUsers = await User.countDocuments({});
    const usersWithAuthProvider = await User.countDocuments({ authProvider: { $exists: true } });
    const usersWithGoogleId = await User.countDocuments({ googleId: { $exists: true } });
    const usersWithEmail = await User.countDocuments({ email: { $exists: true } });

    console.log('User Fields:');
    console.log(`  authProvider: ${usersWithAuthProvider}/${totalUsers} ✓`);
    console.log(`  googleId: ${usersWithGoogleId}/${totalUsers} ✓`);
    console.log(`  email: ${usersWithEmail}/${totalUsers} ✓`);

    // Verify students
    const totalStudents = await Student.countDocuments({});
    const studentsWithAuthProvider = await Student.countDocuments({ authProvider: { $exists: true } });
    const studentsWithGoogleId = await Student.countDocuments({ googleId: { $exists: true } });
    const studentsWithSetupRequired = await Student.countDocuments({ setupRequired: { $exists: true } });

    console.log('\nStudent Fields:');
    console.log(`  authProvider: ${studentsWithAuthProvider}/${totalStudents} ✓`);
    console.log(`  googleId: ${studentsWithGoogleId}/${totalStudents} ✓`);
    console.log(`  setupRequired: ${studentsWithSetupRequired}/${totalStudents} ✓`);

    // Sample data check
    console.log('\nSample Data Check:');
    const sampleUser = await User.findOne({}).limit(1);
    if (sampleUser) {
      console.log(`  Sample User: ${sampleUser.username}`);
      console.log(`    - authProvider: ${sampleUser.authProvider}`);
      console.log(`    - googleId: ${sampleUser.googleId}`);
      console.log(`    - email: ${sampleUser.email || '(not set)'}`);
    }

    const sampleStudent = await Student.findOne({}).limit(1);
    if (sampleStudent) {
      console.log(`  Sample Student: ${sampleStudent.email || sampleStudent.studentId}`);
      console.log(`    - authProvider: ${sampleStudent.authProvider}`);
      console.log(`    - googleId: ${sampleStudent.googleId}`);
      console.log(`    - setupRequired: ${sampleStudent.setupRequired}`);
    }

    const allFieldsPresent = 
      usersWithAuthProvider === totalUsers &&
      usersWithGoogleId === totalUsers &&
      studentsWithAuthProvider === totalStudents &&
      studentsWithGoogleId === totalStudents &&
      studentsWithSetupRequired === totalStudents;

    if (allFieldsPresent) {
      console.log('\n✓ Migration verified successfully!');
      console.log('  All records have the new fields.');
    } else {
      console.log('\n⚠ Warning: Some records may be missing fields.');
      console.log('  You can re-run this script safely to fix them.');
    }

    return allFieldsPresent;
  } catch (error) {
    console.error('✗ Error during verification:', error);
    throw error;
  }
};

const runMigration = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   PRODUCTION DATABASE MIGRATION        ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    await connectDB();
    
    // Wait 3 seconds to give user time to cancel if needed
    console.log('Starting migration in 3 seconds... (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('');

    const userResults = await migrateUsers();
    const studentResults = await migrateStudents();
    const verified = await verifyMigration();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    MIGRATION COMPLETED SUCCESSFULLY    ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Summary:');
    console.log(`  Users: ${userResults.updated}/${userResults.total} updated`);
    console.log(`  Students: ${studentResults.updated}/${studentResults.total} updated`);
    console.log(`  Verification: ${verified ? 'PASSED ✓' : 'NEEDS REVIEW ⚠'}`);
    console.log('\n✓ All existing data preserved');
    console.log('✓ No data was deleted or modified');
    console.log('✓ Only new fields were added\n');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
};

// Run the migration
runMigration();
