const express = require("express");
const cartController = require("../controllers/cartController");
const router = express.Router();

const {
  cacheResponse,
  invalidateCache,
} = require("../middlewares/cache.middleware");

const { REDIS_CACHE } = require("../constants/redis/cachPrefix");

// Add item to cart
router.post(
  "/add",
  invalidateCache(REDIS_CACHE.cart),
  cartController.addItemToCart,
);

// Get cart by user ID
router.get(
  "/:userId",
  cacheResponse(REDIS_CACHE.cart, 300),
  cartController.getCart,
);

// Remove item from cart
router.delete(
  "/remove",
  invalidateCache(REDIS_CACHE.cart),
  cartController.removeItemFromCart,
);

// Update item quantity
router.patch(
  "/update-quantity",
  invalidateCache(REDIS_CACHE.cart),
  cartController.updateItemQuantity,
);

// Apply coupon
router.post(
  "/apply-coupon",
  invalidateCache(REDIS_CACHE.cart),
  cartController.applyCoupon,
);

// Remove coupon
router.post(
  "/remove-coupon",
  invalidateCache(REDIS_CACHE.cart),
  cartController.removeCoupon,
);

module.exports = router;
