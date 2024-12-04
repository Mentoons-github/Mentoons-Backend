const mongoose = require("mongoose");

const cardProductSchema = new mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productSummary: {
      type: String,
      required: true,
    },
    minAge: {
      type: Number,
      required: true,
    },
    maxAge: {
      type: Number,
      required: true,
    },
    ageFilter: {
      type: String,
    },
    rating: {
      type: String,
      required: true,
      default: 0,
    },
    paperEditionPrice: {
      type: Number,
      required: true,
    },
    printablePrice: {
      type: Number,
      required: true,
    },
    productImages: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },

        imageSrc: {
          type: String,
          required: true,
        },
      },
    ],
    productVideos: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        videoSrc: {
          type: String,
          required: true,
        },
      },
    ],
    productDescriptions: [
      {
        label: {
          type: String,
          required: true,
        },
        descriptionList: [
          {
            description: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    productReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CardProduct", cardProductSchema);
