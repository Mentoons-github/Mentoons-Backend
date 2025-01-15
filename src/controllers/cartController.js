const Cart = require("../models/cart");
const cartHelper = require("../helpers/cartHelper");

exports.addItemToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, price } = req.body;
    const cart = await cartHelper.addItem(userId, productId, quantity, price);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await cartHelper.removeItem(userId, productId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.auth;
    const cart = await cartHelper.getCart(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};