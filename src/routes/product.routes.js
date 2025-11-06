const express = require("express");
const {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  getAllProducts,
  globalSearch,
  deleteProductImage,
} = require("../controllers/product.controller");
const { addaConditionalAuth } = require("../middlewares/adda/conditionalAuth");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const { conditionalAuth } = require("../middlewares/auth.middleware");
const { verifyAdmin } = require("../middlewares/admin/adminAuth");

const router = express.Router();

router.get("/", getProducts);
// POST /api/products -> create a new product
router.post("/", verifyAdmin, createProduct);

// GET /api/products -> list with search, sort, pagination

router.get("/search", addaConditionalAuth, globalSearch);

router.get("/all", getAllProducts);

// GET /api/products/:id -> fetch a single product by id
router.get("/:id", getProductById);

// PUT /api/products/:id -> update a product
router.put("/:id", verifyAdmin, updateProduct);

// DELETE /api/products/:id -> delete a product
router.delete("/:id", verifyAdmin, deleteProduct);

router.delete(
  "/image/:imageId",
  adminAuthMiddleware.adminAuthMiddleware,
  deleteProductImage
);
router.delete("/remove-file", adminAuthMiddleware.adminAuthMiddleware);

module.exports = router;
