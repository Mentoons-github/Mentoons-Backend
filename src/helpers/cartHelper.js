const Cart = require("../models/cart");
const { Product } = require("../models/product");
// const Coupon = require("../models/Coupon"); // Assuming you have a Coupon model

/**
 * Get cart by user ID
 */
const getCartByUserId = async (userId) => {
  try {
    let cart = await Cart.findOne({ userId, cartStatus: "active" });

    if (!cart) {
      // Create a new cart if none exists
      cart = await Cart.create({
        userId,
        items: [],
        totalPrice: 0,
        totalItemCount: 0,
        cartStatus: "active",
        discountedPrice: 0,
      });
    }

    return cart;
  } catch (error) {
    throw new Error(`Error fetching cart: ${error.message}`);
  }
};

/**
 * Add item to cart
 */
const addItemToCart = async (itemData) => {
  console.log("itemData", itemData);
  try {
    const {
      userId,
      productId,
      productType,
      title,
      quantity,
      price,
      ageCategory,
      productImage,
      cardType,
      productDetails,
    } = itemData;

    // Find or create cart
    let cart = await Cart.findOne({ userId, cartStatus: "active" });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        totalPrice: 0,
        totalItemCount: 0,
        cartStatus: "active",
        discountedPrice: 0,
      });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        productId,
        productType,
        title,
        quantity,
        price,
        ageCategory,
        productImage,
        cardType,
        productDetails,
      };
      cart.items.push(newItem);
    }

    // Recalculate cart totals
    await recalculateCartTotals(cart);

    // Save and return cart
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Error adding item to cart: ${error.message}`);
  }
};

/**
 * Remove item from cart
 */
const removeItemFromCart = async (userId, productId) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ userId, cartStatus: "active" });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate cart totals
    await recalculateCartTotals(cart);

    // Save and return cart
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Error removing item from cart: ${error.message}`);
  }
};

/**
 * Update item quantity in cart
 */
const updateItemQuantity = async (userId, productId, quantity) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ userId, cartStatus: "active" });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Remove item if quantity is 0
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate cart totals
    await recalculateCartTotals(cart);

    // Save and return cart
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Error updating item quantity: ${error.message}`);
  }
};

/**
 * Apply coupon to cart
 */
// exports.applyCoupon = async (userId, couponCode) => {
//   try {
//     // Find cart
//     const cart = await Cart.findOne({ userId, cartStatus: "active" });

//     if (!cart) {
//       throw new Error("Cart not found");
//     }

//     // Find coupon
//     const coupon = await Coupon.findOne({
//       code: couponCode,
//       isActive: true,
//       expiryDate: { $gte: new Date() },
//     });

//     if (!coupon) {
//       throw new Error("Invalid or expired coupon");
//     }

//     // Apply coupon
//     cart.appliedCoupon = {
//       code: coupon.code,
//       discountAmount: coupon.discountAmount,
//       discountType: coupon.discountType,
//     };

//     // Recalculate cart totals with discount
//     await recalculateCartTotals(cart);

//     // Save and return cart
//     await cart.save();
//     return cart;
//   } catch (error) {
//     throw new Error(`Error applying coupon: ${error.message}`);
//   }
// };

/**
 * Remove coupon from cart
 */
// exports.removeCoupon = async (userId) => {
//   try {
//     // Find cart
//     const cart = await Cart.findOne({ userId, cartStatus: "active" });

//     if (!cart) {
//       throw new Error("Cart not found");
//     }

//     // Remove coupon
//     cart.appliedCoupon = undefined;

//     // Recalculate cart totals
//     await recalculateCartTotals(cart);

//     // Save and return cart
//     await cart.save();
//     return cart;
//   } catch (error) {
//     throw new Error(`Error removing coupon: ${error.message}`);
//   }
// };

/**
 * Helper function to recalculate cart totals
 */
async function recalculateCartTotals(cart) {
  // Calculate total item count and price
  let totalItemCount = 0;
  let totalPrice = 0;

  for (const item of cart.items) {
    totalItemCount += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  cart.totalItemCount = totalItemCount;
  cart.totalPrice = totalPrice;

  // Apply discount if coupon is applied
  if (cart.appliedCoupon) {
    if (cart.appliedCoupon.discountType === "percentage") {
      const discountAmount =
        (cart.totalPrice * cart.appliedCoupon.discountAmount) / 100;
      cart.discountedPrice = cart.totalPrice - discountAmount;
    } else if (cart.appliedCoupon.discountType === "fixed") {
      cart.discountedPrice = Math.max(
        0,
        cart.totalPrice - cart.appliedCoupon.discountAmount
      );
    }
  } else {
    cart.discountedPrice = cart.totalPrice;
  }

  return cart;
}

module.exports = {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  // applyCoupon,
  // removeCoupon,
};
