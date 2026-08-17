const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

/**
 * Lưu sản phẩm
 * POST /api/saved-products/:productId
 */
const saveProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // Thêm sản phẩm vào danh sách đã lưu
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { savedProducts: productId },
      },
      { new: true },
    ).select("savedProducts");

    return res.status(200).json({
      success: true,
      message: "Đã lưu sản phẩm",
      savedProducts: user.savedProducts,
    });
  } catch (error) {
    console.error("Save product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lưu sản phẩm",
    });
  }
};

/**
 * Bỏ lưu sản phẩm
 * DELETE /api/saved-products/:productId
 */
const unsaveProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ",
      });
    }

    // Xóa sản phẩm khỏi danh sách đã lưu
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { savedProducts: productId },
      },
      { new: true },
    ).select("savedProducts");

    return res.status(200).json({
      success: true,
      message: "Đã bỏ lưu sản phẩm",
      savedProducts: user.savedProducts,
    });
  } catch (error) {
    console.error("Unsave product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể bỏ lưu sản phẩm",
    });
  }
};

/**
 * Lấy danh sách sản phẩm đã lưu
 * GET /api/saved-products
 */
const getSavedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select("savedProducts");

    if (!user || !user.savedProducts || user.savedProducts.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });
    }

    const total = user.savedProducts.length;

    // Lấy sản phẩm với pagination
    const products = await Product.find({
      _id: { $in: user.savedProducts },
      status: { $ne: "hidden" },
    })
      .populate("category", "name")
      .populate("giver", "fullname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    });
  } catch (error) {
    console.error("Get saved products error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm đã lưu",
    });
  }
};

/**
 * Kiểm tra sản phẩm đã được lưu chưa
 * GET /api/saved-products/:productId/check
 */
const checkProductSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ",
      });
    }

    const user = await User.findById(userId).select("savedProducts");

    const isSaved = user.savedProducts.some(
      (id) => id.toString() === productId,
    );

    return res.status(200).json({
      success: true,
      isSaved,
    });
  } catch (error) {
    console.error("Check product saved error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể kiểm tra trạng thái lưu",
    });
  }
};

module.exports = {
  saveProduct,
  unsaveProduct,
  getSavedProducts,
  checkProductSaved,
};
