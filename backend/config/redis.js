const redis = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    // Tạo Redis client
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log("❌ Redis: Too many reconnection attempts");
            return new Error("Redis reconnection failed");
          }
          return retries * 1000; // Retry after retries * 1000ms
        },
      },
    });

    // Event listeners
    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("🔄 Redis: Connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis: Connected successfully");
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Redis: Reconnecting...");
    });

    redisClient.on("end", () => {
      console.log("⚠️ Redis: Connection closed");
    });

    // Connect
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error("❌ Redis Connection Error:", error.message);
    console.log("⚠️ Running without Redis (OTP features will use fallback)");
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log("✅ Redis connection closed");
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis,
};
