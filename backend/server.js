require("dotenv").config();

const http = require("http");
const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

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
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
