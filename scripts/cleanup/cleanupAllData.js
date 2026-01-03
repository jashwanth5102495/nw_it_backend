const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Purchase = require('../../models/Purchase');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jasnav_it_solutions', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupAllData() {
  try {
    console.log('🧹 Starting data cleanup...');
    
    // Delete all payments
    const deletedPayments = await Payment.deleteMany({});
    console.log(`✅ Deleted ${deletedPayments.deletedCount} payment records`);
    
    // Delete all purchases
    const deletedPurchases = await Purchase.deleteMany({});
    console.log(`✅ Deleted ${deletedPurchases.deletedCount} purchase records`);
    
    console.log('🎉 Data cleanup completed successfully!');
    console.log('You can now delete user accounts manually and test the system from the beginning.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupAllData();