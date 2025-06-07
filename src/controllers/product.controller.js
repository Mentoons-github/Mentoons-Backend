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

    console.log("search query : ", queryFilter);

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

const getMatchingAgeCategory = (age, ageRanges) => {
  for (let range of ageRanges) {
    const [min, max] = range.split("-").map(Number);
    if (!isNaN(max) && age >= min && age <= max) return range;
    if (isNaN(max) && age >= min) return range;
  }
  return null;
};

const globalSearch = async (req, res) => {
  const { search } = req.query;
  const userId = req.user.dbUser._id;

  if (!search || search.trim() === "") {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    const ageRanges = ["6-12", "13-16", "17-19", "20+"];
    const ageFromQuery = parseInt(search.match(/\d+/)?.[0], 10);
    const matchedAgeCategory = !isNaN(ageFromQuery)
      ? getMatchingAgeCategory(ageFromQuery, ageRanges)
      : null;

    let searchText = search;
    if (matchedAgeCategory && !isNaN(ageFromQuery)) {
      searchText = search.replace(ageFromQuery.toString(), "").trim();
    }

    const normalizeSearch = (text = "") =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "")
        .trim();

    const normalizedSearch = normalizeSearch(searchText);

    const collectionKeywords = {
      podcast: ["podcasts"],
      mentooncard: ["mentoonsCards"],
      mentoonsbook: ["mentoonsBooks"],
      book: ["mentoonsBooks"],
      books: ["mentoonsBooks"],
      card: ["mentoonsCards"],
      comic: ["comics", "audioComics"],
      comics: ["comics", "audioComics"],
      product: ["products"],
      products: ["products"],
    };

    let matchedCollections = [
      ...new Set(
        Object.entries(collectionKeywords)
          .filter(([key]) => normalizedSearch.includes(key))
          .flatMap(([, collections]) =>
            Array.isArray(collections) ? collections : [collections]
          )
      ),
    ];

    const collectionsToSearch = matchedCollections.length
      ? matchedCollections
      : [
          "audioComics",
          "podcasts",
          "comics",
          "mentoonsCards",
          "mentoonsBooks",
          "products",
        ];

    console.log("🔎 Raw Search Query:", search);
    console.log("🔤 Normalized:", normalizedSearch);
    console.log("📁 Collections Matched:", matchedCollections);
    console.log("📁 Final Collections to Search:", collectionsToSearch);
    console.log("🧒 Age Category:", matchedAgeCategory);

    const buildFilter = (collectionName) => {
      const collectionKeys = Object.keys(collectionKeywords);
      if (
        collectionKeys.includes(normalizedSearch) &&
        matchedCollections.includes(collectionName)
      ) {
        return {};
      }

      const textFilter = searchText
        ? {
            $or: [
              { title: { $regex: searchText, $options: "i" } },
              { tags: { $regex: searchText, $options: "i" } },
            ],
          }
        : {};

      const collectionsWithAge = [
        "audioComics",
        "podcasts",
        "comics",
        "mentoonsCards",
        "mentoonsBooks",
        "products",
      ];

      const shouldFilterByAge =
        matchedAgeCategory && collectionsWithAge.includes(collectionName);

      return shouldFilterByAge
        ? { ...textFilter, ageCategory: matchedAgeCategory }
        : textFilter;
    };

    const [
      audioComics,
      podcasts,
      comics,
      mentoonsCards,
      mentoonsBooks,
      products,
    ] = await Promise.all([
      collectionsToSearch.includes("audioComics")
        ? AudioComic.find(buildFilter("audioComics")).limit(10)
        : [],
      collectionsToSearch.includes("podcasts")
        ? Podcast.find(buildFilter("podcasts")).limit(10)
        : [],
      collectionsToSearch.includes("comics")
        ? Comic.find(buildFilter("comics")).limit(10)
        : [],
      collectionsToSearch.includes("mentoonsCards")
        ? MentoonsCard.find(buildFilter("mentoonsCards")).limit(10)
        : [],
      collectionsToSearch.includes("mentoonsBooks")
        ? MentoonsBook.find(buildFilter("mentoonsBooks")).limit(10)
        : [],
      collectionsToSearch.includes("products")
        ? Product.find(buildFilter("products"))
        : [],
    ]);

    let matchedUsers = [];

    if (searchText && isNaN(searchText)) {
      matchedUsers = await User.find({
        name: { $regex: "^" + searchText, $options: "i" },
      }).limit(10);
    }

    const enhancedUsers = await Promise.all(
      matchedUsers.map(async (user) => {
        if (user._id.equals(userId)) {
          return { ...user.toObject(), followStatus: "self" };
        }

        const [isFollowing, isFollower, isFriend, hasRequest] =
          await Promise.all([
            User.exists({ _id: userId, following: user._id }),
            User.exists({ _id: user._id, following: userId }),
            User.exists({ _id: userId, friends: user._id }),
            FriendRequest.exists({
              senderId: userId,
              receiverId: user._id,
            }),
          ]);

        let followStatus = "connect";
        if (isFriend || (isFollowing && isFollower)) followStatus = "friend";
        else if (isFollowing) followStatus = "following";
        else if (isFollower) followStatus = "follow back";
        else if (hasRequest) followStatus = "pending";

        return {
          ...user.toObject(),
          followStatus,
        };
      })
    );

    console.log("🎯 AudioComics:", audioComics.length);
    console.log("🎯 Podcasts:", podcasts.length);
    console.log("🎯 Comics:", comics.length);
    console.log("🎯 MentoonsCards:", mentoonsCards.length);
    console.log("🎯 MentoonsBooks:", mentoonsBooks.length);
    console.log("🎯 Products:", products.length);
    console.log("👥 Users:", enhancedUsers.length);

    return res.status(200).json({
      audioComics,
      podcasts,
      comics,
      mentoonsCards,
      mentoonsBooks,
      products,
      users: enhancedUsers,
    });
  } catch (err) {
    console.error("❌ Search Error:", err);
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
