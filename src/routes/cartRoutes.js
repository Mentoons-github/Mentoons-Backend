const express = require("express");
const cartController = require("../controllers/cartController");
const router = express.Router();

// Add item to cart
router.post("/add", cartController.addItemToCart);

// Get cart by user ID
router.get("/:userId", cartController.getCart);

// Remove item from cart
router.delete("/remove", cartController.removeItemFromCart);

// Update item quantity in cart
router.patch("/update-quantity", cartController.updateItemQuantity);

// Apply coupon to cart
router.post("/apply-coupon", cartController.applyCoupon);

// Remove coupon from cart
router.post("/remove-coupon", cartController.removeCoupon);

module.exports = router;
