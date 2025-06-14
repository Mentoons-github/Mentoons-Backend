const Orders = require("../models/Order");
const review = require("../models/review");

const getOrdersHistory = async (req, res) => {
  const userId = req.user;
  const {
    page = 1,
    limit = 5,
    year,
    month,
    day,
    sort = "-purchaseDate",
  } = req.query;

  console.log("Query params:", { page, limit, year, month, day, sort });

  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit",
      });
    }
    const skip = (pageNum - 1) * limitNum;

    const validSorts = ["purchaseDate", "-purchaseDate", "amount", "-amount"];
    const sortValue = validSorts.includes(sort) ? sort : "-purchaseDate";
    if (!validSorts.includes(sort)) {
      console.warn(`Invalid sort value: ${sort}, defaulting to -purchaseDate`);
    }

    let query = {
      user: userId,
      status: { $regex: /^success$/i },
    };

    if (year && year !== "all") {
      const yearNum = Number(year);
      if (isNaN(yearNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid year format",
        });
      }
      const startOfYear = new Date(yearNum, 0, 1);
      const endOfYear = new Date(yearNum + 1, 0, 1);
      query.purchaseDate = {
        $gte: startOfYear,
        $lt: endOfYear,
      };
    }

    if (month && month !== "all") {
      const monthIndex = new Date(`${month} 1, 2025`).getMonth();
      if (isNaN(monthIndex)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month name",
        });
      }
      const yearForMonth =
        year && year !== "all" ? Number(year) : new Date().getFullYear();
      const startOfMonth = new Date(yearForMonth, monthIndex, 1);
      const endOfMonth = new Date(yearForMonth, monthIndex + 1, 1);
      query.purchaseDate = {
        ...query.purchaseDate,
        $gte: startOfMonth,
        $lt: endOfMonth,
      };
    }

    if (day && day !== "all") {
      const dayNum = Number(day);
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        return res.status(400).json({
          success: false,
          message: "Invalid day format",
        });
      }

      if (month && month !== "all") {
        const yearForDay =
          year && year !== "all" ? Number(year) : new Date().getFullYear();
        const monthIndex = new Date(`${month} 1, 2025`).getMonth();
        const startOfDay = new Date(yearForDay, monthIndex, dayNum);
        const endOfDay = new Date(yearForDay, monthIndex, dayNum + 1);
        query.purchaseDate = {
          ...query.purchaseDate,
          $gte: startOfDay,
          $lt: endOfDay,
        };
      } else {
        query.$expr = {
          $eq: [{ $dayOfMonth: "$purchaseDate" }, dayNum],
        };
      }
    }

    const orders = await Orders.find(query)
      .sort(sortValue)
      .skip(skip)
      .limit(limitNum)
      .populate("items.product");

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

    const totalItems = await Orders.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      groupedOrders,
      totalItems,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

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

    const existingReview = await review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const newReview = new review({
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

const getOrderDates = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Orders.find({ user: userId }).select("purchaseDate");

    // Extract unique years
    const years = [
      ...new Set(
        orders.map((order) =>
          new Date(order.purchaseDate).getFullYear().toString()
        )
      ),
    ].sort((a, b) => b - a);

    // Extract unique months (as month names)
    const months = [
      ...new Set(
        orders.map((order) =>
          new Date(order.purchaseDate).toLocaleString("en-US", {
            month: "long",
          })
        )
      ),
    ].sort((a, b) => new Date(`1 ${a} 2000`) - new Date(`1 ${b} 2000`));

    // Extract unique days
    const days = [
      ...new Set(
        orders.map((order) => new Date(order.purchaseDate).getDate().toString())
      ),
    ].sort((a, b) => Number(a) - Number(b));

    res.json({ success: true, years, months, days });
  } catch (error) {
    console.error("Error fetching order dates:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch order dates" });
  }
};

module.exports = {
  getOrdersHistory,
  createReview,
  getOrderDates,
};
