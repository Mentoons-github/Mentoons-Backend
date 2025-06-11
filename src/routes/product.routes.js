const express = require("express");
const {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  getAllProducts,
  globalSearch,
} = require("../controllers/product.controller");
const { conditionalAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getProducts);
// POST /api/products -> create a new product
router.post("/", createProduct);

// GET /api/products -> list with search, sort, pagination

router.get("/search", conditionalAuth, globalSearch);

router.get("/all", getAllProducts);

// GET /api/products/:id -> fetch a single product by id
router.get("/:id", getProductById);

// PUT /api/products/:id -> update a product
router.put("/:id", updateProduct);

// DELETE /api/products/:id -> delete a product
router.delete("/:id", deleteProduct);

module.exports = router;
