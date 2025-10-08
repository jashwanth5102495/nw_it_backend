const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Faculty = require('../models/Faculty');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it_company', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const facultyData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@nwit.com',
    referralCode: 'SARA001',
    commissionRate: 0.60
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@nwit.com',
    referralCode: 'MICH002',
    commissionRate: 0.60
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@nwit.com',
    referralCode: 'EMIL003',
    commissionRate: 0.60
  },
  {
    name: 'Prof. David Kumar',
    email: 'david.kumar@nwit.com',
    referralCode: 'DAVI004',
    commissionRate: 0.60
  },
  {
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@nwit.com',
    referralCode: 'LISA005',
    commissionRate: 0.60
  }
];

async function seedFaculty() {
  try {
    console.log('🌱 Starting faculty seeding...');

    // Clear existing faculty data
    await Faculty.deleteMany({});
    console.log('✅ Cleared existing faculty data');

    // Insert new faculty data
    const createdFaculty = await Faculty.insertMany(facultyData);
    console.log(`✅ Created ${createdFaculty.length} faculty members`);

    // Display created faculty with their referral codes
    console.log('\n📋 Faculty Members Created:');
    console.log('================================');
    createdFaculty.forEach((faculty, index) => {
      console.log(`${index + 1}. ${faculty.name}`);
      console.log(`   Email: ${faculty.email}`);
      console.log(`   Referral Code: ${faculty.referralCode}`);
      console.log(`   Commission Rate: ${(faculty.commissionRate * 100)}%`);
      console.log('   --------------------------------');
    });

    console.log('\n🎯 Test Referral Codes:');
    console.log('========================');
    createdFaculty.forEach(faculty => {
      console.log(`- ${faculty.referralCode} (${faculty.name})`);
    });

    console.log('\n✅ Faculty seeding completed successfully!');
    console.log('💡 You can now test the referral code system with the codes above.');

  } catch (error) {
    console.error('❌ Error seeding faculty:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedFaculty();