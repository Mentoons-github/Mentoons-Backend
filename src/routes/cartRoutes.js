
const express = require("express");
const router = express.Router();
const cartHelper = require("../helpers/cartHelper");

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity, price } = req.body;
    const cart = await cartHelper.addItem(userId, productId, quantity, price);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.post("/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await cartHelper.removeItem(userId, productId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await cartHelper.getCart(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;