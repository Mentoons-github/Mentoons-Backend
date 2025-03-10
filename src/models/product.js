const mongoose = require("mongoose");

const { AgeCategory, ProductType, CardType } = require("../utils/enum");

// Base Product Schema
const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { 
      type: Number, 
      required: true,
      get: v => parseFloat(v.toFixed(2)),  // Round to 2 decimal places when retrieved
      set: v => parseFloat(v)  // Ensure it's stored as a float
    },
    ageCategory: {
      type: String,
      enum: Object.values(AgeCategory),
      // required: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0 },

    productImages: [
      {
        imageUrl: { type: String, required: true },
      },
    ],
    productVideos: [
      {
        videoUrl: { type: String, required: true }, // URL to the video file
      },
    ],
    isFeatured: { type: Boolean, default: false },

    // details is a flexible field that will be refined in discriminator schemas
    details: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: "type", // this key differentiates product types
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Check if model exists before defining
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

/* ----- Comic Discriminator ----- */
const ComicSchema = new mongoose.Schema({
  details: {
    pages: { type: Number, required: true },
    author: { type: String, required: true },
    publisher: { type: String },
    language: { type: String, default: "en" },
    releaseDate: { type: Date },
    series: { type: String },
  },
});
const Comic = Product.discriminator(ProductType.COMIC, ComicSchema);

/* ----- Audio Comic Discriminator ----- */
const AudioComicSchema = new mongoose.Schema({
  details: {
    duration: { type: Number, required: true },
    narrator: { type: String, required: true },
    language: { type: String, default: "en" },
    releaseDate: { type: Date },
    sampleUrl: { type: String },
  },
});
const AudioComic = Product.discriminator(
  ProductType.AUDIO_COMIC,
  AudioComicSchema
);

/* ----- Podcast Discriminator ----- */
const PodcastSchema = new mongoose.Schema({
  details: {
    episodeNumber: { type: Number, required: true },
    host: { type: String },
    releaseDate: { type: Date },
    language: { type: String, default: "en" },
    duration: { type: Number }, // in minutes
    sampleUrl: { type: String },
  },
});
const Podcast = Product.discriminator(ProductType.PODCAST, PodcastSchema);

/* ----- Workshop Discriminator ----- */
const WorkshopSchema = new mongoose.Schema({
  details: {
    instructor: { type: String, required: true },
    location: { type: String },
    schedule: { type: Date, required: true },
    duration: { type: Number, required: true }, // in hours
    capacity: { type: Number },
    materials: { type: [String], default: [] },
    logoUrl: { type: String },
    workshopSubTitle: { type: String },
    workshopAim: { type: String },
    workshopOffering: [
      {
        title: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        accentColor: { type: String },
      },
    ],
    addressedIssues: [
      {
        title: { type: String, required: true },
        description: { type: String },
        issueIllustrationUrl: { type: String },
      },
    ],
  },
});
const Workshop = Product.discriminator(ProductType.WORKSHOP, WorkshopSchema);

/* ----- Assessment Discriminator ----- */
const AssessmentSchema = new mongoose.Schema({
  details: {
    questions: {
      type: [
        {
          questionText: { type: String, required: true },
          options: { type: [String] },
          correctAnswer: { type: String },
          explaination: { type: String },
        },
      ],
      required: true,
    },
    passingScore: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    difficulty: { type: String },
    totalQuestions: { type: Number },
    createBy: { type: String },
    createDate: { type: Date },
  },
});
const Assessment = Product.discriminator(
  ProductType.ASSESSMENT,
  AssessmentSchema
);

/* ----- MentoonsCard Discriminator ----- */
const MentoonsCardSchema = new mongoose.Schema({
  details: {
    cardType: {
      type: String,
      enum: Object.values(CardType),
      required: true,
    },
    accentColor: { type: String },
    addressedIssues: [
      {
        title: { type: String, required: true },
        description: { type: String },
        issueIllustrationUrl: { type: String },
      },
    ],
    productDescription: [
      {
        label: { type: String },
        descriptionList: [
          {
            description: { type: String }, // Fixed: Added proper type definition
          },
        ],
      },
    ],
  },
});
const MentoonsCard = Product.discriminator(
  ProductType.MENTOONS_CARDS,
  MentoonsCardSchema
);

/* ----- Merchandise Discriminator ----- */
const MerchandiseSchema = new mongoose.Schema({
  details: {
    size: { type: String },
    color: { type: String },
    materials: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    stockQuantity: { type: Number },
    description: { type: String },
    careInstructions: { type: String },
    createBy: { type: String },
    createDate: { type: Date },
  },
});

const Merchandise = Product.discriminator(
  ProductType.MERCHANDISE,
  MerchandiseSchema
);

const MentoonsBookSchema = new mongoose.Schema({
  details: {
    pages: { type: Number, required: true },
    author: { type: String, required: true },
    publisher: { type: String },
    language: { type: String, default: "en" },
    releaseDate: { type: Date },
    series: { type: String },
    bookType: { type: String },
    isbn: { type: String },
    edition: { type: String },
  },
});

const MentoonsBook = Product.discriminator(
  ProductType.MENTOONS_BOOKS,
  MentoonsBookSchema
);

/* ----- Export Models ----- */
module.exports = {
  Assessment,
  AudioComic,
  Comic,
  Podcast,
  Product,
  Workshop,
  Merchandise,
  MentoonsCard,
  MentoonsBook,
};
