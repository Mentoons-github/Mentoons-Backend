const Cart = require("../models/cart");
const User = require("../models/user");
const { Types, model } = require("mongoose");

exports.addItem = async (userId, productId, quantity, price) => {
  const user = await User.findOne({ clerkId: userId });

  let cart = await Cart.findOne({
    userId: user._id,
    status: "active",
  });

  if (!cart) {
    cart = new Cart({ userId: user._id, items: [], totalPrice: 0 });
  }
  const itemIndex = cart.items?.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].price += Number(price * quantity);
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items?.splice(itemIndex, 1);
    }
  } else {
    if (quantity > 0) {
      cart.items?.push({ productId, quantity, price: price * quantity });
    }
  }
  cart.totalPrice = cart.items?.reduce((total, item) => total + item.price, 0);
  cart.totalItemCount = cart.items?.reduce(
    (total, item) => total + item.quantity,
    0
  );
  await cart.save();
  return cart;
};

exports.removeItem = async (userId, productId) => {
  console.log("Inside removeItem helper");
  console.log("userId", userId);
  const user = await User.findOne({ clerkId: userId });
  if (!user) throw new Error("User not found");
  const cart = await Cart.findOne({ userId: user._id, status: "active" });
  if (!cart) throw new Error("Cart not found");
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex > -1) {
    const item = cart.items[itemIndex];
    cart.totalPrice -= item.price;
    cart.totalItemCount -= item.quantity;
    cart.items.splice(itemIndex, 1);
    await cart.save();
  }

  await cart.populate("items.productId");
  return cart;
};

exports.getCart = async (userId) => {
  const user = await User.findOne({ clerkId: userId });
  const cart = await Cart.findOne({
    userId: user._id,
    status: "active",
  }).populate("items.productId"); // removed the extra space after productId
  if (!cart) throw new Error("Cart not found");

  return cart;
};

exports.updateCartItem = async (userId, productId, flag) => {
  const paperEditionPrice = 199;
  // Find the user by their clerkId
  const user = await User.findOne({ clerkId: userId });
  if (!user) throw new Error("User not found");
  // Find the active cart for the user
  const cart = await Cart.findOne({
    userId: user._id,
    status: "active",
  });
  if (!cart) throw new Error("Cart not found");
  // Find the index of the item in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  // If the item is found, update its quantity and price
  if (itemIndex > -1) {
    const item = cart.items[itemIndex];
    console.log("Item found", item);
    if (flag === "+") {
      item.quantity += 1;
      item.price += paperEditionPrice;
      cart.totalPrice += paperEditionPrice;
      cart.totalItemCount += 1;
    } else if (flag === "-") {
      if (item.quantity > 1) {
        item.quantity -= 1;
        item.price -= paperEditionPrice;
        cart.totalPrice -= paperEditionPrice;
        cart.totalItemCount -= 1;
      }
    }
    await cart.save();
  } else {
    throw new Error("Item not found in the cart");
  }
  // Populate the cart with the product details
  await cart.populate("items.productId");
  return cart;
};
