const Orders = require("../models/Order");
const review = require("../models/review");

const getOrdersHistory = async (req, res) => {
  const userId = req.user;

  try {
    const orders = await Orders.find({
      user: userId,
      status: { $regex: /^success$/i },
    })
      .sort({ purchaseDate: -1 })
      .populate("items.product");

    console.log("orders :", orders[0].items);

    const groupedOrders = {};

    for (const order of orders) {
      const dateKey = new Date(order.purchaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groupedOrders[dateKey]) {
        groupedOrders[dateKey] = [];
      }

      const itemDetails = [];

      for (const item of order.items) {
        const productId = item.product?._id;

        const existingReview = await review.findOne({
          userId,
          productId,
        });

        itemDetails.push({
          productImage: item.product?.productImages?.[0]?.imageUrl || null,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          price: item.price,
          productId,
          hasReviewed: !!existingReview,
        });
      }

      groupedOrders[dateKey].push({
        orderId: order.orderId,
        productInfo: order.productInfo,
        order_type: order.order_type,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        totalAmount: order.amount,
        purchaseDate: order.purchaseDate,
        status: order.status,
        items: itemDetails,
        transactionId: order.paymentId,
      });
    }

    return res.status(200).json({
      success: true,
      groupedOrders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const Review = require("../models/review");

const createReview = async (req, res) => {
  const userId = req.user;
  const { rating, review, productId } = req.body;

  try {
    if (!productId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Product ID, rating, and review are required.",
      });
    }

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const newReview = new Review({
      userId,
      productId,
      rating,
      review,
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: newReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getOrdersHistory,
  createReview,
};
