require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("./models/Category");

const categories = [
  { name: "Điện thoại", status: "active" },
  { name: "Laptop", status: "active" },
  { name: "Đồ điện tử", status: "active" },
  { name: "Đồ gia dụng", status: "active" },
  { name: "Thời trang", status: "active" },
  { name: "Sách", status: "active" },
  { name: "Đồ dùng học tập", status: "active" },
  { name: "Khác", status: "active" },
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Check existing categories
    const existingCount = await Category.countDocuments();
    console.log(`Existing categories: ${existingCount}`);

    if (existingCount === 0) {
      // Insert categories
      await Category.insertMany(categories);
      console.log(`✅ ${categories.length} categories created successfully!`);
    } else {
      console.log("ℹ️  Categories already exist. Skipping...");
    }

    // Disconnect
    await mongoose.disconnect();
    console.log("MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
