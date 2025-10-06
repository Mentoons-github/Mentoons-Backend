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

const router = express.Router();

router.get("/", adminAuthMiddleware.optionalAdminMiddleware, getProducts);
// POST /api/products -> create a new product
router.post("/", createProduct);

// GET /api/products -> list with search, sort, pagination

router.get("/search", addaConditionalAuth, globalSearch);

router.get("/all", getAllProducts);

// GET /api/products/:id -> fetch a single product by id
router.get("/:id", getProductById);

// PUT /api/products/:id -> update a product
router.put("/:id", updateProduct);

// DELETE /api/products/:id -> delete a product
router.delete("/:id", deleteProduct);

router.delete(
  "/image/:imageId",
  adminAuthMiddleware.adminAuthMiddleware,
  deleteProductImage
);
router.delete("/remove-file", adminAuthMiddleware.adminAuthMiddleware);

module.exports = router;
