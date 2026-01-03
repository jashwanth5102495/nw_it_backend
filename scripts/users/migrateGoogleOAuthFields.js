/**
 * Migration Script: Add Google OAuth Fields to Existing Records
 * 
 * This script safely adds new fields to existing User and Student documents
 * without breaking existing functionality.
 * 
 * New fields added:
 * - User: email, authProvider, googleId
 * - Student: authProvider, googleId, setupRequired, setupCompletedAt (already exist)
 * 
 * Run: node scripts/migrateGoogleOAuthFields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/User');
const Student = require('../../models/Student');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');
    console.log(`  Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateUsers = async () => {
  console.log('\n========================================');
  console.log('MIGRATING USER RECORDS');
  console.log('========================================\n');

  try {
    // Find all users without the new fields
    const users = await User.find({});
    console.log(`Found ${users.length} user records to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Add email field if missing (use null as default)
      if (user.email === undefined) {
        updates.email = null;
        needsUpdate = true;
        console.log(`  User ${user.username}: Adding email field (null)`);
      }

      // Add authProvider if missing (default to 'local')
      if (!user.authProvider) {
        updates.authProvider = 'local';
        needsUpdate = true;
        console.log(`  User ${user.username}: Adding authProvider = 'local'`);
      }

      // Add googleId if missing (default to null)
      if (user.googleId === undefined) {
        updates.googleId = null;
        needsUpdate = true;
        console.log(`  User ${user.username}: Adding googleId field (null)`);
      }

      // Make password optional for Google OAuth users
      // Existing users have passwords, so no change needed
      
      if (needsUpdate) {
        await User.updateOne(
          { _id: user._id },
          { $set: updates },
          { strict: false } // Allow adding new fields
        );
        updatedCount++;
        console.log(`  ✓ Updated user: ${user.username}\n`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n----------------------------------------');
    console.log(`User Migration Summary:`);
    console.log(`  Total checked: ${users.length}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped (already up-to-date): ${skippedCount}`);
    console.log('----------------------------------------\n');

  } catch (error) {
    console.error('✗ Error migrating users:', error);
    throw error;
  }
};

const migrateStudents = async () => {
  console.log('\n========================================');
  console.log('MIGRATING STUDENT RECORDS');
  console.log('========================================\n');

  try {
    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} student records to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const student of students) {
      let needsUpdate = false;
      const updates = {};

      // Add authProvider if missing (default to 'local')
      if (!student.authProvider) {
        updates.authProvider = 'local';
        needsUpdate = true;
        console.log(`  Student ${student.email}: Adding authProvider = 'local'`);
      }

      // Add googleId if missing (default to null)
      if (student.googleId === undefined) {
        updates.googleId = null;
        needsUpdate = true;
        console.log(`  Student ${student.email}: Adding googleId field (null)`);
      }

      // Add setupRequired if missing (default to false for existing students)
      if (student.setupRequired === undefined) {
        updates.setupRequired = false;
        needsUpdate = true;
        console.log(`  Student ${student.email}: Adding setupRequired = false`);
      }

      // Add setupCompletedAt if missing (default to null)
      if (student.setupCompletedAt === undefined) {
        updates.setupCompletedAt = null;
        needsUpdate = true;
        console.log(`  Student ${student.email}: Adding setupCompletedAt field (null)`);
      }

      // Ensure phone field exists (already in schema but make sure)
      if (student.phone === undefined) {
        updates.phone = '';
        needsUpdate = true;
        console.log(`  Student ${student.email}: Adding phone field (empty string)`);
      }

      if (needsUpdate) {
        await Student.updateOne(
          { _id: student._id },
          { $set: updates },
          { strict: false }
        );
        updatedCount++;
        console.log(`  ✓ Updated student: ${student.email}\n`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n----------------------------------------');
    console.log(`Student Migration Summary:`);
    console.log(`  Total checked: ${students.length}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped (already up-to-date): ${skippedCount}`);
    console.log('----------------------------------------\n');

  } catch (error) {
    console.error('✗ Error migrating students:', error);
    throw error;
  }
};

const verifyMigration = async () => {
  console.log('\n========================================');
  console.log('VERIFICATION');
  console.log('========================================\n');

  try {
    // Verify users
    const usersWithAuthProvider = await User.countDocuments({ authProvider: { $exists: true } });
    const totalUsers = await User.countDocuments({});
    console.log(`Users with authProvider field: ${usersWithAuthProvider}/${totalUsers}`);

    const usersWithGoogleId = await User.countDocuments({ googleId: { $exists: true } });
    console.log(`Users with googleId field: ${usersWithGoogleId}/${totalUsers}`);

    const usersWithEmail = await User.countDocuments({ email: { $exists: true } });
    console.log(`Users with email field: ${usersWithEmail}/${totalUsers}`);

    // Verify students
    const studentsWithAuthProvider = await Student.countDocuments({ authProvider: { $exists: true } });
    const totalStudents = await Student.countDocuments({});
    console.log(`\nStudents with authProvider field: ${studentsWithAuthProvider}/${totalStudents}`);

    const studentsWithGoogleId = await Student.countDocuments({ googleId: { $exists: true } });
    console.log(`Students with googleId field: ${studentsWithGoogleId}/${totalStudents}`);

    const studentsWithSetupRequired = await Student.countDocuments({ setupRequired: { $exists: true } });
    console.log(`Students with setupRequired field: ${studentsWithSetupRequired}/${totalStudents}`);

    if (usersWithAuthProvider === totalUsers && 
        studentsWithAuthProvider === totalStudents &&
        usersWithGoogleId === totalUsers &&
        studentsWithGoogleId === totalStudents) {
      console.log('\n✓ Migration verified successfully!');
      console.log('  All records have the new fields.');
    } else {
      console.log('\n⚠ Warning: Some records may not have been updated.');
      console.log('  Please review the migration logs above.');
    }

  } catch (error) {
    console.error('✗ Error during verification:', error);
    throw error;
  }
};

const runMigration = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Google OAuth Fields Migration Script ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    await connectDB();
    await migrateUsers();
    await migrateStudents();
    await verifyMigration();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    Migration Completed Successfully    ║');
    console.log('╚════════════════════════════════════════╝\n');

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
