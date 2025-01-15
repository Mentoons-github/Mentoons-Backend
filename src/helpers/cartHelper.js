const Cart = require("../models/cart");

exports.addItem = async (userId, productId, quantity, price) => {
  let cart = await Cart.findOne({ userId, status: "active" });
  if (!cart) {
    cart = new Cart({ userId, items: [], totalPrice: 0 });
  }
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].price += price * quantity;
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
  } else {
    if (quantity > 0) {
      cart.items.push({ productId, quantity, price: price * quantity });
    }
  }
  cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
  await cart.save();
  return cart;
};

exports.removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ userId, status: "active" });
  if (!cart) throw new Error("Cart not found");
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    const item = cart.items[itemIndex];
    cart.totalPrice -= item.price * item.quantity;
    cart.items.splice(itemIndex, 1);
    await cart.save();
  }
  return cart;
};

exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ userId, status: "active" }).populate("items.productId");
  if (!cart) throw new Error("Cart not found");
  return cart;
};