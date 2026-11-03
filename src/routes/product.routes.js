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
const {
  cacheResponse,
  invalidateCache,
} = require("../middlewares/cache.middleware");
const { REDIS_CACHE } = require("../constants/redis/cachPrefix");

const router = express.Router();

router.get("/", cacheResponse(REDIS_CACHE.products, 300), getProducts);

router.post(
  "/",
  verifyAdmin,
  invalidateCache(REDIS_CACHE.products),
  createProduct,
);

router.get("/search", addaConditionalAuth, globalSearch);

router.get("/all", cacheResponse(REDIS_CACHE.products, 300), getAllProducts);

router.get("/:id", cacheResponse(REDIS_CACHE.products, 600), getProductById);

router.put(
  "/:id",
  verifyAdmin,
  invalidateCache(REDIS_CACHE.products),
  updateProduct,
);

router.delete(
  "/:id",
  verifyAdmin,
  invalidateCache(REDIS_CACHE.products),
  deleteProduct,
);

router.delete(
  "/image/:imageId",
  adminAuthMiddleware.adminAuthMiddleware,
  invalidateCache(REDIS_CACHE.products),
  deleteProductImage,
);
router.delete("/remove-file", adminAuthMiddleware.adminAuthMiddleware);

module.exports = router;
