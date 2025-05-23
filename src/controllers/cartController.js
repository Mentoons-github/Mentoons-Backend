const cartHelper = require("../helpers/cartHelper");

/**
 * Get cart by user ID
 */
const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const cart = await cartHelper.getCartByUserId(userId);

    return res.status(200).json(cart);
  } catch (error) {
    return error;
  }
};

/**
 * Add item to cart
 */
const addItemToCart = async (req, res) => {
  console.log("Request body:", req.body);

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
      productDetails,
    } = req.body;

    if (
      !userId ||
      !productId ||
      !productType ||
      !title ||
      !quantity ||
      !price
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cart = await cartHelper.addItemToCart({
      userId,
      productId,
      productType,
      title,
      quantity,
      price,
      ageCategory,
      productImage,
      productDetails,
    });

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove item from cart
 */
const removeItemFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and product ID are required",
      });
    }

    const cart = await cartHelper.removeItemFromCart(userId, productId);

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update item quantity in cart
 */
const updateItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log(quantity);

    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cart = await cartHelper.updateItemQuantity(
      userId,
      productId,
      quantity
    );

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Apply coupon to cart
 */
const applyCoupon = async (req, res) => {
  try {
    const { userId, couponCode } = req.body;

    if (!userId || !couponCode) {
      return res.status(400).json({
        success: false,
        message: "User ID and coupon code are required",
      });
    }

    const cart = await cartHelper.applyCoupon(userId, couponCode);

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove coupon from cart
 */
const removeCoupon = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const cart = await cartHelper.removeCoupon(userId);

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  applyCoupon,
  removeCoupon,
};
