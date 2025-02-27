const express = require("express");
const {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} = require("../controllers/product.controller");

const router = express.Router();

// POST /api/products -> create a new product
router.post("/", createProduct);

// GET /api/products -> list with search, sort, pagination
router.get("/", getProducts);

// GET /api/products/:id -> fetch a single product by id
router.get("/:id", getProductById);

// PUT /api/products/:id -> update a product
router.put("/:id", updateProduct);

// DELETE /api/products/:id -> delete a product
router.delete("/:id", deleteProduct);

module.exports = router;
