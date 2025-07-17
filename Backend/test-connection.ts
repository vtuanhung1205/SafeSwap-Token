import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('📍 Connecting to:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test ping
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Ping successful!');
      
      // List databases (optional)
      const admin = mongoose.connection.db.admin();
      const dbs = await admin.listDatabases();
      console.log('📊 Available databases:', dbs.databases.map(db => db.name));
    }
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message?.includes('Authentication failed')) {
      console.log('💡 Hint: Check your username and password in the connection string');
    }
    
    if (error.message?.includes('ENOTFOUND')) {
      console.log('💡 Hint: Check your internet connection and cluster URL');
    }
    
    if (error.message?.includes('ServerSelectionTimeoutError')) {
      console.log('💡 Hint: Check your IP whitelist in MongoDB Atlas');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
};

testConnection();
