const mongoose = require("mongoose");
const Review = require("../models/review");
const User = require("../models/user");
const Product = require("../models/products");
module.exports = {
  createReview: async (userId, productId, rating, review) => {
    
    try {
      const user = await User.findOne({ clerkId: userId });

      if (!user) {
        throw new Error("User not Found.");
      }
      const product = await Product.findOne({
        _id: productId,
      });

      if (!product) {
        throw new Error("Product Not Found");
      }

      const newReview = await Review.create({
        userId,
        productId,
        rating,
        review,
      });

      await newReview.save();
      console.log("Newly Created Review:", newReview);
      return newReview;
    } catch (error) {
      console.log(error);
    }
  },

  updateReview: async (userId, reviewId, rating, review) => {
    try {
      const existingReview = await Review.findById(reviewId);

      if (!existingReview) {
        throw new Error("Review not found.");
      }

      if (existingReview.userId.toString() !== userId) {
        throw new Error("User not authorized to update this review.");
      }

      existingReview.rating = rating;
      existingReview.review = review;

      await existingReview.save();
      console.log("Updated Review:", existingReview);
      return existingReview;
    } catch (error) {
      console.error("Error updating review:", error);
    }
  },
  deleteReview: async (userId, reviewId) => {
    try {
      const existingReview = await Review.findById(reviewId);

      if (!existingReview) {
        throw new Error("Review not found.");
      }

      if (existingReview.userId.toString() !== userId) {
        throw new Error("User not authorized to delete this review.");
      }

      await Review.deleteOne({ _id: reviewId });
      console.log("Deleted Review:", reviewId);

      return existingReview;
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  },
};
