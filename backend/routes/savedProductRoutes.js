const express = require("express");
const {
  saveProduct,
  unsaveProduct,
  getSavedProducts,
  checkProductSaved,
} = require("../controllers/savedProductController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// GET /api/saved-products - Lấy danh sách sản phẩm đã lưu
router.get("/", getSavedProducts);

// GET /api/saved-products/:productId/check - Kiểm tra đã lưu chưa
router.get("/:productId/check", checkProductSaved);

// POST /api/saved-products/:productId - Lưu sản phẩm
router.post("/:productId", saveProduct);

// DELETE /api/saved-products/:productId - Bỏ lưu sản phẩm
router.delete("/:productId", unsaveProduct);

module.exports = router;
