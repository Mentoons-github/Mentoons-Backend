const Order = require("../../models/Order");

const ORDER_TYPE_LABELS = {
  product_purchase: "Products",
  subscription_purchase: "Subscriptions",
  consultancy_purchase: "Consultancy",
  assessment_purchase: "Assessments",
};

const getRevenueSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { status: "SUCCESS" };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [byType, monthly, totals] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$order_type",
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              orderType: "$order_type",
            },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byCategory = byType.map((entry) => ({
      orderType: entry._id || "unknown",
      label: ORDER_TYPE_LABELS[entry._id] || entry._id || "Unknown",
      revenue: entry.revenue || 0,
      orders: entry.orders || 0,
    }));

    const monthlyMap = new Map();
    for (const entry of monthly) {
      const key = `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { month: key, total: 0 });
      }
      const row = monthlyMap.get(key);
      const typeKey = entry._id.orderType || "unknown";
      row[typeKey] = entry.revenue || 0;
      row.total += entry.revenue || 0;
    }

    const monthlyTrend = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue: totals[0]?.revenue || 0,
        totalOrders: totals[0]?.orders || 0,
        byCategory,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Revenue summary error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch revenue summary",
      error: error.message,
    });
  }
};

/**
 * GET /revenue/orders?orderType=product_purchase&startDate=&endDate=&page=1&limit=20&search=
 *
 * Returns the individual successful orders for one category (order_type),
 * with the purchasing user's details and purchase date, paginated.
 */
const getRevenueOrdersByCategory = async (req, res) => {
  try {
    const {
      orderType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    if (!orderType) {
      return res.status(400).json({
        status: "error",
        message: "orderType is required",
      });
    }

    const match = { status: "SUCCESS", order_type: orderType };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { customerName: regex },
        { email: regex },
        { orderId: regex },
        { phone: regex },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(match)
        .populate("user", "name email phoneNumber picture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select(
          "orderId user customerName email phone amount totalAmount status productInfo createdAt paymentMethod items",
        )
        .lean(),
      Order.countDocuments(match),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      orderId: order.orderId,
      customerName: order.user?.name || order.customerName || "Unknown",
      email: order.user?.email || order.email || "-",
      phone: order.user?.phoneNumber || order.phone || "-",
      picture: order.user?.picture || null,
      amount: order.amount,
      status: order.status,
      productInfo: order.productInfo,
      paymentMethod: order.paymentMethod || "-",
      itemCount: Array.isArray(order.items) ? order.items.length : 0,
      createdAt: order.createdAt,
    }));

    res.status(200).json({
      status: "success",
      data: {
        orderType,
        label: ORDER_TYPE_LABELS[orderType] || orderType,
        orders: formattedOrders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error("Revenue orders error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch revenue orders",
      error: error.message,
    });
  }
};

module.exports = { getRevenueSummary, getRevenueOrdersByCategory };
