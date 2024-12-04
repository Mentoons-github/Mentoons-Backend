const cardProduct = require("../models/cardProducts");
const User = require("../models/user");

module.exports = {
  createCardProduct: async (productData, userId) => {
    try {
      const existingUser = await User.findOne({ clerkId: userId });

      if (!existingUser) {
        throw new Error("User not Found.");
      }

      const newCardProduct = await cardProduct.create(productData);

      await newCardProduct.save();
      console.log("Newly Created Product", newCardProduct);

      return newCardProduct;
    } catch (error) {
      console.error(error);
      throw new Error("Error while Create the Product");
    }
  },

  updateCardProduct: async (productId, updatedProductData, userId) => {
    console.log("UpdatedProductData-helper", updatedProductData);
    console.log("productId-helper", productId);
    console.log("userId", userId);

    try {
      const existingUser = await User.findOne({ clerkId: userId });
      if (!existingUser) {
        throw new Error("User not found");
      }

      const existingProduct = await cardProduct.findOne({
        _id: productId.toString(),
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }
      Object.assign(existingProduct, updatedProductData);
      await existingProduct.save();
      console.log("Updated Product", existingProduct);

      return existingProduct;
    } catch (error) {
      console.log(error);
      throw new Error("Error while Create the Product");
    }
  },

  deleteCardProduct: async (productId, userId) => {
    console.log("productId-helper", productId);
    console.log("userId-helper", userId);

    try {
      const existingUser = await User.findOne({ clerkId: userId });
      if (!existingUser) {
        throw new Error("User not found");
      }

      const existingProduct = await cardProduct.findOne({
        _id: productId.toString(),
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      await cardProduct.deleteOne({ _id: productId.toString() });

      console.log("Deleted Product", existingProduct);

      return existingProduct;
    } catch (error) {
      console.log(error);
      throw new Error("Error while updating the cardProduct.");
    }
  },

  getAllCardProduct: async (search, page = 1, limit = 10, filter = {}) => {
    console.log("Helper");
    console.log("search", search);
    console.log("page", page);
    console.log("limit", limit);
    console.log("filter", filter);

    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, "i");
      const matchQuery = {
        $and: [
          {
            $or: [
              { cardTitle: { $regex: searchRegex } },
              // { cardSummary: { $regex: searchRegex } },
              // add more fields to search if needed
            ],
          },
          filter, // ensure ageFilter is an object
        ],
      };

      const allProduct = await cardProduct.aggregate([
        { $match: matchQuery },
        {
          $project: {
            _id: 1,
            cardTitle: 1,
            cardCategory: 1,
            age: 1,
            ageFilter: 1,
            cardSummary: 1,
            rating: 1,
            paperEditionPrice: 1,
            printablePrice: 1,
            cardImages: 1,
            cardVideos: 1,
            cardDescriptions: 1,
            cardReview: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);

      const totalProducts = await cardProduct.countDocuments(matchQuery);

      const totalPages = Math.ceil(totalProducts / limit);

      return { allProduct, totalProducts, totalPages, currentpage: page };
    } catch (error) {
      console.error(error);
      throw new Error("Error Fetching cardProduct from database");
    }
  },

  getCardProductById: async (productId) => {
    try {
      const product = await cardProduct
        .findById(productId)
        .populate("cardReview");

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      console.error(error);
      throw new Error("Error Fetching cardProduct form database");
    }
  },
};
