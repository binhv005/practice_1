const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  uploadProductImages,
} = require("../controllers/productController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =========================
// GET PRODUCTS
// =========================

router.get("/", getProducts);

// =========================
// UPLOAD MULTIPLE IMAGES
// =========================

router.post("/upload-images", upload.array("images", 10), uploadProductImages);

// =========================
// UPLOAD SINGLE IMAGE
// =========================

router.post("/upload-image", upload.single("image"), uploadProductImage);

// =========================
// CREATE PRODUCT
// =========================

router.post("/", createProduct);

// =========================
// GET PRODUCT BY ID
// =========================

router.get("/:id", getProductById);

// =========================
// UPDATE PRODUCT
// =========================

router.put("/:id", updateProduct);

module.exports = router;
