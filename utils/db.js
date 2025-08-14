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

    // Create new connection
    const conn = await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 1, // Important for serverless
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
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
