const app = require("./server");
const { connectDB } = require("./utils/db");

// Initialize database connection for Vercel
let isConnected = false;

const initDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("Database initialized for Vercel serverless function");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Don't throw error, let the function continue
    }
  }
};

// Initialize database when the function is first invoked
initDB();

// Vercel serverless function handler
module.exports = app;
