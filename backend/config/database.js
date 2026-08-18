const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Determine pool size based on environment
    const isProd = process.env.NODE_ENV === 'production';
    
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pooling for better performance
      // Increased pool size for production to handle more concurrent requests
      maxPoolSize: isProd ? 20 : 10, // More connections in production
      minPoolSize: isProd ? 5 : 2,   // Keep more idle connections ready in production
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      // Additional optimizations
      compressors: ['zlib'], // Enable compression for network traffic
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
    });
    
    console.log(`MongoDB connected successfully with optimized connection pool (${isProd ? 'Production' : 'Development'} mode)`);
    console.log(`Pool size: ${isProd ? '20' : '10'} max, ${isProd ? '5' : '2'} min`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
