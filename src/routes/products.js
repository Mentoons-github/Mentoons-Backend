const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(authMiddleware, addProduct).get(getAllProducts);
router
  .route('/')
  .post(addProduct)
  .get(getAllProducts);
router
    .route('/:productId')
    .get(getProduct)
    .patch(editProduct)
    .delete(deleteProduct)


module.exports = router;
