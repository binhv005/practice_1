require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// =========================
// DATABASE
// =========================

connectDB();

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// =========================
// BODY PARSER
// =========================

app.use(express.json());

// =========================
// STATIC UPLOADS
// =========================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// ROUTES
// =========================

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

// =========================
// TEST API
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Donation Product Management API is running",
  });
});

// =========================
// SERVER
// =========================

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});

module.exports = app;
