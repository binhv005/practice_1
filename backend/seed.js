require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const seedDatabase = async () => {
  try {
    // 1. Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // 2. Xóa dữ liệu cũ
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("Old data deleted");

    // 3. Tạo Users
    const users = await User.insertMany([
      {
        fullname: "Nguyễn Văn An",
        email: "an@example.com",
        role: "user",
      },
      {
        fullname: "Trần Thị Bình",
        email: "binh@example.com",
        role: "user",
      },
      {
        fullname: "Admin",
        email: "admin@example.com",
        role: "admin",
      },
    ]);

    console.log("Users created");

    // 4. Tạo Categories
    const categories = await Category.insertMany([
      {
        name: "Đồ gia dụng",
        status: "active",
      },
      {
        name: "Quần áo",
        status: "active",
      },
      {
        name: "Điện tử",
        status: "active",
      },
    ]);

    console.log("Categories created");

    // 5. Tạo Products
    await Product.insertMany([
      {
        title: "Bàn học gỗ",
        description: "Bàn học bằng gỗ còn sử dụng tốt, phù hợp cho học sinh.",
        images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"],
        category: categories[0]._id,
        giver: users[0]._id,
        receiver: null,
        status: "giving",
        featured: true,
        interestCount: 25,
        address: {
          province: "TP.HCM",
          district: "Gò Vấp",
        },
      },

      {
        title: "Áo khoác mùa đông",
        description: "Áo khoác còn mới, phù hợp với người có nhu cầu sử dụng.",
        images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"],
        category: categories[1]._id,
        giver: users[1]._id,
        receiver: null,
        status: "giving",
        featured: false,
        interestCount: 12,
        address: {
          province: "TP.HCM",
          district: "Tân Bình",
        },
      },

      {
        title: "Tai nghe Bluetooth",
        description: "Tai nghe Bluetooth hoạt động bình thường, còn hộp.",
        images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"],
        category: categories[2]._id,
        giver: users[0]._id,
        receiver: null,
        status: "giving",
        featured: true,
        interestCount: 30,
        address: {
          province: "TP.HCM",
          district: "Quận 1",
        },
      },

      {
        title: "Nồi cơm điện",
        description: "Nồi cơm điện gia đình, vẫn sử dụng tốt.",
        images: [],
        category: categories[0]._id,
        giver: users[1]._id,
        receiver: null,
        status: "giving",
        featured: false,
        interestCount: 5,
        address: {
          province: "TP.HCM",
          district: "Quận 3",
        },
      },

      {
        title: "Quần jean nam",
        description: "Quần jean nam size M, còn khá mới.",
        images: [],
        category: categories[1]._id,
        giver: users[0]._id,
        receiver: null,
        status: "given",
        featured: false,
        interestCount: 18,
        address: {
          province: "TP.HCM",
          district: "Bình Thạnh",
        },
      },

      {
        title: "Chuột máy tính",
        description: "Chuột máy tính có dây, hoạt động tốt.",
        images: [],
        category: categories[2]._id,
        giver: users[1]._id,
        receiver: null,
        status: "processing",
        featured: false,
        interestCount: 8,
        address: {
          province: "TP.HCM",
          district: "Thủ Đức",
        },
      },

      {
        title: "Kệ sách",
        description: "Kệ sách gỗ nhỏ, thích hợp cho phòng học.",
        images: [],
        category: categories[0]._id,
        giver: users[0]._id,
        receiver: null,
        status: "hidden",
        featured: false,
        interestCount: 0,
        address: {
          province: "TP.HCM",
          district: "Phú Nhuận",
        },
      },

      {
        title: "Áo sơ mi trắng",
        description: "Áo sơ mi trắng dành cho nam, size L.",
        images: [],
        category: categories[1]._id,
        giver: users[1]._id,
        receiver: null,
        status: "giving",
        featured: false,
        interestCount: 10,
        address: {
          province: "TP.HCM",
          district: "Quận 10",
        },
      },

      {
        title: "Bàn phím cơ",
        description: "Bàn phím cơ dùng tốt, phù hợp cho học tập và làm việc.",
        images: [],
        category: categories[2]._id,
        giver: users[0]._id,
        receiver: null,
        status: "given",
        featured: true,
        interestCount: 40,
        address: {
          province: "TP.HCM",
          district: "Quận 7",
        },
      },

      {
        title: "Quạt điện",
        description: "Quạt điện gia đình, hoạt động bình thường.",
        images: [],
        category: categories[0]._id,
        giver: users[1]._id,
        receiver: null,
        status: "giving",
        featured: false,
        interestCount: 3,
        address: {
          province: "TP.HCM",
          district: "Tân Phú",
        },
      },
    ]);

    console.log("Products created");

    console.log("Seed completed successfully");

    // 6. Đóng kết nối
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDatabase();
