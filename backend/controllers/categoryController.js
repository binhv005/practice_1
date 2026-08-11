const Category = require("../models/Category");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "active",
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách danh mục",
    });
  }
};

module.exports = {
  getCategories,
};
