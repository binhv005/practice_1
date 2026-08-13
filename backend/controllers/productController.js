const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

const { processProductImage } = require("../services/imageService");

const HO_CHI_MINH_WARDS = require("../constants/hoChiMinhWards");

const HCM_PROVINCE = "Thành phố Hồ Chí Minh";

const ALLOWED_STATUSES = ["giving", "processing", "given", "hidden"];

// GET PRODUCTS

const getProducts = async (req, res) => {
  try {
    const { keyword, category, status, ward } = req.query;

    const filter = {};

    // KEYWORD

    if (keyword && keyword.trim()) {
      const searchKeyword = keyword.trim();

      filter.$or = [
        {
          title: {
            $regex: searchKeyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchKeyword,
            $options: "i",
          },
        },
      ];
    }

    // CATEGORY

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Category ID không hợp lệ",
        });
      }

      filter.category = category;
    }

    // =========================
    // STATUS
    // =========================

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status không hợp lệ",
        });
      }

      filter.status = status;
    }

    // =========================
    // WARD
    // =========================

    if (ward && ward.trim()) {
      const selectedWard = ward.trim();

      if (!HO_CHI_MINH_WARDS.includes(selectedWard)) {
        return res.status(400).json({
          success: false,
          message: "Phường không hợp lệ",
        });
      }

      filter["address.ward"] = selectedWard;
    }

    // =========================
    // GET PRODUCTS
    // =========================

    const products = await Product.find(filter)
      .populate("category")
      .populate("giver")
      .sort({
        featured: -1,
        publishAt: -1,
      });

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

// ======================================================
// GET PRODUCT BY ID
// ======================================================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================
    // VALIDATE ID
    // =========================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // =========================
    // FIND PRODUCT
    // =========================

    const product = await Product.findById(id)
      .populate("category")
      .populate("giver")
      .populate("receiver");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin sản phẩm",
    });
  }
};

// ======================================================
// CREATE PRODUCT
// ======================================================

const createProduct = async (req, res) => {
  try {
    const { title, description, images, category, address } = req.body;

    // =========================
    // TITLE
    // =========================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm không được để trống",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm không được vượt quá 200 ký tự",
      });
    }

    // =========================
    // DESCRIPTION
    // =========================

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mô tả sản phẩm không được để trống",
      });
    }

    if (description.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Mô tả sản phẩm không được vượt quá 5000 ký tự",
      });
    }

    // =========================
    // CATEGORY
    // =========================

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

    // =========================
    // IMAGES
    // =========================

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "images phải là một mảng",
        });
      }

      if (images.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Sản phẩm chỉ được tối đa 10 ảnh",
        });
      }
    }

    // =========================
    // ADDRESS
    // =========================

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ",
      });
    }

    if (!address.ward || !address.ward.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn phường",
      });
    }

    const ward = address.ward.trim();

    // =========================
    // VALIDATE WARD
    // =========================

    if (!HO_CHI_MINH_WARDS.includes(ward)) {
      return res.status(400).json({
        success: false,
        message: "Phường không hợp lệ",
      });
    }

    // =========================
    // GIVER
    // =========================

    const giverId = process.env.ADMIN_ID;

    if (!giverId || !mongoose.Types.ObjectId.isValid(giverId)) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_ID chưa được cấu hình hoặc không hợp lệ",
      });
    }

    const giverExists = await User.findById(giverId);

    if (!giverExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người đăng sản phẩm",
      });
    }

    // =========================
    // CREATE
    // =========================

    const product = await Product.create({
      title: title.trim(),

      description: description.trim(),

      images: images || [],

      category,

      giver: giverId,

      status: "giving",

      featured: false,

      address: {
        province: HCM_PROVINCE,
        ward,
      },

      publishAt: new Date(),

      lastInteractionAt: new Date(),
    });

    // =========================
    // POPULATE
    // =========================

    await product.populate("category");
    await product.populate("giver");

    // =========================
    // RESPONSE
    // =========================

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

