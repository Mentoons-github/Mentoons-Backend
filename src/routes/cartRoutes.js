const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");


// Add item to cart
router.post("/add", cartController.addItemToCart);

// Update item in cart
router.patch("/update/:productId", cartController.updateCartItem);

// Remove item from cart
router.delete("/remove/:userId/:productId", cartController.removeItemFromCart);

// Get cart
router.get("/:userId", cartController.getCart);

module.exports = router;
