const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    console.log('Database connection - Environment:', process.env.NODE_ENV);
    console.log('Database connection - MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('Database connection - MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'SET' : 'NOT SET');
    
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? (process.env.MONGODB_URI_PROD || process.env.MONGODB_URI)
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Validate MongoDB URI format
    if (!mongoURI.includes('mongodb+srv://') && !mongoURI.includes('mongodb://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb+srv:// or mongodb://');
    }

    // Check if URI contains username and password
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('@')) {
      throw new Error('MongoDB URI must include username and password');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string format check: OK');
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Error details:', error);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('❌ MongoDB connection string is invalid or cluster does not exist');
      console.error('💡 Please check your MongoDB Atlas cluster and connection string');
    } else if (error.message.includes('Authentication failed')) {
      console.error('❌ MongoDB authentication failed');
      console.error('💡 Please check your username and password');
    } else if (error.message.includes('Invalid MongoDB URI format')) {
      console.error('❌ MongoDB URI format is incorrect');
      console.error('💡 Format should be: mongodb+srv://username:password@cluster.mongodb.net/database');
    }
    
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 