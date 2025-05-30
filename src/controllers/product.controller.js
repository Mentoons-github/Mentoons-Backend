const FriendRequest = require("../models/adda/friendRequest.js");
const {
  Product,
  AudioComic,
  Podcast,
  Comic,
  MentoonsCard,
  MentoonsBook,
} = require("../models/product.js");
const User = require("../models/user.js");

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
                { case: { $eq: ["$product_type", "Platinum"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
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
  console.log("reached productId");
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
    const videoUrls = Array.isArray(productData.videos)
      ? productData.videos.map((url) => ({ videoUrl: url }))
      : productData.videos
      ? [{ videoUrl: productData.videos }]
      : [];

    console.log("Product Data", productData);
    const data = {
      title: productData.productTitle,
      description: productData.productDescription,
      price: productData.price,
      orignalProductSrc: productData.productFile,
      ageCategory: productData.age,
      type: productData.productCategory,
      product_type: productData.subscription,
      tags: productData.tags,
      productVideos: videoUrls,
      productImages: {
        imageUrl: productData.productThumbnail,
      },
    };
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

const getMatchingAgeCategory = (age, categories) => {
  for (const category of categories) {
    if (category === "20+" && age >= 20) return category;
    const [min, max] = category.split("-").map(Number);
    if (!isNaN(min) && !isNaN(max) && age >= min && age <= max) {
      return category;
    }
  }
  return null;
};

const globalSearch = async (req, res) => {
  const { search } = req.query;

  const userId = req.user.dbUser._id;

  console.log("userId:", userId);

  if (!search || search.trim() === "") {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    // Age ranges in your system
    const ageRanges = ["6-12", "13-16", "16-19", "20+"];
    const ageFromQuery = parseInt(search.match(/\d+/)?.[0], 10);
    const matchedAgeCategory = !isNaN(ageFromQuery)
      ? getMatchingAgeCategory(ageFromQuery, ageRanges)
      : null;

    // Remove age number from search if found
    let searchText = search;
    if (matchedAgeCategory && !isNaN(ageFromQuery)) {
      searchText = search.replace(ageFromQuery.toString(), "").trim();
    }

    const textFilter = searchText
      ? {
          $or: [
            { title: { $regex: searchText, $options: "i" } },
            { tags: { $regex: searchText, $options: "i" } },
          ],
        }
      : {};

    // Helper to build product filters
    const buildFilter = () => {
      if (matchedAgeCategory) {
        return { ...textFilter, ageCategory: matchedAgeCategory };
      }
      return textFilter;
    };

    // Fetch products in parallel
    const [audioComics, podcasts, comics, mentoonsCards, mentoonsBooks] =
      await Promise.all([
        AudioComic.find(buildFilter()).limit(10),
        Podcast.find(buildFilter()).limit(10),
        Comic.find(buildFilter()).limit(10),
        MentoonsCard.find(buildFilter()).limit(10),
        MentoonsBook.find(buildFilter()).limit(10),
      ]);

    // Search users by name or email
    const matchedUsers = await User.find({
      name: { $regex: searchText, $options: "i" },
    }).limit(10);

    // Calculate follow status for each user
    const enhancedUsers = await Promise.all(
      matchedUsers.map(async (user) => {
        if (user._id.equals(userId)) {
          return { ...user.toObject(), followStatus: "self" };
        }

        const isFollowing = await User.exists({
          _id: userId,
          following: user._id,
        });

        const isFollower = await User.exists({
          _id: user._id,
          following: userId,
        });

        const isFriend = await User.exists({
          _id: userId,
          friends: user._id,
        });

        const hasRequest = await FriendRequest.exists({
          senderId: userId,
          receiverId: user._id,
        });

        let followStatus = "connect";
        if (isFriend) followStatus = "friend";
        else if (isFollowing && isFollower) followStatus = "friend";
        else if (isFollowing) followStatus = "following";
        else if (isFollower) followStatus = "follow back";
        else if (hasRequest) followStatus = "pending";

        return {
          ...user.toObject(),
          followStatus,
        };
      })
    );

    return res.status(200).json({
      audioComics,
      podcasts,
      comics,
      mentoonsCards,
      mentoonsBooks,
      users: enhancedUsers,
    });
  } catch (err) {
    console.error("Search Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getAllProducts,
  updateProduct,
  globalSearch,
};
