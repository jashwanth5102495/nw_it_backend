const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // MongoDB connection string - with localhost fallback for local development
      const mongoURI =  process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects' ;
      console.log(mongoURI);
      console.log(`🔗 Connecting to MongoDB: ${mongoURI.includes('localhost') ? 'localhost:27017' : 'cloud database'}`);
      
      this.connection = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('✅ Connected to MongoDB database');
      
      // Initialize default admin user if it doesn't exist
      await this.initializeDefaultUser();
      
    } catch (err) {
      console.error('❌ Error connecting to MongoDB database:', err.message);
      throw err;
    }
  }

  async initializeDefaultUser() {
    try {
      const User = require('../models/User');
      const existingAdmin = await User.findOne({ username: 'admin' });
      
      if (!existingAdmin) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const adminUser = new User({
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        });
        
        await adminUser.save();
        console.log('✅ Default admin user created (username: admin, password: admin123)');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (err) {
      console.error('❌ Error initializing default user:', err.message);
    }
  }

  getConnection() {
    return this.connection;
  }

  async close() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
      }
    } catch (err) {
      console.error('❌ Error closing database:', err.message);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  const database = new Database();
  await database.close();
  process.exit(0);
});

module.exports = new Database();