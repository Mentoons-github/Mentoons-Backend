const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  deleteProduct,
  getTrendingProducts,
} = require("../controllers/productController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/")
  .post(authMiddleware, addProduct)
  .get(getAllProducts);

router.route("/trending")
  .get(getTrendingProducts);

router.route("/:productId")
  .get(getProduct)
  .patch(authMiddleware, editProduct)
  .delete(authMiddleware, deleteProduct);


module.exports = router;
