const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDatabase = async () => {
  try {
    // MongoDB Atlas URI from environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI not found in environment variables');
      } else {
        logger.warn('MONGODB_URI not found. Running in development mode without database.');
        return false; // Return false to indicate no database connection
      }
    }
    
    logger.info(`🔗 Connecting to MongoDB: ${mongoUri.includes('@') ? mongoUri.split('@')[1] : mongoUri}`);
    
    // MongoDB connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      retryWrites: true,
    };
    
    await mongoose.connect(mongoUri, options);
    
    logger.info('📦 MongoDB connected successfully');
    logger.info(`📍 Connected to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Test the connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      logger.info('🏓 Database ping successful');
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    mongoose.connection.on('close', () => {
      logger.info('MongoDB connection closed');
    });
    
    return true; // Return true to indicate successful database connection
    
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('Database connection failed:', error);
      throw error;
    } else {
      logger.warn('Database connection failed in development mode. Continuing without database:', error.message);
      return false; // Return false to indicate no database connection
    }
  }
};

const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('Database disconnected successfully');
    }
  } catch (error) {
    logger.error('Error disconnecting database:', error);
    throw error;
  }
};

module.exports = { 
  connectDatabase, 
  disconnectDatabase 
};
