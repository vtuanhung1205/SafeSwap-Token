const mongoose = require('mongoose');
const { User } = require('./src/models/User.model');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safeswap';
    console.log('MongoDB URI:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Count all users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // List all users
    const allUsers = await User.find({});
    console.log('👥 All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Google ID: ${user.googleId}`);
    });
    
    // Check specific user from API test
    const testUser = await User.findOne({ googleId: 'test123' });
    if (testUser) {
      console.log('\n✅ Test user found:');
      console.log('  ID:', testUser._id);
      console.log('  Email:', testUser.email);
      console.log('  Name:', testUser.name);
      console.log('  Google ID:', testUser.googleId);
      console.log('  Created:', testUser.createdAt);
    } else {
      console.log('\n❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testDatabase(); 