// ======================================================
// UPDATE PRODUCT
// ======================================================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================
    // VALIDATE ID
    // =========================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // =========================
    // FIND PRODUCT
    // =========================

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // =========================
    // ADMIN
    // =========================

    const adminId = process.env.ADMIN_ID;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_ID chưa được cấu hình hoặc không hợp lệ",
      });
    }

    // =========================
    // BEFORE
    // =========================

    const before = {
      title: product.title,
      description: product.description,
      images: [...product.images],
      category: product.category,
      status: product.status,
      featured: product.featured,
      address: {
        province: product.address?.province,
        ward: product.address?.ward,
      },
    };

    // =========================
    // REQUEST DATA
    // =========================

    const { title, description, images, category, status, featured, address } =
      req.body;

    // =========================
    // TITLE
    // =========================

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tên sản phẩm không được để trống",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Tên sản phẩm không được vượt quá 200 ký tự",
        });
      }

      product.title = title.trim();
    }

    // =========================
    // DESCRIPTION
    // =========================

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Mô tả sản phẩm không được để trống",
        });
      }

      if (description.trim().length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Mô tả sản phẩm không được vượt quá 5000 ký tự",
        });
      }

      product.description = description.trim();
    }

    // =========================
    // CATEGORY
    // =========================

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

      product.category = category;
    }

    // =========================
    // STATUS
    // =========================

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status không hợp lệ",
        });
      }

      if (status === "hidden" && product.status === "processing") {
        return res.status(400).json({
          success: false,
          message:
            "Sản phẩm đang có giao dịch phát sinh, không thể ẩn trực tiếp",
        });
      }

      product.status = status;
    }

    // =========================
    // FEATURED
    // =========================

    if (featured !== undefined) {
      if (typeof featured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "featured phải là boolean",
        });
      }

      // Không cho sản phẩm hidden được featured
      if (featured === true && product.status === "hidden") {
        return res.status(400).json({
          success: false,
          message: "Không thể đặt nổi bật cho sản phẩm đã ẩn",
        });
      }

      product.featured = featured;
    }

    // =========================
    // IMAGES
    // =========================

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "images phải là một mảng",
        });
      }

      if (images.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Sản phẩm chỉ được tối đa 10 ảnh",
        });
      }

      product.images = images;
    }

    // =========================
    // ADDRESS
    // =========================

    if (address !== undefined) {
      if (!address.ward || !address.ward.trim()) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn phường",
        });
      }

      const ward = address.ward.trim();

      if (!HO_CHI_MINH_WARDS.includes(ward)) {
        return res.status(400).json({
          success: false,
          message: "Phường không hợp lệ",
        });
      }

      product.address = {
        province: HCM_PROVINCE,
        ward,
      };
    }

    // =========================
    // SAVE
    // =========================

    const updatedProduct = await product.save();

    // =========================
    // AFTER
    // =========================

    const after = {
      title: updatedProduct.title,
      description: updatedProduct.description,
      images: [...updatedProduct.images],
      category: updatedProduct.category,
      status: updatedProduct.status,
      featured: updatedProduct.featured,
      address: {
        province: updatedProduct.address?.province,
        ward: updatedProduct.address?.ward,
      },
    };

    let action = "UPDATE_PRODUCT";

    if (status === "hidden" && before.status !== "hidden") {
      action = "HIDE_PRODUCT";
    }

    if (
      category !== undefined &&
      category.toString() !== before.category.toString()
    ) {
      action = "CHANGE_CATEGORY";
    }

    await AuditLog.create({
      adminId,
      productId: updatedProduct._id,
      action,
      before,
      after,
    });

    await Notification.create({
      receiver_id: updatedProduct.giver,

      title:
        action === "HIDE_PRODUCT"
          ? "Sản phẩm đã bị ẩn"
          : "Sản phẩm đã được cập nhật",

      content:
        action === "HIDE_PRODUCT"
          ? `Sản phẩm "${updatedProduct.title}" đã được ẩn bởi quản trị viên.`
          : `Sản phẩm "${updatedProduct.title}" đã được quản trị viên cập nhật.`,

      type: action === "HIDE_PRODUCT" ? "PRODUCT_HIDDEN" : "PRODUCT_UPDATED",
    });

    await updatedProduct.populate("category");
    await updatedProduct.populate("giver");

    return res.status(200).json({
      success: true,

      message:
        action === "HIDE_PRODUCT"
          ? "Ẩn sản phẩm thành công, thông báo đã được gửi cho chủ bài viết"
          : "Cập nhật thành công, thông báo đã được gửi cho chủ bài viết",

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

    return res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",

      data: {
        imageUrl,
      },
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    return res.status(500).json({
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

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Chỉ được upload tối đa 10 ảnh",
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
