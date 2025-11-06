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
const asyncHandler = require("../utils/asyncHandler.js");

// GET /api/products
const getProducts = async (req, res, next) => {
  const user = req.user;
  console.log("reached products");
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

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortOrder = order === "asc" ? 1 : -1;

    const queryFilter = {};
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (ageCategory) queryFilter.ageCategory = ageCategory;

    if (type === "mentoons_coloring_book") {
      queryFilter.type = "mentoons books";
      queryFilter.title = { $regex: "Coloring|Colouring", $options: "i" };
    } else if (type) {
      queryFilter.type = type;
    }

    if (cardType) queryFilter.cardType = cardType;

    const specialCardTypes = [
      "conversation starter cards",
      "story re-teller card",
      "silent stories",
      "conversation story cards",
    ];

    let matchStage = { ...queryFilter };

    if (queryFilter.cardType) {
      if (specialCardTypes.includes(queryFilter.cardType.toLowerCase())) {
        matchStage.title = {
          $regex: queryFilter.cardType,
          $options: "i",
        };
      } else {
        matchStage["details.cardType"] = {
          $regex: queryFilter.cardType,
          $options: "i",
        };
      }
      delete matchStage.cardType;
    }

    const pipeline = [
      { $match: matchStage },
      // only add $project when user is NOT logged in
      ...(user ? [] : [{ $project: { orignalProductSrc: 0 } }]),
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
      { $sort: { productTypeOrder: 1, [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limitNumber },
    ];

    const products = await Product.aggregate(pipeline);

    const total = await Product.countDocuments(matchStage);

    console.log(products);
    res.json({
      data: products,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
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

    // Process videos
    const videoUrls = Array.isArray(productData.videos)
      ? productData.videos.map((url) => ({ videoUrl: url }))
      : productData.videos
      ? [{ videoUrl: productData.videos }]
      : [];

    // Process images
    const imageUrls = Array.isArray(productData.productImages)
      ? productData.productImages.map((img) =>
          typeof img === "string"
            ? { imageUrl: img }
            : { imageUrl: img?.url || img?.imageUrl }
        )
      : productData.productImages
      ? [
          {
            imageUrl:
              typeof productData.productImages === "string"
                ? productData.productImages
                : productData.productImages?.url ||
                  productData.productImages?.imageUrl,
          },
        ]
      : [];

    // Build final product data
    const data = {
      title:
        productData.productTitle || productData.title || "Untitled Product",
      description:
        productData.productDescription || productData.description || "",
      price: productData.price || "0",
      orignalProductSrc:
        productData.productFile || productData.orignalProductSrc || "",
      ageCategory: productData.age || productData.ageCategory || "all",
      type: productData.productCategory || productData.type || "misc",
      product_type:
        productData.subscription || productData.product_type || "Free",
      isFeatured: productData.isFeatured || false,
      rating: productData.rating || "0",
      tags: productData.tags || [],
      productVideos: videoUrls,
      productImages: imageUrls,
      details: productData.details || {
        pages: "0",
        author: "",
        publisher: "",
        language: "en",
        sampleUrl: "",
        releaseDate: "",
        series: "",
        bookType: "",
        isbn: "",
        edition: "",
        dimensions: { height: "0", width: "0", depth: "0" },
      },
    };

    console.log("✅ Final Data being saved:", data);

    const product = new Product(data);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Product creation error:", error);
    next(error); // Pass to error middleware
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    if (Array.isArray(updatedData.productImages)) {
      updatedData.productImages = updatedData.productImages
        .map((img) => {
          if (typeof img === "string") {
            return { imageUrl: img };
          }
          if (typeof img === "object" && img.imageUrl) {
            return img;
          }
          return null;
        })
        .filter(Boolean);
    }

    if (Array.isArray(updatedData.productVideos)) {
      updatedData.productVideos = updatedData.productVideos
        .map((vid) => {
          if (typeof vid === "string") {
            return { videoUrl: vid };
          }
          if (typeof vid === "object" && vid.videoUrl) {
            return vid;
          }
          return null;
        })
        .filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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
  const userId = req.user?.dbUser?._id;

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
              { type: { $regex: searchText, $options: "i" } },
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

    let enhancedUsers = [];

    if (matchedUsers.length > 0) {
      if (userId) {
        enhancedUsers = await Promise.all(
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
            if (isFriend || (isFollowing && isFollower))
              followStatus = "friend";
            else if (isFollowing) followStatus = "following";
            else if (isFollower) followStatus = "follow back";
            else if (hasRequest) followStatus = "pending";

            return {
              ...user.toObject(),
              followStatus,
            };
          })
        );
      } else {
        enhancedUsers = matchedUsers.map((user) => ({
          ...user.toObject(),
          followStatus: undefined,
        }));
      }
    }

    console.log("enhanced user :", enhancedUsers);

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

const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const { productId } = req.body;

  if (!productId || !imageId) {
    return res.status(400).json({
      success: false,
      message: "productId and imageId are required",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const image = product.productImages.find(
    (img) => img.imageUrl._id.toString() === imageId
  );
  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  product.productImages = product.productImages.filter(
    (img) => img.imageUrl._id.toString() !== imageId
  );

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});

const deleteProductFile = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(404).json({
      success: false,
      message: "Product is empty",
    });
  }

  const product = await Product.findByIdAndUpdate(
    {
      _id: productId,
    },
    { $set: { orignalProductSrc: "" } },
    {
      new: true,
    }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "File removed successfully",
    product,
  });
});

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getAllProducts,
  updateProduct,
  globalSearch,
  deleteProductImage,
  deleteProductFile,
};
