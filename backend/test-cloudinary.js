require("dotenv").config();

const fs = require("fs");
const cloudinary = require("./config/cloudinary");

const uploadTest = async () => {
  try {
    const result = await cloudinary.uploader.upload("./test-image.jpg", {
      folder: "practice1/test",
    });

    console.log("Upload thành công!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  } catch (error) {
    console.error("Upload thất bại:", error);
  }
};

uploadTest();
