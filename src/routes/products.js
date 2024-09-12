const express = require('express')
const { addProduct, getAllProducts,getProduct, editProduct } = require('../controllers/productController')

const router = express.Router()

router
  .route('/')
  .post(addProduct)
  .get(getAllProducts);
router
    .route('/:productId')
    .get(getProduct)
    .patch(editProduct)
    // .delete()


module.exports = router