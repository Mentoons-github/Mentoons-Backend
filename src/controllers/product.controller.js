const { Product } = require("../models/product.js");

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
      type = "",
      cardType = "",
      ageCategory = "",
    } = req.query;

    console.log("Query Params", req.query);

    // Parse pagination values
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortOrder = order === "asc" ? 1 : -1;

    // Build search filter (searching in title and description)
    const queryFilter = {};
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add filter conditions
    if (ageCategory) queryFilter.ageCategory = ageCategory;
    if (type) queryFilter.type = type;
    if (cardType) queryFilter.cardType = cardType;

    const matchStage = {
      ...queryFilter,
      ...(queryFilter.cardType && {
        "details.cardType": { $regex: queryFilter.cardType, $options: "i" },
      }),
    };

    delete matchStage.cardType; // Remove the top-level cardType since we're using it in details

    const products = await Product.aggregate([
      {
        $match: matchStage,
      },
      {
        $project: {
          orignalProductSrc: 0,
        },
      },
      {
        $addFields: {
          productTypeOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$product_type", "Free"] }, then: 1 },
                { case: { $eq: ["$product_type", "Prime"] }, then: 2 },
                { case: { $eq: ["$product_type", "Platinum"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        $sort: {
          productTypeOrder: 1,
          [sortBy]: sortOrder,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      },
    ]);
    console.log("Products", products);

    const total = await Product.countDocuments(matchStage);

    res.json({
      data: products,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    console.log("Product Data", productData);
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getAllProducts,
  updateProduct,
};
