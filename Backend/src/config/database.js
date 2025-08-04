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

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
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
    console.error('Database connection failed:', error);
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 