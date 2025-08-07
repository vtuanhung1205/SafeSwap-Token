#!/usr/bin/env node

/**
 * Test MongoDB Connection Script
 * Usage: node test-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'SET' : 'NOT SET');
    
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? (process.env.MONGODB_URI_PROD || process.env.MONGODB_URI)
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('❌ No MongoDB URI found in environment variables');
      console.log('💡 Please set MONGODB_URI or MONGODB_URI_PROD');
      process.exit(1);
    }

    console.log('\n📋 Connection String Analysis:');
    console.log('Format:', mongoURI.includes('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://');
    console.log('Has username/password:', mongoURI.includes('@') ? '✅ Yes' : '❌ No');
    console.log('Has database name:', mongoURI.includes('/') && mongoURI.split('/').length > 3 ? '✅ Yes' : '❌ No');

    console.log('\n🔗 Attempting to connect...');
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready State:', conn.connection.readyState);

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test collection creation
    const testCollection = conn.connection.db.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Write operation successful');
    
    // Test read operation
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    
    // Clean up
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful');

    await mongoose.connection.close();
    console.log('\n🎉 All tests passed! Database connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Troubleshooting:');
      console.error('1. Check if your MongoDB Atlas cluster exists');
      console.error('2. Verify the connection string format');
      console.error('3. Ensure the cluster name is correct');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Troubleshooting:');
      console.error('1. Check your username and password');
      console.error('2. Ensure the database user has proper permissions');
      console.error('3. Verify the database name is correct');
    } else if (error.message.includes('Network')) {
      console.error('\n💡 Troubleshooting:');
      console.error('1. Check your internet connection');
      console.error('2. Ensure IP is whitelisted in MongoDB Atlas');
      console.error('3. Try allowing access from anywhere (0.0.0.0/0)');
    }
    
    process.exit(1);
  }
};

// Run the test
testConnection();
