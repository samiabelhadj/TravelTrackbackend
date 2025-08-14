const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  try {
    // If we already have a connection, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // If we have a cached connection but it's not ready, close it
    if (cachedConnection) {
      await mongoose.connection.close();
      cachedConnection = null;
    }

    // Create new connection with better timeout settings for serverless
    const conn = await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        socketTimeoutMS: 45000, // 45 second timeout
        maxPoolSize: 1, // Important for serverless
        minPoolSize: 0, // Allow 0 connections when idle
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
        connectTimeoutMS: 10000, // 10 second connection timeout
        heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
      }
    );

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Middleware to ensure database connection
const withDB = (handler) => {
  return async (req, res, next) => {
    try {
      await connectDB();
      return handler(req, res, next);
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

module.exports = { connectDB, withDB };
