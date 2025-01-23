const Cart = require("../models/cart");
const cartHelper = require("../helpers/cartHelper");

const addItemToCart = async (req, res) => {
  console.log("Inside AddItem controller");
  console.log("Request Body", req.body);
  try {
    const { userId, productId, quantity, price } = req.body;
    const cart = await cartHelper.addItem(userId, productId, quantity, price);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  console.log("Inside RemoveItem controller");
  console.log("Request Body", req.body);
  console.log("Request Params", req.params);
  try {
    const { userId } = req.params;
    const { productId } = req.params;
    const cart = await cartHelper.removeItem(userId, productId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await cartHelper.getCart(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    console.log("Inside UpdateItem controller");
    console.log("Request Body", req.body);
    const { userId, flag } = req.body;
    const { productId } = req.params;
    const cart = await cartHelper.updateCartItem(userId, productId, flag);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addItemToCart,
  removeItemFromCart,
  updateCartItem,
  getCart,
};
