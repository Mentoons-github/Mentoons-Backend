const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  deleteProduct,
  getTrendingProducts,
} = require("../controllers/productController");

const router = express.Router();

router.route("/").post(addProduct).get(getAllProducts);

router.route("/trending").get(getTrendingProducts);

router
  .route("/:productId")
  .get(getProduct)
  .patch(editProduct)
  .delete(deleteProduct);

module.exports = router;
