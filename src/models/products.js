// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     productTitle: {
//       type: String,
//       required: [true, "Product title is required"],
//       minlength: [5, "Product title must contain 5 characters"],
//       maxlength: [50, "Product title must not contain more than 50 characters"],
//     },
//     productDescription: {
//       type: String,
//       required: [true, "Product description is requuired"],
//     },
//     productCategory: {
//       type: String,
//       required: true,
//       enum: ["COMIC", "AUDIO COMIC", "PODCAST", "WORKSHOPS", "MISC"],
//       default: "MISC",
//     },
//     productThumbnail: {
//       type: String,
//       required: [true, "Product thumbnail is required"],
//     },
//     productSample: {
//       type: String,
//       required: [true, "Product Sample is required"],
//     },
//     productFile: {
//       type: String,
//       required: [true, "Product Sample is required"],
//     },
//     viewsCount: {
//       type: Number,
//       default: 0,
//     },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Author",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Export the model only if it hasn't been registered
// module.exports =
//   mongoose.models.Product || mongoose.model("Product", productSchema);
