const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const { processProductImage } = require("../services/imageService");

const getProducts = async (req, res) => {
  try {
    const { keyword, category, status, province } = req.query;

    const filter = {};

    // TÌM KIẾM THEO TÊN + MÔ TẢ
    if (keyword && keyword.trim()) {
      filter.$or = [
        {
          title: {
            $regex: keyword.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Filter category
    if (category) {
      filter.category = category;
    }

    // Filter status
    if (status) {
      filter.status = status;
    }

    // Filter province
    if (province && province.trim()) {
      filter["address.province"] = {
        $regex: province.trim(),
        $options: "i",
      };
    }

    const products = await Product.find(filter)
      .populate("category")
      .populate("giver")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await Product.findById(id)
      .populate("category")
      .populate("giver");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product by id error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin sản phẩm",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, images, category, address } = req.body;

    // 1. VALIDATE TITLE
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm không được để trống",
      });
    }

    // 2. VALIDATE DESCRIPTION
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mô tả sản phẩm không được để trống",
      });
    }

    // 3. VALIDATE CATEGORY
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn danh mục",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Category ID không hợp lệ",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    if (categoryExists.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Không thể sử dụng danh mục inactive",
      });
    }

    // 4. VALIDATE IMAGES
    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "images phải là một mảng",
      });
    }

    // 5. VALIDATE ADDRESS
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ",
      });
    }

    if (!address.province || !address.province.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tỉnh / thành phố không được để trống",
      });
    }

    if (!address.district || !address.district.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quận / huyện không được để trống",
      });
    }

    // 6. LẤY GIVER
    const giverId = process.env.ADMIN_ID;

    if (!giverId || !mongoose.Types.ObjectId.isValid(giverId)) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_ID chưa được cấu hình hoặc không hợp lệ",
      });
    }

    // Kiểm tra user tồn tại
    const giverExists = await User.findById(giverId);

    if (!giverExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người đăng sản phẩm",
      });
    }

    // 7. CREATE PRODUCT
    const product = await Product.create({
      title: title.trim(),

      description: description.trim(),

      images: images || [],

      category,

      giver: giverId,

      status: "giving",

      featured: false,

      address: {
        province: address.province.trim(),
        district: address.district.trim(),
      },
    });

    // 8. POPULATE
    await product.populate("category");
    await product.populate("giver");

    // 9. RESPONSE
    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    // 1. Lấy Product ID

    const { id } = req.params;

    // Kiểm tra ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // 2. Tìm Product

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // 3. Xác định Admin

    const adminId = process.env.ADMIN_ID;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_ID chưa được cấu hình hoặc không hợp lệ",
      });
    }

    // 4. Lưu dữ liệu BEFORE

    const before = {
      title: product.title,
      description: product.description,
      images: [...product.images],
      category: product.category,
      status: product.status,
      featured: product.featured,
      address: product.address,
    };

    // 5. Lấy dữ liệu từ request

    const { title, description, images, category, status, featured, address } =
      req.body;

    // 6. Kiểm tra Category

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Category ID không hợp lệ",
        });
      }

      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }

      if (categoryExists.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Không thể chuyển sản phẩm sang danh mục đang inactive",
        });
      }
    }

    // 7. Kiểm tra status

    const allowedStatuses = ["giving", "processing", "given", "hidden"];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status không hợp lệ",
      });
    }

    // 8. Không cho ẩn sản phẩm đang giao dịch

    if (status === "hidden" && product.status === "processing") {
      return res.status(400).json({
        success: false,
        message:
          "Sản phẩm đang có giao dịch phát sinh, không thể xóa trực tiếp",
      });
    }

    // 9. Kiểm tra images

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "images phải là một mảng",
        });
      }

      product.images = images;
    }

    // 10. Update các field

    if (title !== undefined) {
      product.title = title;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (status !== undefined) {
      product.status = status;
    }

    if (featured !== undefined) {
      product.featured = featured;
    }

    if (address !== undefined) {
      product.address = address;
    }

    // 11. Lưu Product

    const updatedProduct = await product.save();

    // 12. Lưu dữ liệu AFTER

    const after = {
      title: updatedProduct.title,
      description: updatedProduct.description,
      images: [...updatedProduct.images],
      category: updatedProduct.category,
      status: updatedProduct.status,
      featured: updatedProduct.featured,
      address: updatedProduct.address,
    };

    // 13. Xác định action

    let action = "UPDATE_PRODUCT";

    if (status === "hidden") {
      action = "HIDE_PRODUCT";
    }

    if (
      category !== undefined &&
      category.toString() !== before.category.toString()
    ) {
      action = "CHANGE_CATEGORY";
    }

    // 14. Ghi AuditLog

    await AuditLog.create({
      adminId: adminId,
      productId: updatedProduct._id,
      action,
      before,
      after,
    });

    // 15. Tạo Notification

    await Notification.create({
      receiver_id: updatedProduct.giver,
      title: "Sản phẩm đã được cập nhật",

      content:
        status === "hidden"
          ? `Sản phẩm "${updatedProduct.title}" đã được ẩn bởi quản trị viên.`
          : `Sản phẩm "${updatedProduct.title}" đã được quản trị viên cập nhật.`,

      type: status === "hidden" ? "PRODUCT_HIDDEN" : "PRODUCT_UPDATED",
    });

    // 16. Populate

    await updatedProduct.populate("category");
    await updatedProduct.populate("giver");

    // 17. Response

    return res.status(200).json({
      success: true,

      message: "Cập nhật thành công, thông báo đã được gửi cho chủ bài viết",

      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm",
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh",
      });
    }

    const imageUrl = await processProductImage(req.file);

    res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xử lý ảnh",
    });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một ảnh",
      });
    }

    const imageUrls = [];

    for (const file of req.files) {
      const imageUrl = await processProductImage(file);

      imageUrls.push(imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",
      data: {
        imageUrls,
      },
    });
  } catch (error) {
    console.error("Upload product images error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xử lý ảnh",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  uploadProductImages,
};
