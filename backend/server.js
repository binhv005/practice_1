require("dotenv").config();

const http = require("http");
const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const savedProductRoutes = require("./routes/savedProductRoutes");

const initializeSocket = require("./sockets");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://practice-1-nine.vercel.app",
  "https://practice-1-osactetg2-binhv005s-projects.vercel.app",
];

// CORS configuration với wildcard cho Vercel domains
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    // Cho phép localhost và Vercel domains
    if (
      origin.includes("localhost") ||
      origin.includes("vercel.app") ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Enable gzip compression for faster response times
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between compression ratio and speed
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Increase body size limit for unlimited message length and images
app.use(express.json({ 
  limit: '50mb' // Allow up to 50MB for very long messages + base64 images
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' // Also for URL-encoded data
}));

app.use(cookieParser());

// Serve static files with proper cache headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set cache control headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
        filePath.endsWith('.png') || filePath.endsWith('.webp') || 
        filePath.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
  }
}));

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/conversations", conversationRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/saved-products", savedProductRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Donation Product Management API is running",
  });
});

const server = http.createServer(app);

const io = initializeSocket(server);

app.set("io", io);

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");

  console.log("Socket.IO is running");
});

module.exports = app;
