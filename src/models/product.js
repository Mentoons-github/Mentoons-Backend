const mongoose = require("mongoose");

const { AgeCategory, ProductType, CardType } = require("../utils/enum");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: {
      type: Number,
      required: true,
      get: (v) => parseFloat(v.toFixed(2)),
      set: (v) => parseFloat(v),
    },
    orignalProductSrc: {
      type: String,
      required: true,
      default: "https://mentoons.com",
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
    product_type: {
      type: String,
      enum: ["Free", "Prime", "Platinum"],
    },
    isNew: { type: Boolean, required: false },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0 },

    productImages: [
      {
        imageUrl: { type: String, required: true },
      },
    ],
    productVideos: [
      {
        videoUrl: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },

    details: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

const ComicSchema = new mongoose.Schema({
  details: {
    pages: { type: Number, required: true },
    author: { type: String, required: true },
    publisher: { type: String },
    language: { type: String, default: "en" },
    sampleUrl: { type: String },
    releaseDate: { type: Date },
    series: { type: String },
  },
});
const Comic = Product.discriminator(ProductType.COMIC, ComicSchema);

const AudioComicSchema = new mongoose.Schema({
  details: {
    duration: { type: String, required: true },
    narrator: { type: String, required: true },
    language: { type: String, default: "en" },
    format: { type: String },
    sampleDuration: { type: String },
    sampleUrl: { type: String },
    releaseDate: { type: Date },
  },
});
const AudioComic = Product.discriminator(
  ProductType.AUDIO_COMIC,
  AudioComicSchema
);

const PodcastSchema = new mongoose.Schema({
  details: {
    category: { type: String, required: true },
    episodeNumber: { type: Number, required: true },
    duration: { type: String },
    language: { type: String, default: "en" },
    host: { type: String },
    sampleUrl: { type: String },
    releaseDate: { type: Date },
  },
});
const Podcast = Product.discriminator(ProductType.PODCAST, PodcastSchema);

const WorkshopSchema = new mongoose.Schema({
  details: {
    instructor: { type: String, required: true },
    location: { type: String },
    schedule: { type: Date, required: true },
    duration: { type: Number, required: true },
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

const AssessmentSchema = new mongoose.Schema({
  details: {
    color: { type: String },
    duration: { type: Number },
    difficulty: { type: String },
    credits: { type: String },
    questionGallery: {
      type: [
        {
          imageUrl: { type: String, required: true },
          options: { type: [String] },
          correctAnswer: { type: String },
        },
      ],
      required: true,
    },
  },
});
const Assessment = Product.discriminator(
  ProductType.ASSESSMENT,
  AssessmentSchema
);

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
            description: { type: String },
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
